import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="flex items-center px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto border-b border-foreground/5">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full bg-surface hover:bg-foreground/5 transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted" />
        </Link>
        <h1 className="text-sm font-semibold tracking-widest text-muted uppercase ml-4">Regulamin Świadczenia Usług</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 prose prose-invert prose-blue">
        <h1 className="text-3xl font-bold mb-8">Regulamin Świadczenia Usług</h1>
        <p className="text-sm text-muted mb-8">Ostatnia aktualizacja: 11 maja 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Postanowienia ogólne</h2>
          <p>
            1. Niniejszy regulamin ("Regulamin") określa zasady korzystania z aplikacji diagnostycznej Sonic ("Aplikacja"), udostępnianej przez <strong>Antoniego Ziółka</strong>, zamieszkałego w <strong>Warszawie</strong> ("Usługodawca").<br/>
            2. Aplikacja wykorzystuje technologie sztucznej inteligencji (AI) do analizy danych wejściowych (wideo, audio, zdjęcia, tekst) i generowania raportów sugerujących potencjalne usterki pojazdów oraz maszyn.<br/>
            3. Korzystanie z Aplikacji wymaga zaakceptowania niniejszego Regulaminu oraz Polityki Prywatności.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Charakter usługi i wyłączenie odpowiedzialności</h2>
          <p>
            1. Raporty generowane przez Aplikację mają charakter <strong>wyłącznie informacyjny i pomocniczy</strong>. Oparte są na analizie danych z wykorzystaniem algorytmów AI (np. Google Vertex AI) i mogą zawierać błędy, nieścisłości lub fałszywe diagnozy (tzw. halucynacje AI).<br/>
            2. Diagnoza AI nie zastępuje profesjonalnego przeglądu, diagnostyki czy naprawy w autoryzowanym lub wykwalifikowanym serwisie mechanicznym.<br/>
            3. Usługodawca <strong>nie ponosi odpowiedzialności</strong> za jakiekolwiek szkody na osobie, mieniu, utratę danych czy zysków wynikające z podejmowania decyzji (np. prób samodzielnej naprawy lub ignorowania usterek) na podstawie raportów z Aplikacji.<br/>
            4. Użytkownik korzysta z sugestii Aplikacji oraz przeprowadza naprawy DIY na własne ryzyko. Zawsze zalecamy weryfikację usterki u specjalisty.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Warunki świadczenia usług</h2>
          <p>
            1. Do korzystania z pełni funkcjonalności Aplikacji wymagane jest założenie konta oraz posiadanie połączenia z siecią Internet.<br/>
            2. Aplikacja oferuje usługi darmowe (częściowe raporty, ograniczone do ogólnych wniosków) oraz płatne (Pakiety PRO, pełne odblokowanie raportów).<br/>
            3. Płatności są obsługiwane przez operatora zewnętrznego (Stripe). Cennik pakietów PRO dostępny jest w interfejsie Aplikacji przed dokonaniem zakupu.<br/>
            4. Użytkownik zobowiązuje się nie wgrywać do Aplikacji materiałów (audio/wideo/foto), które naruszają prawo, prawa autorskie osób trzecich, lub zawierają treści nieodpowiednie/obraźliwe.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Odstąpienie od umowy i reklamacje</h2>
          <p>
            1. Użytkownik będący konsumentem ma prawo odstąpić od umowy bez podania przyczyny w terminie 14 dni, <strong>jednakże</strong> rozpoczęcie świadczenia usługi cyfrowej (odblokowanie raportu za pomocą kredytu) przed upływem tego terminu, za wyraźną zgodą konsumenta, powoduje utratę prawa do odstąpienia od umowy w zakresie zużytego kredytu.<br/>
            2. Reklamacje związane z działaniem Aplikacji (np. błędy techniczne, niewygenerowanie raportu po pobraniu opłaty) należy zgłaszać na adres e-mail: <strong>anto.lab.kontakt@gmail.com</strong>.<br/>
            3. Reklamacje będą rozpatrywane w terminie 14 dni roboczych.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Postanowienia końcowe</h2>
          <p>
            1. Usługodawca zastrzega sobie prawo do wprowadzania zmian w Regulaminie z ważnych przyczyn (np. zmiana funkcjonalności, zmiana prawa). O zmianach Użytkownicy zostaną powiadomieni.<br/>
            2. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.<br/>
            3. Wszelkie spory rozstrzygane będą przez właściwe sądy powszechne.
          </p>
        </section>
      </main>
    </div>
  );
}
