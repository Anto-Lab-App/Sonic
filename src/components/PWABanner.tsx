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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-surface border border-border-subtle rounded-[2rem] shadow-2xl overflow-hidden relative slide-in-from-bottom-8 animate-in duration-500">
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 text-muted hover:text-foreground bg-surface-hover/50 hover:bg-surface-hover rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pb-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00D1FF]/20 to-[#0055FF]/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(0,209,255,0.2)]">
                        <Download className="w-8 h-8 text-[#00D1FF]" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{t.settings.preferences.installApp}</h3>
                    <p className="text-muted text-sm max-w-[260px]">
                        {t.settings.preferences.installDesc}
                    </p>
                </div>

                <div className="p-6 pt-0 space-y-3">
                    {showIOSPrompt ? (
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-sm text-primary text-center font-medium animate-in fade-in slide-in-from-top-2">
                            {t.settings.preferences.iosInstallInst}
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="w-full py-4 bg-gradient-to-r from-[#00D1FF] to-[#0055FF] text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(0,209,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,209,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            {t.settings.preferences.installAction}
                        </button>
                    )}

                    <button
                        onClick={handleDismiss}
                        className="w-full py-3 text-muted hover:text-foreground text-sm font-medium transition-colors"
                    >
                        {t.settings.preferences.maybeLater}
                    </button>
                </div>
            </div>
        </div>
    );
}
