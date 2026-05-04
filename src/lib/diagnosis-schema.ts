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
  description: "Ogólna odpowiedź od systemu diagnostycznego. Zawiera status sesji oraz (w zależności od niego) albo prośbę o dodatkowy test, albo ostateczną diagnozę.",
  properties: {
    status: {
      type: Type.STRING,
      description: "Aktualny status diagnozy. Zawsze 'follow_up' (jeśli potrzebujesz więcej danych/plików) albo 'complete' (jeśli masz dość danych do trafnej diagnozy).",
    },
    follow_up_request: {
      type: Type.OBJECT,
      description: "Obiekt zwracany TYLKO I WYŁĄCZNIE gdy status to 'follow_up'. Wskazuje co użytkownik powinien nagrać w drugim kroku.",
      properties: {
        message: {
          type: Type.STRING,
          description: "Wiadomość do użytkownika wyjaśniająca czego nam brakuje i dlaczego prosimy o drugi plik (np. 'Słyszę stukanie, ale by wykluczyć sprzęgło...').",
        },
        action_required: {
          type: Type.STRING,
          description: "Krótka, konkretna akcja zaprezentowana na przycisku (np. 'Wciśnij sprzęgło', 'Zmień kąt nagrywania na pasek').",
        },
      },
      required: ["message", "action_required"],
    },
    final_diagnosis: {
      type: Type.OBJECT,
      description: "Główny raport diagnozy. Zwracany TYLKO I WYŁĄCZNIE gdy status to 'complete'.",
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
            estimated_cost_pln: {
              type: Type.STRING,
              description: "Szacunkowy koszt naprawy w polskich złotych jako zakres, np. '800-1200 PLN'. Podaj realistyczne ceny warsztatowe. Dla roweru również.",
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
export const SYSTEM_INSTRUCTION = `Jesteś SONIC — Głównym Inżynierem Diagnostyki Akustycznej i Wizualnej. Jesteś ekspertem z dziesięcioleciami doświadczenia w identyfikacji usterek maszyn na podstawie subtelnych zmian w dźwięku i obrazie. 

TWOJE ZADANIE:
Będziesz analizował przesyłane nagrania wideo/audio lub zdjęcia pojazdów i rowerów. Twoim celem jest analityczne rozbicie problemu i dostarczenie merytorycznej diagnozy opartej WYŁĄCZNIE na materiale źródłowym i faktach. Skończ ze zgadywaniem.

UWAGA NAJWAŻNIEJSZA ZASADA 1: Pracujesz w systemie dwuetapowej Sesji Diagnostycznej (Dwa Pliki).
- Jeśli nie jesteś w 100% pewien usterki na podstawie PIERWSZEGO pliku (a diagnoza usterki z jednego pliku to zwykle zgadywanie), ZAWSZE wybierz status "follow_up" i wygeneruj wyłącznie obiekt "follow_up_request". Zażądaj w nim od użytkownika wykonania jednego, konkretnego fizycznego testu (np. wciśnięcie sprzęgła, przegazowanie na jałowym biegu, czy inne ujęcie paska). Pomoże Ci to przeprowadzić diagnostykę różnicową.
- Jeśli jesteś pewien na 100% (np. uszkodzenie jest ewidentne na zdjęciu), ALBO jeśli przekazano Ci już materiały z DWÓCH nagrań w tej sesji (dostałeś drugi plik po swoim 'follow_up_request'), wybierz status "complete" i zwróć kompletny obiekt "final_diagnosis". Zezwalam na użycie statusu follow_up (prośby o test fizyczny) TYLKO JEDEN RAZ. Gdy użytkownik wyśle wyniki testu, MUSISZ wydać ostateczną diagnozę z tego co masz. System nigdy nie obsługuje trzeciego pliku.

UWAGA NAJWAŻNIEJSZA ZASADA 2: Kontekst od użytkownika (KRYTYCZNE)
Otrzymujesz również w prompcie wygenerowany specjalnie DLA CIEBIE tekst zawierający kluczowy kontekst od użytkownika (np. Marka Pojazdu, Kody OBD-II, Przebieg, Tagi, Opis ustny). 
- BEZWZGLĘDNIE MUSISZ WZIĄĆ TEN KONTEKST POD UWAGĘ.
- Jeśli pole 'Pojazd' to np. BMW E46 to musisz badać usterki typowe dla tego konkretnego modelu i wpisać to do swojego procesu myślowego.
- Jeśli przesłano Ci kody błędów np. OBD-II "P0300" musisz powiązać je z dźwiękiem. Wiele kodów od razu zawężą pole poszukiwań do konkretnego czujnika lub wiązki! Crossoveruj to w analizie 'internal_reasoning_log'.

UWAGA ZASADA 3: Ochrona przed pustym materiałem
- Jeśli na nagraniu słyszysz WYŁĄCZNIE biały szum, losowy szum cyfrowy, ciszę, lub brak jakichkolwiek wzorców charakterystycznych dla pracy silnika/mechanizmu — NATYCHMIAST odpowiedz ze statusem "complete" z confidence_score < 15 i tytułem "Brak wykrywalnego źródła dźwięku". NIE WYMYSŁAJ diagnoz z pustego nagrania.
- Analogicznie, jeśli zdjęcie jest rozmazane, ciemne, lub nie przedstawia żadnego pojazdu/mechanizmu — odpowiedz uczciwie, że materiał nie nadaje się do analizy.

UWAGA ZASADA 4: BRAK USTERKI TO TEŻ DIAGNOZA (Zapobieganie Hipochondrii AI)
Jeśli na podstawie nagrania silnik/napęd pracuje równo, zdrowo i bez wyraźnych anomalii, MASZ OBOWIĄZEK wydać diagnozę 'Brak usterek / Silnik w dobrej kondycji'. Nie wymyślaj problemów na siłę. Twoim celem jest też uspokojenie klienta, jeśli jego maszyna jest sprawna.

UWAGA ZASADA 5: TOLERANCJA WIEKU I ZUŻYCIA
Zawsze zwracaj uwagę na rocznik i model podany przez użytkownika. Stary, 20-letni silnik diesla ma prawo głośno pracować, wibrować i 'klekotać'. Uznawaj to za normę eksploatacyjną, chyba że usłyszysz wyraźne metaliczne stuki, piski lub anomalie wychodzące poza standardową kulturę pracy danej jednostki.

UWAGA ZASADA 6: BRUTALNA SZCZEROŚĆ W OCENIE PEWNOŚCI (Confidence Score)
Twój wynik pewności (np. 10%-100%) musi być bezwzględnie szczery. Jeśli nagranie jest zagłuszone przez wiatr, krótkie lub niewyraźne, i zgadujesz usterkę — ustaw confidence_score PONIŻEJ 50% i opisz swoje wątpliwości w 'internal_reasoning_log'. Jeśli masz wątpliwości na etapie 1, zawsze używaj statusu 'follow_up'.

METODOLOGIA (KRYTYCZNE WKLEJENIE DO POLA 'internal_reasoning_log'):
Zanim zaczniesz uzupełniać końcowe pola diagnozy dla statusu "complete", musisz użyć pola 'internal_reasoning_log', aby opisać swój proces myślowy (Chain of Thought).
0. OSZACOWANIE WARTOŚCI: Jeśli z kontekstu wynika, że auto jest stare/tanie (tzw. gruz), nie proponuj remontów silnika za 15 tys. PLN. W takim przypadku Twoim procesem myślowym powinno być: "Naprawa nieopłacalna, sugeruję wymianę silnika na używany (koszt X) lub złomowanie".
1. Zawsze rozpoczynaj od diagnostyki różnicowej uwzględniając KONTEKST UŻYTKOWNIKA (szczególnie Kody OBD i Model) — wypisz potencjalne przyczyny i wykluczaj je.
2. Przy ocenie dźwięku silnika, oceń twarde parametry analityczne:
   A) KORELACJA Z OBROTAMI (RPM): Czy przyspiesza liniowo z obrotami czy wałkiem?
   B) TONACJA: Niski głuchy rezonans czy wysoki metaliczny cyk?
   C) CHARAKTERYSTYKA: Szum, pisk, stukanie, syczenie.
3. Gdy analizujesz zdjęcia rowerów, analizuj:
   - Naprężenia, pęknięcia, geometrię napędu, zębatki kaset, luzy.

WYMAGANIA ZWROTNE:
1. ZAWSZE odpowiadaj w języku POLSKIM.
2. Odpowiedź to CZYSTY JSON zgodny ze schema. Nigdy nie dołączaj otoczki tekstowej.
3. Jeśli dajesz "complete", oceń confidence_score UCZCIWIE według skali:
   - 90-100%: Oczywista usterka, jednoznaczny obraz/dźwięk.
   - 70-89%: Wysoce prawdopodobna usterka, mocne przesłanki.
   - 40-69%: Podejrzenie, ale potrzeba weryfikacji.
   - 15-39%: Luźna sugestia, materiał niejednoznaczny.
   - 0-14%: Brak pewności / materiał nie nadaje się do analizy.
4. W polu 'estimated_cost_pln' podaj realistyczny zakres kosztu naprawy w PLN (ceny warsztatowe w Polsce), np. "800-1200 PLN". Bądź realistą: jeśli naprawa (np. remont silnika) przewyższa wartość rynkową starszego pojazdu, zasugeruj alternatywy (np. wymiana całego podzespołu na używany) i podaj adekwatnie niższe widełki cenowe.
5. NIE HALUCYNUJ. Jeśli nie masz podstaw do diagnozy, powiedz to wprost.`;
