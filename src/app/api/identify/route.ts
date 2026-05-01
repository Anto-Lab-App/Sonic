import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getStorage, getBucketName, getGenAI } from "@/lib/google-clients";
import { Type as SchemaType } from "@google/genai";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION = `Jesteś SONIC — Ekspertem od identyfikacji pojazdów i maszyn (jak aplikacja Shazam dla aut).
Twoim zadaniem jest rozpoznać markę, model i rodzaj silnika na podstawie materiału audio lub wideo/zdjęcia.
Skupiasz się na detekcji wizualnej (karoseria, detale wnętrza) i akustycznej (tonacja wydechu, świst turbiny, charakterystyczny bas V8).
Musisz zwrócić odpowiedź w języku POLSKIM w restrykcyjnym formacie JSON.
Pamiętaj, że otrzymujesz tablicę 'specs' z technicznymi detalami. Zwróć tylko surowe stringi dla ikon: "Gauge", "Wind", "Hash", "Car".

Przykład ikonek dla specs:
- Pojemność -> "Gauge"
- Moc -> "Wind"
- Układ silnika -> "Hash"
- Inne -> "Car"
`;

const identificationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: "Marka i model, np. 'Ford Mustang GT'" },
    engine: { type: SchemaType.STRING, description: "Oznaczenie silnika, np. '5.0L Coyote V8'" },
    confidence: { type: SchemaType.INTEGER, description: "Pewność identyfikacji w % (0-100)" },
    description: { type: SchemaType.STRING, description: "Krótki opis uzasadniający rozpoznanie." },
    specs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          label: { type: SchemaType.STRING },
          value: { type: SchemaType.STRING },
          icon: { type: SchemaType.STRING, description: "Jedna z wartości: 'Gauge', 'Wind', 'Hash', 'Car'" },
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

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    // TESTING OVERRIDE: Unlimited credits
    // if (!user || user.credits < 1) {
    //   return NextResponse.json(
    //     { status: "error", message: "Brak darmowych skanów. Wykup pakiet PRO." },
    //     { status: 403 }
    //   );
    // }

    const formData = await request.formData();
    const filePartsString = formData.get("fileParts") as string;
    const context = (formData.get("context") as string) || "";

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

    let contextText = "Identyfikacja pojazdu/silnika (Shazam).";
    if (context) {
      contextText += ` Kontekst dodatkowy od użytkownika: ${context}`;
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
            systemInstruction: SYSTEM_INSTRUCTION,
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

    /**
     * TODO: PRODUCTION READINESS - CREDITS
     * For production, uncomment to decrement credits:
     * await prisma.user.update({
     *   where: { id: user.id },
     *   data: { credits: { decrement: 1 } }
     * });
     */

    return NextResponse.json({ status: "success", data: result });

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
