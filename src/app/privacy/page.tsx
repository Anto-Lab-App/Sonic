"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const translations = {
  pl: {
    title: "Polityka Prywatności",
    lastUpdate: "Ostatnia aktualizacja: 11 maja 2026",
    sections: [
      {
        title: "1. Informacje ogólne",
        content: <p>Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez użytkowników w związku z korzystaniem z aplikacji Sonic ("Aplikacja"), której właścicielem i administratorem jest <strong>Sonicly</strong> ("Administrator").</p>
      },
      {
        title: "2. Jakie dane przetwarzamy?",
        content: (
          <>
            <p>Podczas korzystania z Aplikacji możemy przetwarzać następujące dane:</p>
            <ul>
              <li><strong>Dane konta:</strong> adres e-mail, identyfikator użytkownika (dostarczane za pośrednictwem usługi Clerk).</li>
              <li><strong>Dane diagnostyczne:</strong> pliki audio, wideo, zdjęcia oraz opisy problemów technicznych, które użytkownik dobrowolnie wgrywa w celu analizy przez algorytmy AI (w tym Google Vertex AI).</li>
              <li><strong>Dane analityczne i techniczne:</strong> adres IP, typ urządzenia, logi serwera.</li>
            </ul>
          </>
        )
      },
      {
        title: "3. Cel i podstawa przetwarzania",
        content: (
          <>
            <p>Dane przetwarzamy w następujących celach:</p>
            <ul>
              <li>Świadczenie usługi elektronicznej polegającej na diagnozie technicznej pojazdów (podstawa: wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
              <li>Obsługa konta użytkownika i płatności za pakiety PRO (podstawa: wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
              <li>Zapewnienie bezpieczeństwa, wykrywanie nadużyć i poprawa działania algorytmów AI (podstawa: prawnie uzasadniony interes, art. 6 ust. 1 lit. f RODO).</li>
            </ul>
          </>
        )
      },
      {
        title: "4. Udostępnianie danych",
        content: (
          <>
            <p>W celu świadczenia usług korzystamy z zaufanych podmiotów trzecich, którym możemy powierzać dane:</p>
            <ul>
              <li><strong>Clerk Inc.</strong> – do zarządzania tożsamością i logowaniem.</li>
              <li><strong>Google Cloud (w tym Vertex AI)</strong> – do przechowywania plików (Google Cloud Storage) oraz generowania analizy diagnostycznej. Zastrzegamy, że pliki diagnostyczne są automatycznie usuwane z Google Cloud Storage po zakończeniu analizy.</li>
              <li><strong>Stripe Inc.</strong> – w celu obsługi i procesowania płatności.</li>
            </ul>
            <p>Partnerzy ci działają zgodnie z własnymi politykami prywatności oraz przepisami o ochronie danych.</p>
          </>
        )
      },
      {
        title: "5. Prawa użytkowników (RODO)",
        content: (
          <>
            <p>Masz prawo do:</p>
            <ul>
              <li>Dostępu do swoich danych oraz otrzymania ich kopii.</li>
              <li>Sprostowania, usunięcia lub ograniczenia przetwarzania danych ("prawo do bycia zapomnianym"). Usunięcie konta w panelu aplikacji automatycznie skutkuje usunięciem danych powiązanych z profilem w naszej bazie.</li>
              <li>Wniesienia sprzeciwu wobec przetwarzania.</li>
              <li>Przenoszenia danych.</li>
              <li>Wniesienia skargi do organu nadzorczego (Prezesa Urzędu Ochrony Danych Osobowych).</li>
            </ul>
          </>
        )
      },
      {
        title: "6. Kontakt",
        content: <p>W sprawach związanych z danymi osobowymi możesz skontaktować się z nami pod adresem e-mail: <strong>antoni@sonicly.app</strong>.</p>
      }
    ]
  },
  en: {
    title: "Privacy Policy",
    lastUpdate: "Last updated: May 11, 2026",
    sections: [
      {
        title: "1. General Information",
        content: <p>This Privacy Policy sets out the rules for processing and protecting personal data provided by users in connection with the use of the Sonic application ("Application"), owned and administered by <strong>Sonicly</strong> ("Administrator").</p>
      },
      {
        title: "2. What data do we process?",
        content: (
          <>
            <p>When you use the Application, we may process the following data:</p>
            <ul>
              <li><strong>Account data:</strong> email address, user ID (provided via Clerk service).</li>
              <li><strong>Diagnostic data:</strong> audio, video, photo files and descriptions of technical problems voluntarily uploaded by the user for analysis by AI algorithms (including Google Vertex AI).</li>
              <li><strong>Analytical and technical data:</strong> IP address, device type, server logs.</li>
            </ul>
          </>
        )
      },
      {
        title: "3. Purpose and legal basis for processing",
        content: (
          <>
            <p>We process data for the following purposes:</p>
            <ul>
              <li>Providing an electronic service consisting of technical diagnosis of vehicles (basis: performance of a contract, Art. 6(1)(b) GDPR).</li>
              <li>Managing user accounts and PRO package payments (basis: performance of a contract, Art. 6(1)(b) GDPR).</li>
              <li>Ensuring security, detecting fraud, and improving AI algorithms (basis: legitimate interest, Art. 6(1)(f) GDPR).</li>
            </ul>
          </>
        )
      },
      {
        title: "4. Data Sharing",
        content: (
          <>
            <p>To provide our services, we use trusted third parties to whom we may entrust data:</p>
            <ul>
              <li><strong>Clerk Inc.</strong> – for identity and login management.</li>
              <li><strong>Google Cloud (including Vertex AI)</strong> – for storing files (Google Cloud Storage) and generating diagnostic analysis. Please note that diagnostic files are automatically deleted from Google Cloud Storage after analysis.</li>
              <li><strong>Stripe Inc.</strong> – for handling and processing payments.</li>
            </ul>
            <p>These partners operate according to their own privacy policies and data protection regulations.</p>
          </>
        )
      },
      {
        title: "5. User rights (GDPR)",
        content: (
          <>
            <p>You have the right to:</p>
            <ul>
              <li>Access your data and receive a copy of it.</li>
              <li>Rectify, delete or restrict data processing (the "right to be forgotten"). Deleting an account in the app dashboard automatically deletes profile-related data in our database.</li>
              <li>Object to processing.</li>
              <li>Data portability.</li>
              <li>Lodge a complaint with a supervisory authority.</li>
            </ul>
          </>
        )
      },
      {
        title: "6. Contact",
        content: <p>For matters related to personal data, you can contact us at: <strong>antoni@sonicly.app</strong>.</p>
      }
    ]
  },
  de: {
    title: "Datenschutzerklärung",
    lastUpdate: "Zuletzt aktualisiert: 11. Mai 2026",
    sections: [
      {
        title: "1. Allgemeine Informationen",
        content: <p>Diese Datenschutzerklärung regelt die Verarbeitung und den Schutz der von Nutzern im Zusammenhang mit der Nutzung der Sonic-App ("App") bereitgestellten personenbezogenen Daten. Eigentümer und Administrator der App ist <strong>Sonicly</strong> ("Administrator").</p>
      },
      {
        title: "2. Welche Daten verarbeiten wir?",
        content: (
          <>
            <p>Bei der Nutzung der App können wir folgende Daten verarbeiten:</p>
            <ul>
              <li><strong>Kontodaten:</strong> E-Mail-Adresse, Benutzer-ID (bereitgestellt über den Clerk-Service).</li>
              <li><strong>Diagnosedaten:</strong> Audio-, Video-, Fotodateien und Beschreibungen technischer Probleme, die vom Nutzer freiwillig zur Analyse durch KI-Algorithmen hochgeladen werden (inkl. Google Vertex AI).</li>
              <li><strong>Analytische und technische Daten:</strong> IP-Adresse, Gerätetyp, Serverprotokolle.</li>
            </ul>
          </>
        )
      },
      {
        title: "3. Zweck und Rechtsgrundlage",
        content: (
          <>
            <p>Wir verarbeiten Daten zu folgenden Zwecken:</p>
            <ul>
              <li>Erbringung eines elektronischen Dienstes zur technischen Diagnose von Fahrzeugen (Grundlage: Vertragserfüllung, Art. 6 Abs. 1 lit. b DSGVO).</li>
              <li>Verwaltung von Benutzerkonten und Zahlungen für PRO-Pakete (Grundlage: Vertragserfüllung, Art. 6 Abs. 1 lit. b DSGVO).</li>
              <li>Sicherstellung der Sicherheit, Betrugserkennung und Verbesserung von KI-Algorithmen (Grundlage: berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO).</li>
            </ul>
          </>
        )
      },
      {
        title: "4. Datenweitergabe",
        content: (
          <>
            <p>Zur Erbringung unserer Dienste nutzen wir vertrauenswürdige Dritte, denen wir Daten anvertrauen können:</p>
            <ul>
              <li><strong>Clerk Inc.</strong> – für Identitäts- und Anmeldungsverwaltung.</li>
              <li><strong>Google Cloud (inkl. Vertex AI)</strong> – zur Speicherung von Dateien (Google Cloud Storage) und Erstellung von Diagnoseanalysen. Diagnosedateien werden nach der Analyse automatisch gelöscht.</li>
              <li><strong>Stripe Inc.</strong> – zur Abwicklung von Zahlungen.</li>
            </ul>
            <p>Diese Partner handeln gemäß ihren eigenen Datenschutzrichtlinien.</p>
          </>
        )
      },
      {
        title: "5. Nutzerrechte (DSGVO)",
        content: (
          <>
            <p>Sie haben das Recht auf:</p>
            <ul>
              <li>Zugang zu Ihren Daten und Erhalt einer Kopie.</li>
              <li>Berichtigung, Löschung oder Einschränkung der Verarbeitung ("Recht auf Vergessenwerden"). Die Löschung des Kontos führt zur automatischen Löschung Ihrer Daten in unserer Datenbank.</li>
              <li>Widerspruch gegen die Verarbeitung.</li>
              <li>Datenübertragbarkeit.</li>
              <li>Beschwerde bei einer Aufsichtsbehörde.</li>
            </ul>
          </>
        )
      },
      {
        title: "6. Kontakt",
        content: <p>Bei Fragen zu personenbezogenen Daten können Sie uns kontaktieren unter: <strong>antoni@sonicly.app</strong>.</p>
      }
    ]
  },
  es: {
    title: "Política de Privacidad",
    lastUpdate: "Última actualización: 11 de mayo de 2026",
    sections: [
      {
        title: "1. Información General",
        content: <p>Esta Política de Privacidad establece las reglas para el procesamiento y protección de los datos personales proporcionados por los usuarios en relación con el uso de la aplicación Sonic ("Aplicación"), propiedad y administrada por <strong>Sonicly</strong> ("Administrador").</p>
      },
      {
        title: "2. ¿Qué datos procesamos?",
        content: (
          <>
            <p>Al utilizar la Aplicación, podemos procesar los siguientes datos:</p>
            <ul>
              <li><strong>Datos de cuenta:</strong> dirección de correo electrónico, ID de usuario (proporcionado a través de Clerk).</li>
              <li><strong>Datos de diagnóstico:</strong> archivos de audio, video, fotos y descripciones de problemas técnicos subidos voluntariamente para su análisis mediante IA (incluido Google Vertex AI).</li>
              <li><strong>Datos analíticos y técnicos:</strong> dirección IP, tipo de dispositivo, registros del servidor.</li>
            </ul>
          </>
        )
      },
      {
        title: "3. Propósito y base legal",
        content: (
          <>
            <p>Procesamos datos para los siguientes propósitos:</p>
            <ul>
              <li>Prestación de un servicio electrónico de diagnóstico técnico (base: ejecución de un contrato, Art. 6(1)(b) RGPD).</li>
              <li>Gestión de cuentas y pagos de paquetes PRO (base: ejecución de un contrato, Art. 6(1)(b) RGPD).</li>
              <li>Garantizar la seguridad, detección de fraudes y mejora de algoritmos de IA (base: interés legítimo, Art. 6(1)(f) RGPD).</li>
            </ul>
          </>
        )
      },
      {
        title: "4. Compartir datos",
        content: (
          <>
            <p>Para proporcionar nuestros servicios, utilizamos terceros de confianza a los que podemos confiar datos:</p>
            <ul>
              <li><strong>Clerk Inc.</strong> – para la gestión de identidad e inicio de sesión.</li>
              <li><strong>Google Cloud (incluido Vertex AI)</strong> – para almacenar archivos (Google Cloud Storage) y generar análisis de diagnóstico. Los archivos de diagnóstico se eliminan automáticamente tras el análisis.</li>
              <li><strong>Stripe Inc.</strong> – para el manejo de pagos.</li>
            </ul>
            <p>Estos socios operan de acuerdo con sus propias políticas de privacidad.</p>
          </>
        )
      },
      {
        title: "5. Derechos del usuario (RGPD)",
        content: (
          <>
            <p>Usted tiene derecho a:</p>
            <ul>
              <li>Acceder a sus datos y recibir una copia.</li>
              <li>Rectificar, eliminar o limitar el procesamiento de datos ("derecho al olvido"). Eliminar una cuenta en la aplicación elimina automáticamente los datos relacionados en nuestra base.</li>
              <li>Oponerse al procesamiento.</li>
              <li>Portabilidad de los datos.</li>
              <li>Presentar una queja ante una autoridad supervisora.</li>
            </ul>
          </>
        )
      },
      {
        title: "6. Contacto",
        content: <p>Para asuntos relacionados con datos personales, contáctenos en: <strong>antoni@sonicly.app</strong>.</p>
      }
    ]
  }
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const currentLang = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="flex items-center px-4 py-4 md:px-6 md:py-6 max-w-4xl mx-auto border-b border-foreground/5">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full bg-surface hover:bg-foreground/5 transition-colors">
          <ChevronLeft className="w-5 h-5 text-muted" />
        </Link>
        <h1 className="text-sm font-semibold tracking-widest text-muted uppercase ml-4">{currentLang.title}</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 prose prose-invert prose-blue">
        <h1 className="text-3xl font-bold mb-8">{currentLang.title}</h1>
        <p className="text-sm text-muted mb-8">{currentLang.lastUpdate}</p>

        {currentLang.sections.map((section, index) => (
          <section key={index} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            {section.content}
          </section>
        ))}
      </main>
    </div>
  );
}
