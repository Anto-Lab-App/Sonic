import { NextResponse } from "next/server";
import type { DiagnoseApiResponse } from "@/types/diagnosis";

// POST /api/diagnose
// Phase 1: Returns a mocked diagnosis JSON after a simulated delay.
// In Phase 2 this will be wired to Vertex AI (Gemini).
export async function POST(): Promise<NextResponse<DiagnoseApiResponse>> {
  // Simulate analytical processing delay (2 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const mockedResponse: DiagnoseApiResponse = {
    status: "success",
    diagnosis: {
      title: "Prawdopodobne zużycie panewek korbowodowych",
      criticality: "Krytyczna",
      description:
        "Charakterystyka dźwięku wskazuje na poważne problemy w układzie korbowo-tłokowym. Dalsza praca silnika w tym stanie grozi jego całkowitym zniszczeniem.",
      confidence_score: 92,
      audio_analysis: {
        recorded:
          "Wyraźne, twarde i metaliczne stukanie dochodzące z dolnej części bloku silnika.",
        characteristics:
          "Częstotliwość uderzeń jest bezpośrednio zsynchronizowana z prędkością obrotową wału korbowego.",
        tags: ["850 RPM", "Metaliczny pogłos", "Zależne od obciążenia"],
      },
      ai_reasoning: [
        {
          step: "Izolacja częstotliwości",
          detail:
            "Odseparowano szum tła. Wykryto anomalię w paśmie niskich tonów.",
        },
        {
          step: "Korelacja z cyklem pracy",
          detail:
            "Stukanie występuje dokładnie raz na obrót wału korbowego. Uderzenie zsynchronizowane.",
        },
        {
          step: "Weryfikacja bazy wzorców",
          detail:
            "Najwyższa zgodność (92%) z uszkodzeniem panewki korbowodowej.",
        },
      ],
      recommended_actions: [
        {
          title: "Zgaś silnik",
          desc: "Natychmiast przerwij pracę silnika. Nie próbuj jechać dalej.",
        },
        {
          title: "Sprawdź olej",
          desc: "Sprawdź obecność metalowych opiłków w filtrze oleju (tzw. brokat).",
        },
      ],
      parameters: {
        estimated_time_hours: 24,
        risk_level: "95%",
        complexity: "5/5",
        obd_codes: ["P0335", "P0300"],
      },
    },
  };

  return NextResponse.json(mockedResponse);
}
