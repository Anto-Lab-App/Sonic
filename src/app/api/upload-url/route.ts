import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getStorage, getBucketName } from "@/lib/google-clients";

// Next.js App Router API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files } = body as { files: { filename: string; contentType: string }[] };

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Brak plików do wgrania." }, { status: 400 });
    }

    const storage = getStorage();
    const bucketName = getBucketName();
    const bucket = storage.bucket(bucketName);

    const urls = await Promise.all(
      files.map(async (fileReq) => {
        const ext = fileReq.filename.split(".").pop()?.toLowerCase() || "bin";
        const gcsFilePath = `diagnostics/${randomUUID()}.${ext}`;
        const gcsFile = bucket.file(gcsFilePath);

        // Generujemy Signed URL ważny przez 15 minut do wykonania PUT z odpowiednim contentType
        const [signedUrl] = await gcsFile.getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000,
          contentType: fileReq.contentType,
        });

        return {
          signedUrl,
          gcsUri: `gs://${bucketName}/${gcsFilePath}`,
          mimeType: fileReq.contentType,
        };
      })
    );

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("[Upload-URL] Error generating signed URLs:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas generowania linków." }, { status: 500 });
  }
}
