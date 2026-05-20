import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getGenAI } from "@/lib/google-clients";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { diagnosisId, messages, locale = 'pl' } = body;

        const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let systemInstruction = `Jesteś wirtualnym asystentem serwisowym (mechanikiem samochodowym). Odpowiadaj profesjonalnie na pytania klienta. 
Posiadasz szeroką wiedzę ogólną o mechanice pojazdowej i powinieneś ją wykorzystywać do wyjaśniania pojęć (np. co to jest pasek klinowy). 
Jeśli to możliwe, podaj krótką odpowiedź główną oraz szczegółowe informacje (przyczyny, rozwiązania) w osobnym polu.
MUSISZ zwrócić odpowiedź jako czysty obiekt JSON: { "text": "odpowiedź główna", "detailedInfo": "opcjonalne szczegóły z punktorami (przyczyny, zalecenia) lub pomiń to pole" }`;

        let currentDiagnosis: any = null;

        if (diagnosisId) {
            const diagnosis = await prisma.diagnosis.findUnique({
                where: { id: diagnosisId }
            });

            if (diagnosis && diagnosis.userId === user.id) {
                const diagAny = diagnosis as any;
                if (!diagAny.isUnlocked) {
                    return NextResponse.json({ error: "Raport nie jest odblokowany." }, { status: 403 });
                }

                if (diagAny.chatMessageCount >= 5) {
                    return NextResponse.json({ error: "Limit wiadomości dla tego raportu został wyczerpany." }, { status: 403 });
                }

                currentDiagnosis = diagnosis;
                systemInstruction = `Jesteś wirtualnym asystentem serwisowym. Odpowiadaj profesjonalnie na pytania klienta. 
Posiadasz szeroką wiedzę ogólną o mechanice pojazdowej, którą powinieneś wykorzystywać, ale w swoich odpowiedziach ZAWSZE odnoś się do wyników załączonego raportu diagnostycznego pojazdu klienta: \n\n${JSON.stringify(diagnosis.aiReport)}\n\nOdpowiedz jako mechanik. Jeśli to możliwe, podaj krótką odpowiedź główną oraz szczegółowe informacje (przyczyny, rozwiązania) w osobnym polu. MUSISZ zwrócić odpowiedź jako czysty obiekt JSON: { "text": "odpowiedź główna", "detailedInfo": "opcjonalne szczegóły z punktorami (przyczyny, zalecenia) lub pomiń to pole" }`;
            }
        }

        const ai = getGenAI();

        // Reconstruct history
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        const lastMessage = messages[messages.length - 1];

        const systemPromptWithLocale = systemInstruction + '\n\n' + `KRYTYCZNE: Wszystkie odpowiedzi na czacie MUSZĄ być napisane w języku oznaczonym kodem:${locale} (pl = Polski, en = Angielski, es = Hiszpański).`;

        const fallbackModels = [
            "gemini-3.1-pro-preview",
            "gemini-3.5-flash",
            "gemini-3.5-pro",
            "gemini-3.1-flash-preview",
            "gemini-3.0-pro",
            "gemini-3.0-flash",
            "gemini-2.0-flash"
        ];

        let rawText: string | null = null;
        let lastError: Error | null = null;

        for (const modelId of fallbackModels) {
            try {
                console.log(`[Sonic Chat] Attempting AI generation with model: ${modelId}`);
                const response = await ai.models.generateContent({
                    model: modelId,
                    contents: [
                        ...history,
                        {
                            role: "user",
                            parts: [{ text: lastMessage.text }]
                        }
                    ],
                    config: {
                        systemInstruction: systemPromptWithLocale,
                        responseMimeType: "application/json",
                        temperature: 0.3,
                    },
                });

                if (response.text) {
                    rawText = response.text;
                    console.log(`[Sonic Chat] Successfully generated response with model: ${modelId}`);
                    break;
                }
            } catch (err) {
                console.warn(`[Sonic Chat] Model ${modelId} failed:`, err instanceof Error ? err.message : String(err));
                lastError = err instanceof Error ? err : new Error(String(err));
            }
        }

        if (!rawText) {
            throw new Error(`All AI models failed or returned empty response. Last error: ${lastError?.message}`);
        }

        const data = JSON.parse(rawText);

        if (currentDiagnosis) {
            await prisma.diagnosis.update({
                where: { id: currentDiagnosis.id },
                data: { chatMessageCount: { increment: 1 } } as any
            });
        }

        return NextResponse.json({ status: "success", data });

    } catch (error: any) {
        console.error("[Sonic] Chat API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
