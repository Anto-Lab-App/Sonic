import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getStorage, getBucketName, getGenAI } from "@/lib/google-clients";
import { Type as SchemaType } from "@google/genai";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION = `You are SONIC — A vehicle and machine identification expert (like Shazam for cars).
Your task is to recognize the make, model, and engine type based on audio or video/photo material.
You focus on visual detection (bodywork, interior details) and acoustic detection (exhaust tone, turbo whistle, characteristic V8 bass).
You must return the response in the language specified by the user in strict JSON format.
Remember that you return a 'specs' array with technical details. Return only raw strings for icons: "Gauge", "Wind", "Hash", "Car".

Example icons for specs:
- Engine Capacity -> "Gauge"
- Power -> "Wind"
- Engine Layout -> "Hash"
- Other -> "Car"
`;

const identificationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: "Make and model, e.g. 'Ford Mustang GT'" },
    engine: { type: SchemaType.STRING, description: "Engine designation, e.g. '5.0L Coyote V8'" },
    confidence: { type: SchemaType.INTEGER, description: "Identification confidence in % (0-100)" },
    description: { type: SchemaType.STRING, description: "Short description justifying the recognition." },
    specs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          label: { type: SchemaType.STRING },
          value: { type: SchemaType.STRING },
          icon: { type: SchemaType.STRING, description: "One of the values: 'Gauge', 'Wind', 'Hash', 'Car'" },
        },
        required: ["label", "value", "icon"],
      },
    },
  },
  required: ["name", "engine", "confidence", "description", "specs"],
};

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

export async function POST(request: NextRequest) {
  const gcsFilePaths: string[] = [];

  try {
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
    }

    // We allow identification even with 0 credits, but we blur the result.
    /*
    if (user.credits < 1) {
      return NextResponse.json(
        { status: "error", message: "Brak darmowych skanów. Wykup pakiet PRO." },
        { status: 403 }
      );
    }
    */

    const formData = await request.formData();
    const filePartsString = formData.get("fileParts") as string;
    const context = (formData.get("context") as string) || "";
    const locale = (formData.get("locale") as string) || "pl";

    let fileParts: any[] = [];
    if (filePartsString) {
      try {
        fileParts = JSON.parse(filePartsString);
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
      return NextResponse.json({ status: "error", message: "Brak pliku do identyfikacji." }, { status: 400 });
    }

    const ai = getGenAI();

    let contextText = "Vehicle/engine identification (Shazam).";
    if (context) {
      contextText += ` Additional context from user: ${context}`;
    }

    const fallbackModels = [
      "gemini-3.1-pro-preview",
      "gemini-3.0-pro",
      "gemini-3.1-flash-lite-preview",
      "gemini-2.0-flash"
    ];

    let rawText: string | null = null;

    for (const modelId of fallbackModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: [
            {
              role: "user",
              parts: [
                ...fileParts,
                { text: contextText },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION + '\n\n' + `CRITICAL: All descriptive text fields in the generated response MUST be written in the language specified by the following code: ${locale} (pl = Polish, en = English, de = German, es = Spanish).`,
            responseMimeType: "application/json",
            responseSchema: identificationSchema,
            temperature: 0.3,
          },
        });

        if (response.text) {
          rawText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`[Sonic] Model ${modelId} failed for identify:`, err);
      }
    }

    if (!rawText) {
      throw new Error("Wszystkie modele AI zawiodły przy identyfikacji.");
    }

    const result = JSON.parse(rawText);

    const hasCredits = user.credits > 0;

    // Transaction: Decrement credits on successful identification
    if (hasCredits) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } }
      });
    }

    let finalData = result;
    if (!hasCredits) {
      let hiddenMsg = "[UKRYTE DLA WERSJI DARMOWEJ]";
      let hiddenDesc = "Rozpoznano model pojazdu, ale szczegółowe dane są dostępne po odblokowaniu raportu.";

      if (locale === 'en') {
        hiddenMsg = "[HIDDEN IN FREE VERSION]";
        hiddenDesc = "Vehicle model recognized, but detailed data is available after unlocking the report.";
      } else if (locale === 'de') {
        hiddenMsg = "[IN DER KOSTENLOSEN VERSION VERBORGEN]";
        hiddenDesc = "Fahrzeugmodell erkannt, aber detaillierte Daten są erst nach Freischaltung des Berichts verfügbar.";
      } else if (locale === 'es') {
        hiddenMsg = "[OCULTO EN VERSIÓN GRATUITA]";
        hiddenDesc = "Modelo de vehículo reconocido, pero los datos detallados están disponibles tras desbloquear el informe.";
      }

      finalData = {
        ...result,
        name: hiddenMsg,
        engine: hiddenMsg,
        description: hiddenDesc,
        specs: result.specs.map((s: any) => ({ ...s, value: "***" }))
      };
    }

    return NextResponse.json({ status: "success", data: finalData });

  } catch (err: unknown) {
    console.error("[Sonic] API Identify route error:", err);
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd serwera." },
      { status: 500 }
    );
  } finally {
    // Delete files from bucket
    if (gcsFilePaths.length > 0) {
      const storage = getStorage();
      const bucketName = getBucketName();
      const bucket = storage.bucket(bucketName);
      for (const path of gcsFilePaths) {
        try {
          await bucket.file(path).delete();
        } catch (e) {
          console.error(`Failed to delete ${path} from GCS:`, e);
        }
      }
    }
  }
}
