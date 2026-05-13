"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Download, X } from "lucide-react";

export function PWABanner() {
    const { t } = useLanguage();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(true); // Default true to avoid flash
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [isDismissed, setIsDismissed] = useState(true); // Default true to avoid flash

    useEffect(() => {
        // Check dismissed state
        const dismissed = localStorage.getItem("pwa-banner-dismissed") === "true";
        setIsDismissed(dismissed);

        // Check if already installed
        const isAppStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
        setIsStandalone(isAppStandalone);

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
            setIsDismissed(true);
            localStorage.setItem("pwa-banner-dismissed", "true");
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem("pwa-banner-dismissed", "true");
    };

    // If already installed, dismissed, or not iOS and no prompt available, hide.
    if (isStandalone || isDismissed || (!isIOS && !deferredPrompt)) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[120] animate-in slide-in-from-top-full duration-500">
            <div className="bg-primary/95 backdrop-blur-md text-primary-foreground p-4 pb-4 md:pb-4 shadow-xl">
                {showIOSPrompt ? (
                    <div className="flex items-start justify-between gap-4 max-w-5xl mx-auto">
                        <div className="text-sm font-medium leading-relaxed">
                            {t.settings.preferences.iosInstallInst}
                        </div>
                        <button onClick={handleDismiss} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">{t.settings.preferences.installApp}</span>
                            <span className="text-xs opacity-90">{t.settings.preferences.installDesc}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={handleInstallClick}
                                className="bg-white text-primary px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Download className="w-4 h-4" />
                                    <span>Instaluj</span>
                                </div>
                            </button>
                            <button onClick={handleDismiss} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
