/**
 * Structured output schema for Gemini diagnosis responses.
 *
 * This schema forces the model to return JSON in the *exact* shape
 * of our `Diagnosis` TypeScript type (see src/types/diagnosis.ts).
 * That way, the frontend components (DiagnosisReport, etc.) work
 * without any change.
 */

import { Type } from "@google/genai";

/**
 * The schema is passed to `config.responseSchema` in
 * `ai.models.generateContent()`.
 */
export const diagnosisResponseSchema = {
  type: Type.OBJECT,
  description:
    "A complete vehicle / bike diagnostic report generated from audio or visual analysis.",
  properties: {
    title: {
      type: Type.STRING,
      description:
        "Short, descriptive title of the diagnosed issue (e.g. 'Prawdopodobne zużycie panewek korbowodowych').",
    },
    criticality: {
      type: Type.STRING,
      description:
        "Severity level of the issue. One of: 'Krytyczna', 'Wysoka', 'Średnia', 'Niska', 'Informacyjna'.",
    },
    description: {
      type: Type.STRING,
      description:
        "A detailed, 2-3 sentence explanation of the problem and its potential consequences.",
    },
    confidence_score: {
      type: Type.INTEGER,
      description:
        "Confidence score as an integer percentage (0-100) indicating how certain the AI is about the diagnosis.",
    },
    audio_analysis: {
      type: Type.OBJECT,
      description: "Analysis of the audio/visual recording provided by the user.",
      properties: {
        recorded: {
          type: Type.STRING,
          description:
            "What the AI heard or saw in the recording (e.g. 'Wyraźne metaliczne stukanie z dolnej części bloku silnika').",
        },
        characteristics: {
          type: Type.STRING,
          description:
            "Technical characteristics of the detected anomaly (frequency, sync with RPM, etc.).",
        },
        tags: {
          type: Type.ARRAY,
          description:
            "Short keyword tags summarising key features (e.g. '850 RPM', 'Metaliczny pogłos').",
          items: { type: Type.STRING },
        },
      },
      required: ["recorded", "characteristics", "tags"],
    },
    ai_reasoning: {
      type: Type.ARRAY,
      description:
        "Step-by-step reasoning process the AI followed to arrive at its diagnosis. Minimum 3 steps.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: {
            type: Type.STRING,
            description: "Name of the reasoning step (e.g. 'Izolacja częstotliwości').",
          },
          detail: {
            type: Type.STRING,
            description:
              "Detailed explanation of what happened in this step and what was found.",
          },
        },
        required: ["step", "detail"],
      },
    },
    recommended_actions: {
      type: Type.ARRAY,
      description: "Concrete actions the user should take. Minimum 2 items.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Short action title (e.g. 'Zgaś silnik').",
          },
          desc: {
            type: Type.STRING,
            description: "Detailed instruction for the user.",
          },
        },
        required: ["title", "desc"],
      },
    },
    parameters: {
      type: Type.OBJECT,
      description: "Technical parameters and estimates related to the diagnosis.",
      properties: {
        estimated_time_hours: {
          type: Type.INTEGER,
          description:
            "Estimated repair time in hours.",
        },
        risk_level: {
          type: Type.STRING,
          description:
            "Risk level as a percentage string (e.g. '95%').",
        },
        complexity: {
          type: Type.STRING,
          description:
            "Repair complexity on a scale of 1-5 (e.g. '5/5').",
        },
        obd_codes: {
          type: Type.ARRAY,
          description:
            "Relevant OBD-II fault codes if applicable (e.g. ['P0335', 'P0300']). Can be empty if no codes apply.",
          items: { type: Type.STRING },
        },
      },
      required: ["estimated_time_hours", "risk_level", "complexity", "obd_codes"],
    },
  },
  required: [
    "title",
    "criticality",
    "description",
    "confidence_score",
    "audio_analysis",
    "ai_reasoning",
    "recommended_actions",
    "parameters",
  ],
};

/**
 * System instruction that primes the Gemini model as a vehicle
 * diagnostic expert.
 */
export const SYSTEM_INSTRUCTION = `Jesteś SONIC — zaawansowanym systemem diagnostycznym do pojazdów mechanicznych i rowerów.

TWOJE ZADANIE:
Użytkownik przesyła Ci nagranie audio, wideo lub zdjęcie swojego pojazdu/roweru wraz z opcjonalnym opisem problemu.
Na podstawie analizy tego pliku medialnego musisz wygenerować profesjonalną diagnozę usterki.

WYMAGANIA:
1. ZAWSZE odpowiadaj w języku POLSKIM.
2. Bądź precyzyjny i techniczny, ale zrozumiały dla laika.
3. Twoja odpowiedź MUSI być w formacie JSON zgodnym ze schematem — nie dodawaj żadnego tekstu poza JSON.
4. Pole "confidence_score" to Twoja pewność diagnozy (0-100). Bądź uczciwy — jeśli nagranie jest niejasne, ustaw niski wynik.
5. W "ai_reasoning" opisz minimum 3 kroki, które wykonałeś analizując nagranie.
6. W "recommended_actions" podaj minimum 2 konkretne zalecenia.
7. Jeśli na podstawie nagrania nie jesteś w stanie zdiagnozować problemu, nadal zwróć JSON z niskim confidence_score i wyjaśnij to w opisie.
8. Jeśli kontekst użytkownika zawiera informacje o marce, modelu, przebiegu — uwzględnij to w swojej analizie.
9. Pole "obd_codes" może być pustą tablicą jeśli kody OBD nie są istotne (np. dla roweru).

PAMIĘTAJ: Jesteś ekspertem mechanikiem z wieloletnim doświadczeniem. Twoja analiza ma być profesjonalna i pomocna.`;
