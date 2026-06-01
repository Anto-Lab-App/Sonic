/**
 * Structured output schema for Gemini diagnosis responses.
 *
 * This schema forces the model to return JSON in the *exact* shape
 * of our `Diagnosis` TypeScript type (see src/types/diagnosis.ts).
 */

import { Type } from "@google/genai";

/**
 * The schema is passed to `config.responseSchema` in
 * `ai.models.generateContent()`.
 */
export const diagnosisResponseSchema = {
  type: Type.OBJECT,
  description: "General response from the diagnostic system. Contains session status and either a request for an additional test or a final diagnosis.",
  properties: {
    status: {
      type: Type.STRING,
      description: "Current diagnosis status. Always 'follow_up' (if you need more data/files) or 'complete' (if you have enough data for a correct diagnosis).",
    },
    follow_up_request: {
      type: Type.OBJECT,
      description: "Object returned ONLY when status is 'follow_up'. Indicates what the user should record in the second step.",
      properties: {
        message: {
          type: Type.STRING,
          description: "Message to the user explaining what is missing and why we are asking for a second file. MUST BE IN THE REQUESTED LOCALE.",
        },
        action_required: {
          type: Type.STRING,
          description: "Short, specific action presented on a button. MUST BE IN THE REQUESTED LOCALE.",
        },
      },
      required: ["message", "action_required"],
    },
    final_diagnosis: {
      type: Type.OBJECT,
      description: "Main diagnosis report. Returned ONLY when status is 'complete'.",
      properties: {
        internal_reasoning_log: {
          type: Type.STRING,
          description: "Hidden engineering log (Chain of Thought). Describe your thought process in extreme detail: what exactly you see/hear, hypotheses, differential diagnostics. Can be in English.",
        },
        title: {
          type: Type.STRING,
          description: "Short, descriptive title of the diagnosed problem. MUST BE IN THE REQUESTED LOCALE.",
        },
        criticality: {
          type: Type.STRING,
          description: "Problem severity level. MUST BE IN THE REQUESTED LOCALE (e.g., 'Critical', 'High', 'Medium', 'Low', 'Informational' in English).",
        },
        description: {
          type: Type.STRING,
          description: "Detailed explanation of the problem and its potential consequences (2-3 sentences). MUST BE IN THE REQUESTED LOCALE.",
        },
        confidence_score: {
          type: Type.INTEGER,
          description: "Diagnosis confidence score as an integer (0-100).",
        },
        audio_analysis: {
          type: Type.OBJECT,
          description: "Analysis of the uploaded audiovisual recording.",
          properties: {
            recorded: {
              type: Type.STRING,
              description: "Description of what was heard or noticed. MUST BE IN THE REQUESTED LOCALE.",
            },
            characteristics: {
              type: Type.STRING,
              description: "Technical characteristics of the detected anomaly. MUST BE IN THE REQUESTED LOCALE.",
            },
            tags: {
              type: Type.ARRAY,
              description: "Short tags summarizing key features. MUST BE IN THE REQUESTED LOCALE.",
              items: { type: Type.STRING },
            },
          },
          required: ["recorded", "characteristics", "tags"],
        },
        ai_reasoning: {
          type: Type.ARRAY,
          description: "User-friendly reasoning steps. Minimum 3 steps. MUST BE IN THE REQUESTED LOCALE.",
          items: {
            type: Type.OBJECT,
            properties: {
              step: {
                type: Type.STRING,
                description: "Reasoning step name. MUST BE IN THE REQUESTED LOCALE.",
              },
              detail: {
                type: Type.STRING,
                description: "Detailed explanation of the step. MUST BE IN THE REQUESTED LOCALE.",
              },
            },
            required: ["step", "detail"],
          },
        },
        recommended_actions: {
          type: Type.ARRAY,
          description: "Specific recommendations for the user. Minimum 2 actions. MUST BE IN THE REQUESTED LOCALE.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Short title of the recommendation. MUST BE IN THE REQUESTED LOCALE.",
              },
              desc: {
                type: Type.STRING,
                description: "Detailed instruction. MUST BE IN THE REQUESTED LOCALE.",
              },
            },
            required: ["title", "desc"],
          },
        },
        is_diy_feasible: {
          type: Type.BOOLEAN,
          description: "Evaluate if the fault can be safely repaired at home in a garage.",
        },
        diy_repair_guide: {
          type: Type.STRING,
          description: "Detailed repair instructions or Mechanic's Guide. MUST BE IN THE REQUESTED LOCALE. Use Markdown.",
        },
        parameters: {
          type: Type.OBJECT,
          description: "Technical parameters and estimates.",
          properties: {
            estimated_time_hours: {
              type: Type.INTEGER,
              description: "Estimated repair time in hours.",
            },
            risk_level: {
              type: Type.STRING,
              description: "Risk level percentage (e.g., '80%').",
            },
            complexity: {
              type: Type.STRING,
              description: "Repair complexity scale 1-5 (e.g., '3/5').",
            },
            obd_codes: {
              type: Type.ARRAY,
              description: "Relevant OBD-II codes. Empty array if none.",
              items: { type: Type.STRING },
            },
            estimated_cost_pln: {
              type: Type.STRING,
              description: "Estimated repair cost (usually in PLN). MUST BE IN THE REQUESTED LOCALE (e.g., '800-1200 PLN').",
            },
          },
          required: ["estimated_time_hours", "risk_level", "complexity", "obd_codes", "estimated_cost_pln"],
        },
      },
      required: [
        "internal_reasoning_log",
        "title",
        "criticality",
        "description",
        "confidence_score",
        "audio_analysis",
        "ai_reasoning",
        "recommended_actions",
        "is_diy_feasible",
        "diy_repair_guide",
        "parameters",
      ],
    },
  },
  required: ["status"],
};

