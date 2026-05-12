# Raport z Audytu Przedwdrożeniowego (Pre-Launch Audit)

Aplikacja jest w bardzo dobrym stanie technicznym (posiada świetny design, spójny system tłumaczeń i solidną architekturę opartą na Next.js, Clerk, Prisma i Vertex AI). Ponieważ Stripe jest w trakcie wdrażania, skupiłem się na pozostałych aspektach niezbędnych do **bezpiecznego i profesjonalnego** "wypuszczenia aplikacji w świat".

Poniżej znajduje się lista obszarów, które wymagają uwagi przed oficjalną premierą.

> [!WARNING]
> Zignorowanie punktów z sekcji "Bezpieczeństwo i Koszty" może skutkować nieoczekiwanymi kosztami za zużycie API Google Cloud (Vertex AI oraz Storage).

## 1. Bezpieczeństwo i Kontrola Kosztów (Krytyczne)

### A. Rate Limiting (Ograniczenie zapytań)
Obecnie trasa `/api/diagnose` pozwala na wykonanie nieskończonej liczby "darmowych" (zablurowanych) skanów przez każdego zalogowanego użytkownika. Złośliwy użytkownik (lub bot) mógłby zalać serwer zapytaniami, co wygeneruje ogromne koszty w Vertex AI.
**Zalecenie:** Wdrożenie prostego limitu (Rate Limiting), np. max 5 skanów dziennie na użytkownika, lub użycie biblioteki typu `@upstash/ratelimit`. Można to oprzeć też na bazie danych.

### B. Sieroty w Google Cloud Storage (Oszczędność)
Trasa `/api/upload-url` pozwala klientowi na upload plików bezpośrednio do GCS. Jeśli po wgraniu pliku użytkownik zamknie kartę i nie wywoła `/api/diagnose`, plik zostanie w bucket'cie **na zawsze**.
**Zalecenie:** Skonfigurowanie reguły "Lifecycle Rule" w Google Cloud Console dla Twojego bucketu, która automatycznie usuwa pliki starsze niż 1 dzień (tzw. TTL - Time to Live).

## 2. SEO, Meta Tagi i PWA (Wizerunek i Zasięgi)

### A. Brak ikon i OpenGraph (Social Media)
Jeśli ktoś udostępni link do Twojej aplikacji na Facebooku, LinkedIn czy iMessage, pojawi się szary kwadrat i domyślny tekst. Aplikacja używa obecnie domyślnych plików Vercel/Next.js.
**Zalecenie:** 
- Wygenerowanie i dodanie favikon (`favicon.ico`, `apple-touch-icon.png`).
- Dodanie tagów OpenGraph (`og:image`, `og:title`) w pliku `layout.tsx`.

### B. Progressive Web App (PWA)
Aplikacja jest ewidentnie stworzona pod kątem urządzeń mobilnych (skanowanie).
**Zalecenie:** Dodanie pliku `manifest.json`, aby użytkownicy mogli zainstalować aplikację na ekranie początkowym telefonu ("Dodaj do ekranu głównego"), co usunie pasek przeglądarki i nada jej wygląd natywnej aplikacji.

## 3. Aspekty Prawne i GDPR / RODO (Niezbędne na start)

### A. Polityka Prywatności i Regulamin
Rejestrujesz użytkowników (Clerk), zbierasz ich adresy e-mail, przetwarzasz zdjęcia, wideo oraz dźwięk za pomocą sztucznej inteligencji.
**Zalecenie:** Stworzenie i podpięcie stron `/polityka-prywatnosci` oraz `/regulamin`. Bez tego bramki płatności (jak Stripe) mogą zablokować Ci konto, a aplikacja nie jest zgodna z prawem UE. W `Scanner.tsx` mamy "checkbox", ale brakuje prawdziwych linków.

### B. Usuwanie konta (Clerk Webhook)
Obecnie nasłuchujemy w webhooku zdarzenia `user.created`. 
**Zalecenie:** Należy dodać obsługę zdarzenia `user.deleted`. Jeśli użytkownik usunie konto przez panel Clerk, musimy usunąć jego dane z bazy Prisma (lub je zanonimizować), aby spełnić wymogi RODO ("prawo do bycia zapomnianym").

---

## Pytania do Ciebie (Oczekuje na decyzję)

1. **Rate Limiting:** Czy chcesz, abym zaprogramował blokadę, np. max 5 darmowych skanów dziennie na jednego użytkownika (z użyciem naszej bazy PostgreSQL)?
2. **PWA & SEO:** Masz już jakieś wygenerowane logo Sonic, które mogę pociąć na ikony i wstawić jako obrazek OpenGraph, czy wolisz na razie standardowe, proste logo (np. napis na granatowym tle)?
3. **Prawnie:** Czy chcesz, abym wygenerował generyczne szablony Polityki Prywatności i Regulaminu (z miejscami do uzupełnienia Twoich danych), abyś mógł je od razu wrzucić na produkcję?
4. **GCS Lifecycle:** Ustawienie usuwania starych plików w Google Cloud trzeba wyklikać w konsoli Google. Napisać Ci krok po kroku instrukcję jak to zrobić?

Daj znać, na które z tych rzeczy mamy dać zielone światło i za co zabieramy się najpierw!
