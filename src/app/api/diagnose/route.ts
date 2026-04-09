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
  // Will hold the GCS file path so we can delete it in `finally`.
  let gcsFilePath: string | null = null;

  try {
    // ------------------------------------------------------------------
    // Step A: Parse incoming FormData
    // ------------------------------------------------------------------
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const vehicleMake = (formData.get("vehicleMake") as string) || "";
    const vehicleDetails = (formData.get("vehicleDetails") as string) || "";
    const userContext = (formData.get("context") as string) || "";

    if (!file || file.size === 0) {
      return NextResponse.json(
        { status: "error" as const, message: "Brak pliku do analizy." },
        { status: 400 }
      );
    }

    // Read the file into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || guessMimeType(file.name);

    // Determine file extension
    const ext = file.name?.split(".").pop()?.toLowerCase() || "bin";

    // ------------------------------------------------------------------
    // Step A (cont): Upload to Google Cloud Storage
    // ------------------------------------------------------------------
    const storage = getStorage();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    gcsFilePath = `diagnostics/${randomUUID()}.${ext}`;
    const gcsFile = bucket.file(gcsFilePath);

    await gcsFile.save(buffer, {
      metadata: { contentType: mimeType },
      resumable: false, // Small files don't need resumable uploads
    });

    const fileUri = `gs://${bucketName}/${gcsFilePath}`;
    console.log(`[Sonic] Uploaded file to ${fileUri} (${buffer.length} bytes)`);

    // ------------------------------------------------------------------
    // Step B: Call Vertex AI (Gemini) with the file + user context
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
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri,
                mimeType,
              },
            },
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

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    const diagnosis: Diagnosis = JSON.parse(rawText);
    console.log(`[Sonic] Diagnosis complete: "${diagnosis.title}" (${diagnosis.confidence_score}%)`);

    // ------------------------------------------------------------------
    // Step D: Return the structured response
    // ------------------------------------------------------------------
    return NextResponse.json({
      status: "success" as const,
      diagnosis,
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
    // Cleanup: delete the file from GCS regardless of success/failure
    // ------------------------------------------------------------------
    if (gcsFilePath) {
      try {
        const storage = getStorage();
        const bucket = storage.bucket(getBucketName());
        await bucket.file(gcsFilePath).delete();
        console.log(`[Sonic] Cleaned up GCS file: ${gcsFilePath}`);
      } catch (cleanupErr) {
        // Don't let cleanup failure mask the real error
        console.warn("[Sonic] Failed to clean up GCS file:", cleanupErr);
      }
    }
  }
}
