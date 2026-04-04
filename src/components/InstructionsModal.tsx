"use client";

import React, { useState } from 'react';
import { Video, Timer, ChevronUp, Check, Bike, SunMedium, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface InstructionsModalProps {
  onProceed: (dontShowAgain: boolean) => void;
  isAudioMode?: boolean;
  variant?: 'car' | 'bike';
}

export function InstructionsModal({ onProceed, isAudioMode = true, variant = 'car' }: InstructionsModalProps) {
  const { t } = useLanguage();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md text-foreground font-sans flex items-center justify-center p-4">
      <div className="bg-surface border border-border-subtle rounded-[32px] p-8 max-w-[420px] w-full shadow-2xl transform transition-all">
        <h2 className="text-[22px] font-semibold mb-8 text-gray-100 text-center leading-tight">
          {t.instructions.title} 🎯
        </h2>

        <div className="space-y-6 mb-10">
          {variant === 'bike' ? (
            <>
              <div className="flex items-start gap-4">
                <div className="bg-surface-hover border border-border-subtle p-3 rounded-2xl text-orange-400 shrink-0 shadow-inner">
                  <SunMedium className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="pt-1">
                  <p className="text-gray-400 text-[15px] leading-relaxed">
                    {t.instructions.bike.light}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-surface-hover border border-border-subtle p-3 rounded-2xl text-blue-400 shrink-0 shadow-inner">
                  <Video className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="pt-1">
                  <p className="text-gray-400 text-[15px] leading-relaxed">
                    {t.instructions.bike.video}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-surface-hover border border-border-subtle p-3 rounded-2xl text-emerald-400 shrink-0 shadow-inner">
                  <Bike className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="pt-1">
                  <p className="text-gray-400 text-[15px] leading-relaxed">
                    {t.instructions.bike.stable}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-4">
                <div className="bg-surface-hover border border-border-subtle p-3 rounded-2xl text-primary shrink-0 shadow-inner">
                  <ChevronUp className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="pt-1">
                  <p className="text-gray-400 text-[15px] leading-relaxed">
                    {t.instructions.car.light}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-surface-hover border border-border-subtle p-3 rounded-2xl text-purple-400 shrink-0 shadow-inner">
                  <Video className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="pt-1">
                  <p className="text-gray-400 text-[15px] leading-relaxed">
                    {t.instructions.car.video}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-surface-hover border border-border-subtle p-3 rounded-2xl text-red-500 shrink-0 shadow-inner">
                  <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="pt-1">
                  <p className="text-gray-400 text-[15px] leading-relaxed">
                    {t.instructions.car.secure}
                  </p>
                </div>
              </div>

              {isAudioMode && (
                <div className="flex items-start gap-4">
                  <div className="bg-surface-hover border border-border-subtle p-3 rounded-2xl text-emerald-400 shrink-0 shadow-inner">
                    <Timer className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div className="pt-1">
                    <p className="text-gray-400 text-[15px] leading-relaxed">
                      {t.instructions.car.steps}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => onProceed(dontShowAgain)}
          className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-foreground font-semibold py-4 rounded-2xl transition-colors text-[13px] tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          {t.understand}
        </button>

        <div
          className="mt-6 flex items-center justify-center gap-3 cursor-pointer group"
          onClick={() => setDontShowAgain(!dontShowAgain)}
        >
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-[#2A3646] bg-surface-elevated group-hover:border-[#3B82F6]'}`}>
            {dontShowAgain && <Check className="w-3.5 h-3.5 text-foreground" strokeWidth={3} />}
          </div>
          <span className="text-gray-500 text-[13px] select-none group-hover:text-gray-400 transition-colors">{t.dontShow}</span>
        </div>
      </div>
    </div>
  );
}