/**
 * System instruction that primes the Gemini model as a vehicle
 * diagnostic expert.
 */
export const SYSTEM_INSTRUCTION = `You are SONIC — Chief Acoustic and Visual Diagnostics Engineer. You are an expert with decades of experience in identifying machine faults based on subtle changes in sound and image.

YOUR TASK:
Otrzymujesz nagranie silnika oraz opcjonalnie zdjęcie ekranu ze skanera diagnostycznego/kontrolki (lub wpisane kody). Twoim zadaniem jest FUZJA DANYCH. Odczytaj kody z obrazu za pomocą OCR i połącz je z anomalią akustyczną, by wydać bezbłędną, autorytatywną diagnozę.

Analyze the submitted video/audio recordings or photos of vehicles and bicycles. Your goal is to analytically break down the problem and provide a substantive diagnosis based ONLY on source material and facts. Stop guessing.

CRITICAL RULE 1: Two-Step Diagnostic Session.
- If you are not 100% sure of the fault based on the FIRST file, ALWAYS choose status "follow_up" and generate only the "follow_up_request" object. Request a specific physical test (e.g., pressing the clutch, revving in neutral). This helps you perform differential diagnostics.
- If you are 100% sure, OR if you have already received materials from TWO recordings in this session, choose status "complete" and return the "final_diagnosis" object. Status 'follow_up' is allowed ONLY ONCE per session. You MUST issue a final diagnosis on the second step.

CRITICAL RULE 2: User Context.
You will receive context text containing key user data (e.g., Vehicle Make, OBD-II Codes, Mileage, Description).
- YOU MUST TAKE THIS CONTEXT INTO ACCOUNT.
- If the vehicle is a specific model (e.g., BMW E46), research faults typical for that model.
- If OBD-II codes are provided, correlate them with the sound/image.

RULE 3: Empty Material Protection.
- If you hear only white noise, digital static, or silence — respond with "complete" status, confidence_score < 15, and title "No detectable sound source".
- If a photo is blurred, dark, or does not show a mechanism — state honestly that the material is unsuitable for analysis.

RULE 4: NO FAULT IS ALSO A DIAGNOSIS.
If the engine/drive sounds healthy and has no anomalies, you MUST issue a 'No faults detected / Engine in good condition' diagnosis. Do not invent problems.

RULE 5: AGE AND WEAR TOLERANCE.
Old engines have a right to be louder. Consider it an operational norm unless you hear distinct metallic knocks or anomalies outside the standard unit culture.

RULE 6: BRUTAL HONESTY IN CONFIDENCE SCORE.
Your confidence score (0-100%) must be absolutely honest. If the recording is obscured or short and you are guessing — set confidence_score BELOW 50%.

RULE 7: CONSTRUCTION SPECIFICITY PRINCIPLE.
Many engines have loud but normal operational characteristics (e.g., direct injectors 'ticking', 'Hemi Tick' in V8 engines). If a sound is a known NORMAL feature, mark as NO FAULT and inform the client.

METHODOLOGY (INTERNAL LOG):
Before filling final fields, use 'internal_reasoning_log' (Chain of Thought).
1. Start with differential diagnostics considering USER CONTEXT.
2. Evaluate sound: RPM correlation, tone (low/high), characteristics (knock, squeak, hiss).
3. For bikes: analyze tension, cracks, drivetrain geometry, wear.

OUTPUT REQUIREMENTS:
1. ALWAYS respond in the language specified in the prompt (locale).
2. The response must be CLEAN JSON according to the schema. No markdown wrapping unless in the guide field.
3. Be realistic with repair costs. If the repair cost exceeds the market value of an old vehicle, suggest alternatives (e.g., used component replacement).
4. Do not hallucinate. If you don't have a basis for a diagnosis, say so clearly.`;
