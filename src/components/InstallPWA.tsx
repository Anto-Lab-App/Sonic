"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Download, Smartphone } from "lucide-react";

export function InstallPWA() {
    const { t } = useLanguage();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsStandalone(true);
            return;
        }

        // Detect iOS
        const ua = window.navigator.userAgent;
        const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Listen for Android beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSPrompt(true);
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    // If already installed, or not iOS and no prompt available, don't show the main button block.
    if (isStandalone || (!isIOS && !deferredPrompt)) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-[2rem] border border-primary/20 p-8 space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <Smartphone className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-medium">{t.settings.preferences.installApp}</h3>
                    <p className="text-muted text-sm">{t.settings.preferences.installDesc}</p>
                </div>
            </div>

            <button
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
                <Download className="w-5 h-5" />
                {t.settings.preferences.installApp}
            </button>

            {showIOSPrompt && (
                <div className="mt-4 p-4 bg-background rounded-xl border border-border-subtle text-sm text-foreground/80 animate-in fade-in slide-in-from-top-2">
                    {t.settings.preferences.iosInstallInst}
                </div>
            )}
        </div>
    );
}
