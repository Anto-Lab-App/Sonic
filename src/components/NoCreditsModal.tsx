"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Zap, Loader2 } from "lucide-react";
import { useState } from "react";

interface NoCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoCreditsModal({ isOpen, onClose }: NoCreditsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Nie udało się rozpocząć płatności. Spróbuj ponownie później.');
      setIsLoading(false);
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
                  Koniec darmowych skanów
                </h2>

                <p className="text-sm text-foreground/70 mb-8 leading-relaxed">
                  Wykorzystałeś już swój darmowy kredyt diagnostyczny. Wykup pakiet PRO, aby zyskać nielimitowany dostęp do naszej zaawansowanej AI.
                </p>

                {/* PRO Plan Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden rounded-2xl bg-white text-black font-bold text-[15px] tracking-wide h-14 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF] via-[#0055FF] to-[#00D1FF] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-black animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-black" fill="currentColor" />
                      <span>Kup 3 skany PRO za 29 PLN</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="mt-4 text-sm font-medium text-foreground/50 hover:text-foreground/80 transition-colors"
                >
                  Może później
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
