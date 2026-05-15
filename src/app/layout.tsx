import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ClerkProvider } from "@clerk/nextjs";
import { PWABanner } from "@/components/PWABanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Sonic AI - Zaawansowana Diagnostyka Pojazdów",
  description: "Błyskawiczna diagnoza usterek pojazdów i maszyn dzięki sztucznej inteligencji. Nagraj dźwięk, zrób zdjęcie i naprawiaj jak profesjonalista.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    title: "Sonic AI",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  metadataBase: new URL("https://sonicly.app"),
  openGraph: {
    title: "Sonic AI 🚗 Twój Osobisty Mechanik AI",
    description: "Zaoszczędź na mechaniku! Nagraj dźwięk lub zrób zdjęcie usterki, a nasza Sztuczna Inteligencja zdiagnozuje problem w kilka sekund. Kliknij i sprawdź za darmo!",
    url: "https://sonicly.app",
    siteName: "Sonicly.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sonic AI - Diagnoza Usterek z AI",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonic AI 🚗 Twój Osobisty Mechanik AI",
    description: "Zaoszczędź na mechaniku! Nagraj dźwięk lub zrób zdjęcie usterki, a AI zdiagnozuje problem w kilka sekund.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pl" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground selection:bg-primary/30`}>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              themes={['light', 'dark', 'pink']}
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <PWABanner />
            </ThemeProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
