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

        const { diagnosisId, messages } = await req.json();

        const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let systemInstruction = `Jesteś wirtualnym asystentem serwisowym (mechanikiem samochodowym). Odpowiadaj profesjonalnie na pytania klienta. 
Posiadasz szeroką wiedzę ogólną o mechanice pojazdowej i powinieneś ją wykorzystywać do wyjaśniania pojęć (np. co to jest pasek klinowy). 
Jeśli to możliwe, podaj krótką odpowiedź główną oraz szczegółowe informacje (przyczyny, rozwiązania) w osobnym polu.
MUSISZ zwrócić odpowiedź jako czysty obiekt JSON: { "text": "odpowiedź główna", "detailedInfo": "opcjonalne szczegóły z punktorami (przyczyny, zalecenia) lub pomiń to pole" }`;

        if (diagnosisId) {
            const diagnosis = await prisma.diagnosis.findUnique({
                where: { id: diagnosisId }
            });

            if (diagnosis && diagnosis.userId === user.id) {
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

        const fallbackModels = [
            "gemini-3.1-flash-preview", // primary per user request
            "gemini-3.0-pro",
            "gemini-3.0-flash",
            "gemini-3.1-pro-preview",
            "gemini-2.0-flash",
            "gemini-1.5-flash"
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
                        systemInstruction: systemInstruction,
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

        return NextResponse.json({ status: "success", data });

    } catch (error: any) {
        console.error("[Sonic] Chat API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
