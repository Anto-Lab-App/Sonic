"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  AlertTriangle,
  ChevronLeft,
  Wrench,
  Settings2,
  BrainCircuit,
  Activity,
  RefreshCw,
  Gauge,
  CircleDashed,
  Hammer
} from 'lucide-react';
import type { Diagnosis } from '@/types/diagnosis';

const repairTimeData = [
  { stage: 'Diagnoza', minutes: 10, color: '#3b82f6' },
  { stage: 'Demontaż', minutes: 15, color: '#8b5cf6' },
  { stage: 'Czyszczenie', minutes: 10, color: '#eab308' },
  { stage: 'Wymiana/Reg.', minutes: 25, color: '#ef4444' },
  { stage: 'Testy', minutes: 5, color: '#10b981' },
];

interface BikeDiagnosisReportProps {
  onClose: () => void;
  data?: Diagnosis;
}

export function BikeDiagnosisReport({ onClose, data }: BikeDiagnosisReportProps) {
  const { t } = useLanguage();

  // Use AI data when available, fall back to hardcoded defaults
  const title = data?.title ?? 'Krytyczne rozciągnięcie łańcucha (>1%) oraz uszkodzenie zębów koronki.';
  const description = data?.description ?? 'Na podstawie analizy wizualnej/akustycznej stwierdzono zbyt duże odległości między ogniwami w łańcuchu rowerowym. Prowadzi to do przeskakiwania łańcucha podczas mocnego obciążenia (np. podjazdów) oraz niszczenia tarczy korby.';
  const criticality = data?.criticality ?? 'Wysokie Zużycie';
  const confidenceScore = data?.confidence_score ?? 88;
  const audioAnalysis = data?.audio_analysis;
  const aiReasoning = data?.ai_reasoning;
  const recommendedActions = data?.recommended_actions;
  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] overflow-y-auto bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-6 max-w-7xl mx-auto">
        <button onClick={onClose} className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface border border-border-subtle hover:bg-surface-elevated transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-muted" />
        </button>
        <h1 className="text-xs md:text-sm font-semibold tracking-widest text-muted uppercase">{t.report.title}</h1>
        <div className="w-10 h-10 md:w-12 md:h-12"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-6 md:px-6 md:pb-12 space-y-4 md:space-y-6">

        {/* Top Section: Main Diagnosis & Confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Main Diagnosis */}
          <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl md:rounded-[2rem] p-5 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-orange-500/10 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative p-2 md:p-3.5 bg-orange-500/10 rounded-xl md:rounded-2xl ring-1 ring-inset ring-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-400 relative z-10" />
                </div>
                <div>
                  <h2 className="text-xs md:text-sm font-bold text-orange-400 uppercase tracking-wider">{t.report.urgent}</h2>
                  <p className="text-[10px] md:text-xs text-muted/80 mt-0.5 md:mt-1 font-medium">Napęd (Łańcuch / Kaseta)</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-orange-500/10 ring-1 ring-inset ring-orange-500/20 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Settings2 className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                <span className="text-xs md:text-sm font-semibold text-orange-400">{criticality}</span>
              </div>
            </div>

            <h3 className="text-lg md:text-3xl font-medium text-foreground mb-2 md:mb-4 leading-tight">
              {title}
            </h3>
            <p className="text-muted leading-relaxed max-w-3xl text-xs md:text-base">
              {description}
            </p>
          </div>

          {/* Confidence Score */}
          <div className="bg-surface border border-border-subtle rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center relative overflow-hidden gap-4 md:gap-0">
            <div className="absolute top-1/2 left-1/2 w-32 h-32 md:w-48 md:h-48 bg-primary/10 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:items-center flex-1">
              <h2 className="text-[10px] md:text-xs font-bold text-muted/80 uppercase tracking-widest mb-2 md:mb-6 md:text-center">{t.report.confidence}</h2>
              <p className="hidden md:block text-xs text-muted mt-6 text-center font-medium">
                {audioAnalysis?.characteristics ?? 'Porównano geometrię zębatek (rekinia płetwa) oraz odstępów rolek.'}
              </p>
              <button onClick={onClose} className="mt-2 md:mt-6 flex w-fit items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-primary/10 hover:bg-surface-elevated text-primary ring-1 ring-inset ring-primary/20 rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold z-10 cursor-pointer shadow-[0_0_15px_rgba(var(--color-primary),0.1)]">
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                {t.report.newScan}
              </button>
            </div>

            <div className="relative flex items-center justify-center w-24 h-24 md:w-40 md:h-40 shrink-0">
              <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.15)_0%,transparent_60%)] pointer-events-none"></div>

              <svg className="w-full h-full transform -rotate-90 overflow-visible z-10" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="bikeProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border-subtle)" strokeWidth="6" />

                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="url(#bikeProgressGradient)"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={Math.round(283 * (1 - confidenceScore / 100))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center z-20">
                <span className="text-3xl md:text-5xl font-light text-foreground tracking-tighter">
                  {confidenceScore}<span className="text-base md:text-2xl text-primary font-normal ml-0.5">%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Data & Thinking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

          {/* What it heard / saw (Input Data) */}
          <div className="bg-surface border border-border-subtle rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/20">
                <CircleDashed className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.inputAnalysis}</h2>
            </div>

            <div className="space-y-3 md:space-y-5">
              <p className="text-muted text-xs md:text-sm leading-relaxed">
                <strong className="text-foreground font-semibold">Nagrane:</strong> {audioAnalysis?.recorded ?? 'Zaobserwowano mocne "zaostrzenie" zębów na bocznych tarczach kasety, często określane potocznie mianem zębów rekina. Zęby są cieńsze.'}
              </p>
              <p className="text-muted text-xs md:text-sm leading-relaxed">
                <strong className="text-foreground font-semibold">Cechy:</strong> {audioAnalysis?.characteristics ?? 'Obraz optyczny wskazuje na asymetryczne wcięcie łańcucha w dolnej prowadnicy tylnej przerzutki, co objawia się trzeszczeniem przy napinaniu.'}
              </p>

              <div className="pt-2 md:pt-4 flex flex-wrap gap-2">
                {(audioAnalysis?.tags ?? ['Luzy boczne tarczy', 'Zniekształcona kaseta', 'Wymagany przymiar']).map((tag, i) => (
                  <span key={i} className={`px-2.5 py-1 md:px-3 md:py-1.5 ${i === 0 ? 'bg-surface-hover text-orange-400 ring-1 ring-inset ring-orange-500/20' : 'bg-surface-hover text-foreground/90 ring-1 ring-inset ring-foreground/5'} rounded-lg md:rounded-xl text-[10px] md:text-xs font-medium shadow-sm flex items-center gap-1 md:gap-1.5`}>
                    {i === 0 && <Activity className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Chain of Thought */}
          <div className="bg-surface border border-border-subtle rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
              <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl md:rounded-2xl border border-purple-500/20">
                <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.aiAlgorithm}</h2>
            </div>

            <div className="space-y-4 md:space-y-6 relative before:absolute before:inset-0 before:ml-[9px] md:before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-purple-500/30 before:to-transparent">

              {(aiReasoning ?? [
                { step: 'Identyfikacja ubytków materiału', detail: 'Profil zaokrągleń zębów kasety nie zgadza się ze wzorcem referencyjnym (Shimano HG).' },
                { step: 'Relacja między zębatką a łańcuchem', detail: 'Wykryta minimalna przerwa między rolką łańcucha a wrębem zębatki pod napięciem wskazuje rozciągnięcie > 1.0.' },
                { step: 'Werdykt naprawczy', detail: 'Sam nowy łańcuch będzie "skakać". Rekomenduje się wymianę całego układu (Kaseta + Łańcuch).' },
              ]).map((rs, i) => (
                <div key={i} className="relative flex items-start gap-4 md:gap-5">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-surface border-2 border-purple-500/50 flex items-center justify-center shrink-0 mt-0.5 z-10 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-foreground">{rs.step}</h4>
                    <p className="text-[10px] md:text-sm text-muted mt-1 md:mt-1.5 leading-relaxed">{rs.detail}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Bottom Section: Actions & Params */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Recommended Actions */}
          <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20">
                <Wrench className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.bikeWorkshop}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
              {(recommendedActions ?? [
                { title: 'Weryfikacja przymiarem', desc: 'Dla pewności wsuń przymiar do łańcucha. Jeśli przymiar o wskaźniku 1.0 wpada w pełni w ogniwo – diagnoza w 100% się zgadza.' },
                { title: 'Skuwacz i Bacik', desc: 'Będziesz potrzebował narzędzi rowerowych: Skuwacza do przerwania starego łańcucha oraz klucza francuskiego i tzw. "bacika" na kasetę.' },
                { title: 'Wymiana komponentów', desc: 'Ściągnij starą kasetę, nałóż nową stosując kompatybilność rzędowości. Zmierz i skróć nowy łańcuch przypinając go na spinkę (Quick-Link).' },
                { title: 'Regulacja przerzutki', desc: 'Po założeniu nowych rzędów wyreguluj delikatnie naprężenie śruby tylnej przerzutki (śruba baryłkowa), aby wrzucała precyzyjniej.' },
              ]).map((action, i) => (
                <div key={i} className="p-3 md:p-5 bg-background border border-border-subtle rounded-xl md:rounded-2xl transition-colors">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-3">
                    <span className="flex items-center justify-center w-5 h-5 md:w-7 md:h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold">{i + 1}</span>
                    <h4 className="text-xs md:text-sm font-semibold text-foreground">{action.title}</h4>
                  </div>
                  <p className="text-[10px] md:text-sm text-muted pl-7 md:pl-10 leading-relaxed">{action.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Parameters */}
          <div className="bg-surface border border-border-subtle rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/20">
                <Hammer className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.repairData}</h2>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
              {/* Repair Time Chart */}
              <div className="bg-background rounded-xl p-4 border border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-muted">
                    <Wrench className="w-4 h-4" />
                    <span className="text-xs md:text-sm font-medium">{t.report.estimatedTimeWorkshop}</span>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-foreground">~65 min</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={repairTimeData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="stage" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-surface border border-border-subtle px-3 py-2 rounded-lg shadow-xl ring-1 ring-inset ring-foreground/5">
                                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-1">{payload[0].payload.stage}</p>
                                <p className="text-sm text-foreground font-bold flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></span>
                                  {payload[0].value} min
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="minutes" radius={[0, 4, 4, 0]} barSize={12}>
                        {repairTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tools required block */}
              <div className="group bg-background p-3 md:p-4 rounded-xl border border-border-subtle">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Settings2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] md:text-xs font-medium">{t.report.toolsNeeded}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-surface-hover px-2 py-1 rounded text-foreground/80">Skuwacz łańcucha</span>
                  <span className="bg-surface-hover px-2 py-1 rounded text-foreground/80">Klucz do kaset (Bacik)</span>
                  <span className="bg-surface-hover px-2 py-1 rounded text-foreground/80">Imbus 5mm</span>
                  <span className="bg-surface-hover px-2 py-1 rounded text-foreground/80">Rękawiczki smarne</span>
                </div>
              </div>

              {/* Replacement Parts Cost logic or tags */}
              <div className="pt-4 border-t border-border-subtle">
                <p className="text-[10px] md:text-xs font-semibold text-muted/80 uppercase tracking-wider mb-2 md:mb-3">{t.report.partsCost}</p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <span className="px-2 py-1 md:px-3 md:py-1.5 bg-surface-hover text-primary rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold ring-1 ring-inset ring-primary/20 shadow-sm cursor-pointer">Łańcuch (100 - 250 PLN)</span>
                  <span className="px-2 py-1 md:px-3 md:py-1.5 bg-surface-hover text-primary rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold ring-1 ring-inset ring-primary/20 shadow-sm cursor-pointer">Kaseta (150 - 600 PLN)</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
