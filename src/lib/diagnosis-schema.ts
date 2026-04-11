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
  description: "A complete vehicle / bike diagnostic report generated from audio or visual analysis.",
  properties: {
    internal_reasoning_log: {
      type: Type.STRING,
      description: "Ukryty log inżynieryjny (Chain of Thought). Zanim wypełnisz resztę, opisz tutaj niezwykle szczegółowo swój proces myślowy: co dokładnie widzisz/słyszysz na nagraniu sekunda po sekundzie, jakie hipotezy stawiasz, jaką diagnostykę różnicową przeprowadzasz (co wykluczasz i dlaczego). Myśl analitycznie.",
    },
    title: {
      type: Type.STRING,
      description: "Krótki, opisowy tytuł zdiagnozowanego problemu.",
    },
    criticality: {
      type: Type.STRING,
      description: "Poziom powagi problemu. Jedno z: 'Krytyczna', 'Wysoka', 'Średnia', 'Niska', 'Informacyjna'.",
    },
    description: {
      type: Type.STRING,
      description: "Szczegółowe wyjaśnienie problemu i jego potencjalnych konsekwencji (2-3 zdania).",
    },
    confidence_score: {
      type: Type.INTEGER,
      description: "Ocena pewności diagnozy jako liczba całkowita (0-100).",
    },
    audio_analysis: {
      type: Type.OBJECT,
      description: "Analiza przesłanego nagrania audiowizualnego.",
      properties: {
        recorded: {
          type: Type.STRING,
          description: "Opis tego, co zostało usłyszane lub zauważone na nagraniu.",
        },
        characteristics: {
          type: Type.STRING,
          description: "Techniczna charakterystyka wykrytej anomalii.",
        },
        tags: {
          type: Type.ARRAY,
          description: "Krótkie tagi podsumowujące kluczowe cechy nagrania.",
          items: { type: Type.STRING },
        },
      },
      required: ["recorded", "characteristics", "tags"],
    },
    ai_reasoning: {
      type: Type.ARRAY,
      description: "Zrozumiałe dla użytkownika kroki wnioskowania, które doprowadziły do diagnozy. Minimum 3 kroki.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: {
            type: Type.STRING,
            description: "Nazwa kroku wnioskowania.",
          },
          detail: {
            type: Type.STRING,
            description: "Szczegółowe wyjaśnienie danego kroku.",
          },
        },
        required: ["step", "detail"],
      },
    },
    recommended_actions: {
      type: Type.ARRAY,
      description: "Konkretne zalecenia i akcje do wykonania przez użytkownika. Minimum 2 działania.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Krótki tytuł zalecenia.",
          },
          desc: {
            type: Type.STRING,
            description: "Szczegółowa instrukcja zalecenia.",
          },
        },
        required: ["title", "desc"],
      },
    },
    parameters: {
      type: Type.OBJECT,
      description: "Parametry techniczne i szacunki powiązane z diagnozą.",
      properties: {
        estimated_time_hours: {
          type: Type.INTEGER,
          description: "Szacowany czas naprawy w godzinach.",
        },
        risk_level: {
          type: Type.STRING,
          description: "Poziom ryzyka dalszej eksploatacji pojazdu w postaci procentowej (np. '80%').",
        },
        complexity: {
          type: Type.STRING,
          description: "Złożoność naprawy w skali 1-5 (np. '3/5').",
        },
        obd_codes: {
          type: Type.ARRAY,
          description: "Odpowiednie kody błędów OBD-II, jeśli mają zastosowanie. Pusta tablica dla braku kodów (np. dla roweru).",
          items: { type: Type.STRING },
        },
      },
      required: ["estimated_time_hours", "risk_level", "complexity", "obd_codes"],
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
    "parameters",
  ],
};

/**
 * System instruction that primes the Gemini model as a vehicle
 * diagnostic expert.
 */
export const SYSTEM_INSTRUCTION = `Jesteś SONIC — Głównym Inżynierem Diagnostyki Akustycznej i Wizualnej. Jesteś ekspertem z dziesięcioleciami doświadczenia w identyfikacji usterek maszyn na podstawie subtelnych zmian w dźwięku i obrazie. 

TWOJE ZADANIE:
Będziesz analizował przesłane nagrania wideo/audio lub zdjęcia pojazdów i rowerów. Twoim celem jest analityczne rozbicie problemu i dostarczenie merytorycznej diagnozy opartej WYŁĄCZNIE na materiale źródłowym i faktach. Skończ ze zgadywaniem.

METODOLOGIA (KRYTYCZNE WKLEJENIE DO POLE 'internal_reasoning_log'):
Zanim zaczniesz uzupełniać końcowe pola diagnozy, musisz użyć pola 'internal_reasoning_log', aby opisać swój proces myślowy (Chain of Thought).
1. Zawsze rozpoczynaj od diagnostyki różnicowej — wypisz potencjalne przyczyny i kolejno wykluczaj je na podstawie nagrania.
2. Gdy analizujesz dźwięk silnika upewnij się, że rozpoznałeś i oceniłeś twarde parametry analityczne:
   A) KORELACJA Z OBROTAMI (RPM): Czy dźwięk przyspiesza liniowo z obrotami wału, czy z wałkiem rozrządu (1/2 RPM)? Czy reaguje na obciążenie czy pozostaje stały?
   B) TONACJA: Czy jest to niski, głuchy rezonans (często z dołu silnika), czy wysoki, metaliczny cyk/styk (często z góry silnika)?
   C) CHARAKTERYSTYKA: Zidentyfikuj szum (łożyska), pisk (paski), stukanie (luzy metalowe), syczenie (nieszczelność podciśnienia).
3. Gdy analizujesz zdjęcia rowerów i komponentów upewnij się, że analizujesz:
   - Naprężenia i potencjalne pęknięcia zmęczeniowe materiału (szczególnie włókna węglowego i spawów aluminium).
   - Osiowość i geometrię napędu (stopień zużycia kaset, zębatek).
   - Luzy na łożyskach, wycieki z amortyzatorów.

WYMAGANIA ZWROTNE:
1. ZAWSZE odpowiadaj w języku POLSKIM.
2. Twoja odpowiedź MUSI być w formacie JSON zgodnym ze schematem.
3. Pole "confidence_score" to Twoja racjonalna pewność diagnozy (0-100). Oprzyj tę wartość WYŁĄCZNIE na jakości materiału. Jeśli nagranie to czysty bezużyteczny szum — ustal wartość poniżej 20 i odrzuc analizę w "description". Nidy na siłę nie stawiaj pozytywnej diagnozy jeżeli materiał tego nie uzasadnia.
4. Nigdy nie zmyślaj i nie powielaj schematowych przykładów.`;
