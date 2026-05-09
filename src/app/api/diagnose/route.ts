import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStorage, getBucketName, getGenAI } from "@/lib/google-clients";
import prisma from "@/lib/prisma";
import { diagnosisResponseSchema, SYSTEM_INSTRUCTION } from "@/lib/diagnosis-schema";
import type { DiagnoseApiResponse, Diagnosis } from "@/types/diagnosis";

// Disable Next.js body parser — we handle FormData manually.
export const runtime = "nodejs";

/**
 * Map common file extensions to MIME types that Gemini understands.
 * Falls back to application/octet-stream for unknown types.
 */
function guessMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    webm: "audio/webm",
    mp3: "audio/mp3",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/m4a",
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
  };
  return map[ext] || "application/octet-stream";
}

// POST /api/diagnose
export async function POST(
  request: NextRequest
): Promise<NextResponse<DiagnoseApiResponse | { status: "error"; message: string }>> {
  // Will hold the GCS file paths so we can delete them in `finally`.
  const gcsFilePaths: string[] = [];

  try {
    // ------------------------------------------------------------------
    // Step 0: Gatekeeper (Auth & Credits)
    // ------------------------------------------------------------------
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "Nie jesteś zalogowany." },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    // Fallback: create user in DB if clerk webhook was missed or delayed
    if (!user) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        user = await prisma.user.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            credits: 0, // No free credits by default
          }
        });
      } else {
        return NextResponse.json(
          { status: "error", message: "Błąd uwierzytelniania." },
          { status: 401 }
        );
      }
    // ------------------------------------------------------------------
    // Rate Limiting Check
    // ------------------------------------------------------------------
    const now = new Date();
    const lastScan = user.lastScanDate ? new Date(user.lastScanDate) : null;
    
    // Check if it's a new day (UTC)
    const isNewDay = !lastScan || 
      lastScan.getUTCDate() !== now.getUTCDate() || 
      lastScan.getUTCMonth() !== now.getUTCMonth() || 
      lastScan.getUTCFullYear() !== now.getUTCFullYear();

    let currentDailyScans = isNewDay ? 0 : user.dailyFreeScans;

    if (currentDailyScans >= 5) {
      return NextResponse.json(
        { status: "error", message: "Osiągnięto dzienny limit (5) darmowych skanów. Wróć jutro lub odblokuj istniejące raporty." },
        { status: 429 }
      );
    }

    // ------------------------------------------------------------------
    // Step 1: Parse incoming FormData
    // ------------------------------------------------------------------
    const formData = await request.formData();
    const filePartsString = formData.get("fileParts") as string;
    const vehicleType = (formData.get("vehicleType") as string) || "auto";
    const vehicleMake = (formData.get("vehicleMake") as string) || "";
    const vehicleDetails = (formData.get("vehicleDetails") as string) || "";
    const userContext = (formData.get("context") as string) || "";
    const isFollowUp = formData.get("isFollowUp") === "true";
    const locale = (formData.get("locale") as string) || "pl";
    let fileParts: any[] = [];

    if (filePartsString) {
      try {
        fileParts = JSON.parse(filePartsString);
        // Track for cleanup
        fileParts.forEach(fp => {
          if (fp.fileData && fp.fileData.fileUri) {
            const uri = fp.fileData.fileUri as string;
            const parts = uri.split('/');
            const filename = parts.pop();
            if (filename) gcsFilePaths.push(`diagnostics/${filename}`);
          }
        });
      } catch (e) {
        console.error("[Sonic] Failed to parse fileParts", e);
      }
    }

    if (!fileParts || fileParts.length === 0) {
      return NextResponse.json(
        { status: "error" as const, message: "Brak pliku do analizy." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------
    // Step B: Call Vertex AI (Gemini) with ALL files + user context
    // ------------------------------------------------------------------
    const ai = getGenAI();

    // Build the user context string
    const contextParts: string[] = [];
    contextParts.push(`Category: ${vehicleType === 'bike' ? 'Bicycle / Bike' : 'Car / Vehicle'}`);
    if (vehicleMake) contextParts.push(`Vehicle/Model: ${vehicleMake}`);
    if (vehicleDetails) contextParts.push(`Details: ${vehicleDetails}`);
    if (userContext) contextParts.push(`Problem Description: ${userContext}`);

    // Session context: tell AI how many files and what stage we're in
    if (isFollowUp) {
      contextParts.push(`\nSESSION NOTE: I am sending you ${fileParts.length} files. Some of them are the original material of the fault, and subsequent ones are materials after performing a physical test (Follow-Up). You MUST respond with 'complete' status and issue a final diagnosis.`);
    } else {
      contextParts.push(`\nSESSION NOTE: This is the FIRST stage of the diagnostic session (${fileParts.length} initial files sent). You can respond with 'follow_up' if you need an additional physical test, or 'complete' if the diagnosis is obvious.`);
    }

    const contextText =
      contextParts.length > 0
        ? contextParts.join("\n")
        : "The user did not provide additional context. Perform the analysis based solely on the provided file.";

    const systemPrompt = SYSTEM_INSTRUCTION + '\n\n' + `CRITICAL: All descriptive text fields in the generated report (and chat responses) MUST be written in the language specified by the following code: ${locale} (pl = Polish, en = English, de = German, es = Spanish).`;

    // ------------------------------------------------------------------
    // Step C: Generate structured diagnosis using JSON Schema
    // ------------------------------------------------------------------
    const fallbackModels = [
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite-preview",
      "gemini-3.0-pro",
      "gemini-3.0-flash",
      "gemini-2.0-flash" // last resort
    ];

    let rawText: string | null = null;
    let usedModelId: string | null = null;
    let lastError: Error | null = null;

    for (const modelId of fallbackModels) {
      try {
        console.log(`[Sonic] Attempting AI generation with model: ${modelId}`);
        const response = await ai.models.generateContent({
          model: modelId,
          contents: [
            {
              role: "user",
              parts: [
                ...fileParts,
                {
                  text: contextText,
                },
              ],
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: diagnosisResponseSchema,
            temperature: 0.2,
            topK: 20,
            topP: 0.8,
          },
        });

        if (response.text) {
          rawText = response.text;
          usedModelId = modelId;
          console.log(`[Sonic] Successfully generated response with model: ${modelId}`);
          break; // success, exit the fallback loop
        }
      } catch (err) {
        console.warn(`[Sonic] Model ${modelId} failed:`, err instanceof Error ? err.message : String(err));
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    if (!rawText) {
      throw new Error(`All AI models failed or returned empty response. Last error: ${lastError?.message}`);
    }

    const resJson = JSON.parse(rawText);
    const aiResponse = resJson;

    // Log the outcome
    console.log(`[Sonic] AI Response status: ${aiResponse.status}`);
    if (aiResponse.status === "follow_up") {
      console.log(`[Sonic] FollowUp requested: ${aiResponse.follow_up_request?.action_required}`);
    } else {
      console.log(`[Sonic] Diagnosis complete: "${aiResponse.final_diagnosis?.title}" (${aiResponse.final_diagnosis?.confidence_score}%)`);

      const hasCredits = user.credits > 0;

      // Transaction: Record diagnosis AND decrement credits if they have them
      const transactions: any[] = [];

      transactions.push(
        prisma.diagnosis.create({
          data: {
            userId: user.id,
            vehicleData: JSON.stringify({ type: vehicleType, make: vehicleMake, details: vehicleDetails }),
            symptoms: userContext,
            aiReport: aiResponse as any,
            isUnlocked: hasCredits
          } as any
        })
      );

      const userUpdateData: any = {
        dailyFreeScans: currentDailyScans + 1,
        lastScanDate: now
      };

      if (hasCredits) {
        userUpdateData.credits = { decrement: 1 };
      }

      transactions.push(
        prisma.user.update({
          where: { id: user.id },
          data: userUpdateData
        })
      );

      const results = await prisma.$transaction(transactions);
      const diagnosisRecord = results[0];

      let finalAiResponse = aiResponse;
      if (!hasCredits && finalAiResponse.final_diagnosis) {
        // Deep copy
        finalAiResponse = JSON.parse(JSON.stringify(aiResponse));
        let hiddenMsg = "[UKRYTE DLA WERSJI DARMOWEJ]";
        if (locale === 'en') hiddenMsg = "[HIDDEN IN FREE VERSION]";
        else if (locale === 'de') hiddenMsg = "[IN DER KOSTENLOSEN VERSION VERBORGEN]";
        else if (locale === 'es') hiddenMsg = "[OCULTO EN VERSIÓN GRATUITA]";

        finalAiResponse.final_diagnosis.audio_analysis = hiddenMsg as any;
        finalAiResponse.final_diagnosis.recommended_actions = hiddenMsg as any;
        finalAiResponse.final_diagnosis.diy_repair_guide = hiddenMsg;
        finalAiResponse.final_diagnosis.parameters = hiddenMsg as any;
      }

      // ------------------------------------------------------------------
      // Step D: Return the structured response
      // ------------------------------------------------------------------
      return NextResponse.json({
        status: "success" as const,
        aiResponse: finalAiResponse,
        diagnosis: finalAiResponse.final_diagnosis, // legacy mapping if needed
        diagnosisId: diagnosisRecord.id, // return the DB ID
        usedModel: usedModelId || "unknown"
      });
    }

    // ------------------------------------------------------------------
    // Step D: Return the structured response (follow up case)
    // ------------------------------------------------------------------
    return NextResponse.json({
      status: "success" as const,
      aiResponse,
      diagnosis: aiResponse.final_diagnosis, // legacy mapping if needed
      usedModel: usedModelId || "unknown"
    });
  } catch (err) {
    console.error("[Sonic] Diagnosis API error:", err);

    const message =
      err instanceof Error ? err.message : "Nieznany błąd serwera.";

    return NextResponse.json(
      { status: "error" as const, message },
      { status: 500 }
    );
  } finally {
    // ------------------------------------------------------------------
    // Cleanup: delete all files from GCS regardless of success/failure
    // ------------------------------------------------------------------
    for (const path of gcsFilePaths) {
      if (path) {
        try {
          const storage = getStorage();
          const bucket = storage.bucket(getBucketName());
          await bucket.file(path).delete();
          console.log(`[Sonic] Cleaned up GCS file: ${path}`);
        } catch (cleanupErr) {
          console.warn("[Sonic] Failed to clean up GCS file:", cleanupErr);
        }
      }
    }
  }
}
