import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="flex items-center px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto border-b border-foreground/5">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full bg-surface hover:bg-foreground/5 transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted" />
        </Link>
        <h1 className="text-sm font-semibold tracking-widest text-muted uppercase ml-4">Polityka Prywatności</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 prose prose-invert prose-blue">
        <h1 className="text-3xl font-bold mb-8">Polityka Prywatności</h1>
        <p className="text-sm text-muted mb-8">Ostatnia aktualizacja: [DATA]</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Informacje ogólne</h2>
          <p>
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez użytkowników w związku z korzystaniem z aplikacji Sonic ("Aplikacja"), której właścicielem jest <strong>[NAZWA FIRMY]</strong> z siedzibą w <strong>[ADRES FIRMY]</strong>, NIP: <strong>[NIP]</strong> ("Administrator").
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Jakie dane przetwarzamy?</h2>
          <p>Podczas korzystania z Aplikacji możemy przetwarzać następujące dane:</p>
          <ul>
            <li><strong>Dane konta:</strong> adres e-mail, identyfikator użytkownika (dostarczane za pośrednictwem usługi Clerk).</li>
            <li><strong>Dane diagnostyczne:</strong> pliki audio, wideo, zdjęcia oraz opisy problemów technicznych, które użytkownik dobrowolnie wgrywa w celu analizy przez algorytmy AI (w tym Google Vertex AI).</li>
            <li><strong>Dane analityczne i techniczne:</strong> adres IP, typ urządzenia, logi serwera.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Cel i podstawa przetwarzania</h2>
          <p>Dane przetwarzamy w następujących celach:</p>
          <ul>
            <li>Świadczenie usługi elektronicznej polegającej na diagnozie technicznej pojazdów (podstawa: wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
            <li>Obsługa konta użytkownika i płatności za pakiety PRO (podstawa: wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
            <li>Zapewnienie bezpieczeństwa, wykrywanie nadużyć i poprawa działania algorytmów AI (podstawa: prawnie uzasadniony interes, art. 6 ust. 1 lit. f RODO).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Udostępnianie danych</h2>
          <p>
            W celu świadczenia usług korzystamy z zaufanych podmiotów trzecich, którym możemy powierzać dane:
          </p>
          <ul>
            <li><strong>Clerk Inc.</strong> – do zarządzania tożsamością i logowaniem.</li>
            <li><strong>Google Cloud (w tym Vertex AI)</strong> – do przechowywania plików (Google Cloud Storage) oraz generowania analizy diagnostycznej. Zastrzegamy, że pliki diagnostyczne są automatycznie usuwane z Google Cloud Storage po zakończeniu analizy.</li>
            <li><strong>Stripe Inc.</strong> – w celu obsługi i procesowania płatności.</li>
          </ul>
          <p>Partnerzy ci działają zgodnie z własnymi politykami prywatności oraz przepisami o ochronie danych.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Prawa użytkowników (RODO)</h2>
          <p>Masz prawo do:</p>
          <ul>
            <li>Dostępu do swoich danych oraz otrzymania ich kopii.</li>
            <li>Sprostowania, usunięcia lub ograniczenia przetwarzania danych ("prawo do bycia zapomnianym"). Usunięcie konta w panelu aplikacji automatycznie skutkuje usunięciem danych powiązanych z profilem w naszej bazie.</li>
            <li>Wniesienia sprzeciwu wobec przetwarzania.</li>
            <li>Przenoszenia danych.</li>
            <li>Wniesienia skargi do organu nadzorczego (Prezesa Urzędu Ochrony Danych Osobowych).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Kontakt</h2>
          <p>W sprawach związanych z danymi osobowymi możesz skontaktować się z nami pod adresem e-mail: <strong>[EMAIL KONTAKTOWY]</strong>.</p>
        </section>
      </main>
    </div>
  );
}
