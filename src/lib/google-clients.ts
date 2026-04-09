/**
 * Centralized Google Cloud client configuration.
 *
 * Reads the service-account JSON from the GOOGLE_SERVICE_ACCOUNT_JSON
 * environment variable (set in .env.local or Vercel dashboard) and
 * creates singleton instances of:
 *  • Google Cloud Storage client
 *  • Google GenAI (Vertex AI) client
 *
 * Both clients share the same credentials so there is a single source
 * of truth for authentication.
 */

import { Storage } from "@google-cloud/storage";
import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------------
// 1. Parse the service-account key from env
// ---------------------------------------------------------------------------

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable. " +
        "Set it to the full JSON content of your service-account key."
    );
  }
  try {
    return JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
      [key: string]: unknown;
    };
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON. " +
        "Make sure the entire JSON object is stored as a single string."
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Google Cloud Storage
// ---------------------------------------------------------------------------

let _storage: Storage | null = null;

export function getStorage(): Storage {
  if (!_storage) {
    const creds = getCredentials();
    _storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || creds.project_id,
      credentials: {
        client_email: creds.client_email,
        private_key: creds.private_key,
      },
    });
  }
  return _storage;
}

export function getBucketName(): string {
  return process.env.GCS_BUCKET_NAME || "sonic-diagnostics-assets";
}

// ---------------------------------------------------------------------------
// 3. Google GenAI (Vertex AI mode)
// ---------------------------------------------------------------------------

let _genai: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!_genai) {
    const creds = getCredentials();
    const location = process.env.VERTEX_AI_LOCATION || "us-central1";

    _genai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT || creds.project_id,
      location,
      googleAuthOptions: {
        credentials: {
          client_email: creds.client_email,
          private_key: creds.private_key,
        },
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      },
    });
  }
  return _genai;
}
