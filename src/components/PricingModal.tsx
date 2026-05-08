"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Check, X, ShieldAlert, Zap, Lock } from 'lucide-react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    diagnosisId: string;
}

export function PricingModal({ isOpen, onClose, diagnosisId }: PricingModalProps) {
    const { t, language } = useLanguage();
    const [isLoading, setIsLoading] = useState<'unlock_1' | 'bundle_3' | null>(null);

    if (!isOpen) return null;

    const handleCheckout = async (packageType: 'unlock_1' | 'bundle_3') => {
        setIsLoading(packageType);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packageType,
                    locale: language,
                    diagnosisId,
                }),
            });

            if (!res.ok) throw new Error('Checkout failed');

            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    const currentPrices = t.modals.pricing;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-lg bg-surface border border-foreground/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-muted" />
                    </button>

                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 relative">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">
                        {currentPrices.title}
                    </h2>
                    <p className="text-center text-muted text-sm md:text-base mb-8">
                        {currentPrices.desc}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option 1 */}
                        <div className="relative p-5 border border-foreground/10 rounded-2xl bg-background/50 hover:border-blue-500/50 transition-colors flex flex-col">
                            <h3 className="text-lg font-semibold text-foreground mb-1">{currentPrices.unlockTitle}</h3>
                            <p className="text-xs text-muted mb-4">{currentPrices.unlockDesc}</p>

                            <div className="mb-6 flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-foreground/90">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{currentPrices.analysis}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground/90">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{currentPrices.diy}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground/90">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{currentPrices.valuation}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="text-2xl font-bold text-foreground mb-3">{currentPrices.unlock}</div>
                                <button
                                    onClick={() => handleCheckout('unlock_1')}
                                    disabled={isLoading !== null}
                                    className="w-full py-3 bg-foreground/10 hover:bg-foreground/15 text-foreground font-semibold rounded-xl transition-colors border border-foreground/5 disabled:opacity-50"
                                >
                                    {isLoading === 'unlock_1' ? currentPrices.loading : currentPrices.unlockTitle}
                                </button>
                            </div>
                        </div>

                        {/* Option 2 */}
                        <div className="relative p-5 border-2 border-primary rounded-2xl bg-primary/5 flex flex-col overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                {currentPrices.bestValue}
                            </div>

                            <h3 className="text-lg font-semibold text-foreground mb-1">{currentPrices.bundleTitle}</h3>
                            <p className="text-xs text-muted mb-4">{currentPrices.bundleDesc}</p>

                            <div className="mb-6 flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-foreground/90">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{currentPrices.credits}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground/90">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="font-medium text-primary">{currentPrices.chat}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground/90">
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{currentPrices.priority}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="text-2xl font-bold text-primary mb-3">{currentPrices.bundle}</div>
                                <button
                                    onClick={() => handleCheckout('bundle_3')}
                                    disabled={isLoading !== null}
                                    className="w-full py-3 bg-primary hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isLoading === 'bundle_3' ? currentPrices.loading : currentPrices.buy}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}