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
  openGraph: {
    title: "Sonic AI - Mechanik w Twojej kieszeni",
    description: "Wykorzystaj moc AI do diagnozowania awarii samochodu lub roweru w kilka sekund.",
    url: "https://sonic-diagnostic.vercel.app",
    siteName: "Sonic AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sonic AI Diagnostic Preview",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonic AI - Diagnostyka Pojazdów",
    description: "Błyskawiczna analiza usterek z Gemini AI.",
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
