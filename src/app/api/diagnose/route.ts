import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getStorage, getBucketName, getGenAI } from "@/lib/google-clients";
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
    // Step A: Parse incoming FormData
    // ------------------------------------------------------------------
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    const vehicleMake = (formData.get("vehicleMake") as string) || "";
    const vehicleDetails = (formData.get("vehicleDetails") as string) || "";
    const userContext = (formData.get("context") as string) || "";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: "error" as const, message: "Brak pliku do analizy." },
        { status: 400 }
      );
    }

    const storage = getStorage();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);
    
    // Upload all files
    const fileParts: any[] = [];
    
    for (const file of files) {
      if (file.size === 0) continue;
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || guessMimeType(file.name);
      const ext = file.name?.split(".").pop()?.toLowerCase() || "bin";
      
      const gcsFilePath = `diagnostics/${randomUUID()}.${ext}`;
      gcsFilePaths.push(gcsFilePath);
      const gcsFile = bucket.file(gcsFilePath);
  
      await gcsFile.save(buffer, {
        metadata: { contentType: mimeType },
        resumable: false,
      });
  
      const fileUri = `gs://${bucketName}/${gcsFilePath}`;
      console.log(`[Sonic] Uploaded file to ${fileUri} (${buffer.length} bytes)`);
      
      fileParts.push({
        fileData: {
          fileUri,
          mimeType,
        },
      });
    }

    // ------------------------------------------------------------------
    // Step B: Call Vertex AI (Gemini) with ALL files + user context
    // ------------------------------------------------------------------
    const ai = getGenAI();

    // Build the user context string
    const contextParts: string[] = [];
    if (vehicleMake) contextParts.push(`Pojazd: ${vehicleMake}`);
    if (vehicleDetails) contextParts.push(`Szczegóły: ${vehicleDetails}`);
    if (userContext) contextParts.push(`Opis problemu: ${userContext}`);

    const contextText =
      contextParts.length > 0
        ? contextParts.join("\n")
        : "Użytkownik nie podał dodatkowego kontekstu. Wykonaj analizę na podstawie samego pliku.";

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
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: diagnosisResponseSchema,
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
    }

    // ------------------------------------------------------------------
    // Step D: Return the structured response
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
