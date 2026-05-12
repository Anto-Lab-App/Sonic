"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LoginRequiredModal } from "./LoginRequiredModal";

interface NoCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useLanguage } from '@/lib/i18n/LanguageContext';

export function NoCreditsModal({ isOpen, onClose }: NoCreditsModalProps) {
  const { t, language } = useLanguage();
  const { isSignedIn } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState<'unlock_1' | 'bundle_3' | null>(null);

  const handleCheckout = async (packageType: 'unlock_1' | 'bundle_3') => {
    if (!isSignedIn) {
      setShowLoginModal(true);
      return;
    }

    try {
      setIsLoading(packageType);
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType,
          locale: language
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowLoginModal(true);
          return;
        }
        throw new Error('Checkout failed');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert(t.auto.errors.checkoutFailed);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-sm overflow-hidden bg-[#0A0D18]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] pointer-events-auto"
            >
              {/* Premium Background Effects */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#00D1FF]/20 to-transparent opacity-50 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00D1FF]/30 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              <div className="p-8 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#0055FF] p-0.5 mb-6 shadow-[0_0_20px_rgba(0,209,255,0.4)]">
                  <div className="w-full h-full bg-[#0A0D18] rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#00D1FF]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  {t.auto.noCredits.title}
                </h2>

                <p className="text-sm text-foreground/70 mb-8 leading-relaxed">
                  {t.auto.noCredits.desc}
                </p>

                <div className="w-full flex flex-col gap-3">
                  {/* Single Scan Button */}
                  <button
                    onClick={() => handleCheckout('unlock_1')}
                    disabled={isLoading !== null}
                    className="w-full relative group overflow-hidden rounded-2xl bg-surface border border-white/10 text-white font-semibold text-[14px] tracking-wide h-12 transition-all hover:bg-white/5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading === 'unlock_1' ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#00D1FF]" />
                        <span>{t.modals.noCredits.buyBtn1}</span>
                      </>
                    )}
                  </button>

                  {/* PRO Plan Button (Bundle) */}
                  <button
                    onClick={() => handleCheckout('bundle_3')}
                    disabled={isLoading !== null}
                    className="w-full relative group overflow-hidden rounded-2xl bg-white text-black font-bold text-[15px] tracking-wide h-14 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF] via-[#0055FF] to-[#00D1FF] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    {isLoading === 'bundle_3' ? (
                      <Loader2 className="w-5 h-5 text-black animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-5 h-5 text-black" fill="currentColor" />
                        <span>{t.modals.noCredits.buyBtn3}</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="mt-5 text-sm font-medium text-foreground/50 hover:text-foreground/80 transition-colors"
                >
                  {t.modals.noCredits.maybeLater}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </AnimatePresence>
  );
}
