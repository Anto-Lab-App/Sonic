"use client";

import React, { useState } from 'react';
import { X, Camera, Mic } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ContextModal({ onClose, variant = 'car' }: { onClose: () => void; variant?: 'car' | 'bike' }) {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [mileage, setMileage] = useState('');

  const quickTags = variant === 'bike'
    ? t.context.quickTagsBike
    : t.context.quickTagsCar;

  const conditions = variant === 'bike'
    ? t.context.whenBike
    : t.context.whenCar;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm text-foreground font-sans flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-surface-elevated border border-foreground/[0.03] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-foreground/[0.03]">
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">{t.context.title}</h2>
            <p className="text-sm text-muted mt-1 font-medium">{t.context.subtitle}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#131823] border border-foreground/[0.03] flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">

          {/* Przebieg */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {variant === 'bike' ? t.context.mileageBike : t.context.mileageCar}
            </label>
            <div className="relative">
              <input
                type="text"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder={variant === 'bike' ? t.context.mileageBikePh : t.context.mileageCarPh}
                className="w-full bg-background border border-foreground/[0.03] rounded-2xl p-5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* Opis problemu */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t.context.descTitle}</label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={variant === 'bike' ? t.context.descBikePh : t.context.descCarPh}
                className="w-full bg-background border border-foreground/[0.03] rounded-2xl p-5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none h-32"
              />
              <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#131823] border border-foreground/[0.03] flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Szybkie tagi */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t.context.quickTagsTitle}</label>
            <div className="flex flex-wrap gap-3">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-5 py-3 rounded-2xl text-sm font-medium transition-all border ${selectedTags.includes(tag)
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#131823] border-foreground/[0.03] text-muted hover:border-foreground/[0.06] hover:text-foreground/90'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Kiedy występuje */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t.context.whenOccurs}</label>
            <div className="grid grid-cols-2 gap-3">
              {conditions.map(cond => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond === selectedCondition ? null : cond)}
                  className={`px-5 py-4 rounded-2xl text-sm font-medium text-center transition-all border ${selectedCondition === cond
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#131823] border-foreground/[0.03] text-muted hover:border-foreground/[0.06] hover:text-foreground/90'
                    }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Dodaj zdjęcie */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t.context.visuals}</label>
            <button className="w-full bg-[#131823] border border-foreground/[0.03] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-surface-hover hover:border-foreground/[0.06] transition-all group">
              <div className="w-12 h-12 rounded-full bg-background border border-foreground/[0.03] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-muted group-hover:text-foreground/90" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold tracking-[0.15em] text-muted uppercase">{t.context.addPhoto}</span>
                <span className="text-xs text-muted font-medium">{t.context.optional}</span>
              </div>
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-foreground/[0.03] bg-surface-elevated flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-xs tracking-[0.15em] uppercase text-muted bg-[#131823] border border-foreground/[0.03] hover:bg-surface-hover hover:text-foreground/90 transition-colors">
            {t.cancel}
          </button>
          <button onClick={onClose} className="flex-[2] py-4 rounded-2xl font-bold text-xs tracking-[0.15em] uppercase text-foreground bg-blue-600 hover:bg-primary transition-colors shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            {t.context.save}
          </button>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1A2130;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2A3441;
        }
      `}</style>
    </div>
  );
}
