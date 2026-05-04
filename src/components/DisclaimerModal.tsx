"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DisclaimerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
    const { t } = useLanguage();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-surface border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/40 hover:text-foreground"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner">
                                <ShieldAlert className="w-8 h-8 text-primary" />
                            </div>

                            <h2 className="text-xl font-bold mb-4 text-foreground">
                                {t.disclaimer.link}
                            </h2>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
                                <p className="text-sm text-foreground/70 leading-relaxed text-left">
                                    {t.disclaimer.fullText}
                                </p>

                                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-white/5 text-[11px] text-orange-400/80">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    <p className="text-left leading-tight">
                                        {t.disclaimer.shortNote}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:shadow-[0_0_30px_rgba(0,209,255,0.5)] uppercase tracking-widest text-xs"
                            >
                                {t.understand}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
