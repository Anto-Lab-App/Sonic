"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Diagnosis } from '@/types/diagnosis';
import {
  AlertTriangle,
  ChevronLeft,
  Volume2,
  BrainCircuit,
  Wrench,
  BarChart3,
  Clock,
  ShieldAlert,
  Activity,
  RefreshCw
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "5/5" → 5, "3/5" → 3 etc. */
function parseComplexity(raw: string): { value: number; max: number } {
  const parts = raw.split('/');
  return {
    value: parseInt(parts[0], 10) || 0,
    max: parseInt(parts[1], 10) || 5,
  };
}

/** Parse "95%" → 95 */
function parsePercent(raw: string): number {
  return parseInt(raw.replace('%', ''), 10) || 0;
}

/** Map estimated_time_hours into a simplified repair-stage breakdown for the chart. */
function buildRepairTimeData(totalHours: number) {
  // Proportional allocation (diagnosis 8%, teardown 25%, replacement 50%, assembly 17%)
  return [
    { stage: 'Diagnoza', hours: Math.round(totalHours * 0.08) || 1, color: '#3b82f6' },
    { stage: 'Demontaż', hours: Math.round(totalHours * 0.25), color: '#8b5cf6' },
    { stage: 'Wymiana', hours: Math.round(totalHours * 0.50), color: '#ef4444' },
    { stage: 'Montaż', hours: Math.round(totalHours * 0.17), color: '#10b981' },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DiagnosisReportProps {
  onClose: () => void;
  data: Diagnosis;
}

export function DiagnosisReport({ onClose, data }: DiagnosisReportProps) {
  const { t } = useLanguage();

  const complexity = parseComplexity(data.parameters.complexity);
  const riskPercent = parsePercent(data.parameters.risk_level);
  const repairTimeData = buildRepairTimeData(data.parameters.estimated_time_hours);

  // Determine criticality color
  const isCritical = data.criticality.toLowerCase().includes('krytyczn');
  const critColor = isCritical ? 'red' : 'yellow';

  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] overflow-y-auto bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-6 max-w-7xl mx-auto">
        <button onClick={onClose} className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface border border-foreground/5 hover:bg-foreground/5 transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-muted" />
        </button>
        <h1 className="text-xs md:text-sm font-semibold tracking-widest text-muted uppercase">{t.report.title}</h1>
        <div className="w-10 h-10 md:w-12 md:h-12"></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-6 md:px-6 md:pb-12 space-y-4 md:space-y-6">

        {/* Top Section: Main Diagnosis & Confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Main Diagnosis */}
          <div className="lg:col-span-2 bg-surface border border-foreground/5 rounded-2xl md:rounded-[2rem] p-5 md:p-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-${critColor}-500/5 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none`}></div>

            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`relative p-2 md:p-3.5 bg-${critColor}-500/10 rounded-xl md:rounded-2xl ring-1 ring-inset ring-${critColor}-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]`}>
                  <AlertTriangle className={`w-5 h-5 md:w-6 md:h-6 text-${critColor}-400 relative z-10`} />
                </div>
                <div>
                  <h2 className={`text-xs md:text-sm font-bold text-${critColor}-400 uppercase tracking-wider`}>{t.report.urgent}</h2>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-${critColor}-500/10 ring-1 ring-inset ring-${critColor}-500/20 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.1)]`}>
                <ShieldAlert className={`w-3 h-3 md:w-4 md:h-4 text-${critColor}-400`} />
                <span className={`text-xs md:text-sm font-semibold text-${critColor}-400`}>{data.criticality}</span>
              </div>
            </div>

            <h3 className="text-lg md:text-3xl font-medium text-foreground mb-2 md:mb-4 leading-tight">
              {data.title}
            </h3>
            <p className="text-muted leading-relaxed max-w-3xl text-xs md:text-base">
              {data.description}
            </p>
          </div>

          {/* Confidence Score */}
          <div className="bg-surface border border-foreground/5 rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center relative overflow-hidden gap-4 md:gap-0">
            <div className="absolute top-1/2 left-1/2 w-32 h-32 md:w-48 md:h-48 bg-primary/10 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:items-center flex-1">
              <h2 className="text-[10px] md:text-xs font-bold text-muted/80 uppercase tracking-widest mb-2 md:mb-6 md:text-center">{t.report.confidence}</h2>
              <p className="hidden md:block text-xs text-muted mt-6 text-center font-medium">
                Wysoka zgodność z wzorcami uszkodzeń mechanicznych z bazy danych.
              </p>
              <button onClick={onClose} className="mt-2 md:mt-6 flex w-fit items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-primary/10 hover:bg-primary/20 text-primary ring-1 ring-inset ring-blue-500/20 rounded-lg md:rounded-xl transition-all text-xs md:text-sm font-semibold z-10 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                {t.report.newScan}
              </button>
            </div>

            <div className="relative flex items-center justify-center w-24 h-24 md:w-40 md:h-40 shrink-0">
              <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_60%)] pointer-events-none"></div>

              {/* Circular Progress – driven by confidence_score */}
              <svg className="w-full h-full transform -rotate-90 overflow-visible z-10" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
                {/* Glow */}
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * data.confidence_score) / 100}
                  strokeLinecap="round"
                  filter="url(#blurGlow)"
                  opacity="0.6"
                />
                {/* Main */}
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * data.confidence_score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center z-20">
                <span className="text-3xl md:text-5xl font-light text-foreground tracking-tighter">
                  {data.confidence_score}<span className="text-base md:text-2xl text-primary font-normal ml-0.5">%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Audio Analysis & AI Reasoning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

          {/* What it heard */}
          <div className="bg-surface border border-foreground/5 rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/20">
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.audioAnalysis}</h2>
            </div>

            <div className="space-y-3 md:space-y-5">
              <p className="text-muted text-xs md:text-sm leading-relaxed">
                <strong className="text-foreground font-semibold">Zarejestrowano:</strong> {data.audio_analysis.recorded}
              </p>
              <p className="text-muted text-xs md:text-sm leading-relaxed">
                <strong className="text-foreground font-semibold">Charakterystyka:</strong> {data.audio_analysis.characteristics}
              </p>

              <div className="pt-2 md:pt-4 flex flex-wrap gap-2">
                {data.audio_analysis.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 md:px-3 md:py-1.5 bg-[#1e293b]/80 text-blue-300 rounded-lg md:rounded-xl text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-1.5 ring-1 ring-inset ring-blue-500/20 shadow-sm">
                    {i === 0 && <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />}
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Chain of Thought */}
          <div className="bg-surface border border-foreground/5 rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
              <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl md:rounded-2xl border border-purple-500/20">
                <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.aiReasoning}</h2>
            </div>

            <div className="space-y-4 md:space-y-6 relative before:absolute before:inset-0 before:ml-[9px] md:before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-purple-500/30 before:to-transparent">
              {data.ai_reasoning.map((step, i) => (
                <div key={i} className="relative flex items-start gap-4 md:gap-5">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-surface border-2 border-purple-500/50 flex items-center justify-center shrink-0 mt-0.5 z-10 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-foreground">{step.step}</h4>
                    <p className="text-[10px] md:text-sm text-muted mt-1 md:mt-1.5 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Actions & Params */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Recommended Actions */}
          <div className="lg:col-span-2 bg-surface border border-foreground/5 rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20">
                <Wrench className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.recommendedActions}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
              {data.recommended_actions.map((action, i) => (
                <div key={i} className="p-3 md:p-5 bg-background/50 border border-foreground/5 rounded-xl md:rounded-2xl hover:bg-background transition-colors">
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
          <div className="bg-surface border border-foreground/5 rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/20">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <h2 className="text-sm md:text-lg font-semibold text-foreground">{t.report.analysisParams}</h2>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
              {/* Repair Time Chart */}
              <div className="bg-background/30 rounded-xl p-4 border border-foreground/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-muted">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs md:text-sm font-medium">{t.report.estimatedTime}</span>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-foreground">{data.parameters.estimated_time_hours} rbh</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={repairTimeData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="stage" type="category" width={70} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-surface border border-foreground/10 px-3 py-2 rounded-lg shadow-xl ring-1 ring-inset ring-foreground/5">
                                <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-1">{payload[0].payload.stage}</p>
                                <p className="text-sm text-foreground font-bold flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></span>
                                  {payload[0].value} rbh
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={14}>
                        {repairTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk & Complexity */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Risk */}
                <div className="group cursor-pointer bg-background/30 p-3 md:p-4 rounded-xl border border-foreground/5 hover:bg-background/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-muted">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="text-[10px] md:text-xs font-medium">{t.report.failureRisk}</span>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-red-400">{data.parameters.risk_level}</span>
                  </div>
                  <div className="flex gap-1 h-1.5 w-full">
                    {[0, 1, 2, 3].map((seg) => {
                      const filled = riskPercent >= (seg + 1) * 25;
                      const colors = ['bg-emerald-500/20', 'bg-yellow-500/20', 'bg-orange-500/20', 'bg-red-500'];
                      const filledColors = ['bg-emerald-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
                      return (
                        <div
                          key={seg}
                          className={`h-full flex-1 ${filled ? filledColors[seg] : colors[seg]} ${seg === 0 ? 'rounded-l-full' : ''} ${seg === 3 ? 'rounded-r-full' : ''} transition-colors`}
                          style={filled && seg === 3 ? { boxShadow: '0 0 8px rgba(239,68,68,0.6)' } : undefined}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-2.5 text-[10px] md:text-xs font-semibold text-red-400">{riskPercent >= 75 ? t.report.critical : t.report.advanced}</div>
                </div>

                {/* Complexity */}
                <div className="group cursor-pointer bg-background/30 p-3 md:p-4 rounded-xl border border-foreground/5 hover:bg-background/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-muted">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="text-[10px] md:text-xs font-medium">{t.report.complexity}</span>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-primary">{data.parameters.complexity}</span>
                  </div>
                  <div className="flex gap-1 h-1.5 w-full">
                    {Array.from({ length: complexity.max }, (_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 ${i < complexity.value ? 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-[#1e293b] group-hover:bg-[#1e293b]/80'} ${i === 0 ? 'rounded-l-full' : ''} ${i === complexity.max - 1 ? 'rounded-r-full' : ''} transition-colors`}
                      />
                    ))}
                  </div>
                  <div className="mt-2.5 text-[10px] md:text-xs font-semibold text-primary">{complexity.value >= 4 ? t.report.critical : t.report.advanced}</div>
                </div>
              </div>

              {/* OBD-II Codes */}
              <div className="pt-4 border-t border-foreground/5">
                <p className="text-[10px] md:text-xs font-semibold text-muted/80 uppercase tracking-wider mb-2 md:mb-3">{t.report.obdCodes}</p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {data.parameters.obd_codes.map((code) => (
                    <span key={code} className="px-2 py-1 md:px-3 md:py-1.5 bg-[#1e293b]/80 text-primary rounded-md md:rounded-lg text-[10px] md:text-xs font-mono font-semibold ring-1 ring-inset ring-blue-500/20 shadow-sm hover:bg-primary/20 transition-colors cursor-pointer">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* AI Chat Placeholder Action */}
        <div className="sticky bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent z-10">
          <button 
            disabled 
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[20px] font-bold text-sm tracking-wide
              bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/25 text-foreground/70
              cursor-not-allowed opacity-70
              shadow-[0_0_30px_rgba(59,130,246,0.1)]"
          >
            <span className="text-xl">💬</span>
            <span>Zapytaj AI o ten raport</span>
            <span className="ml-auto text-[10px] font-semibold bg-foreground/10 rounded-full px-2.5 py-1 uppercase tracking-widest">Wkrótce</span>
          </button>
        </div>
      </main>
    </div>
  );
}
