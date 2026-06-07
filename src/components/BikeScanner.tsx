"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, ChevronDown, AlertCircle, Camera, Image as ImageIcon, Loader2, X, Sparkles, XCircle } from 'lucide-react';

import { ContextModal, type DiagnosticContextData } from './ContextModal';
import { DisclaimerModal } from './DisclaimerModal';
import { BikeDiagnosisReport } from './BikeDiagnosisReport';
import { NoCreditsModal } from './NoCreditsModal';
import { LoginRequiredModal } from './LoginRequiredModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@clerk/nextjs';
import type { Diagnosis } from '@/types/diagnosis';

const MAX_VIDEO_SIZE_MB = 30;
const MAX_IMAGE_SIZE_MB = 5;

interface BikeScannerProps {
  targets?: string[];
  defaultTarget?: string;
  onOpenChat?: (id: string) => void;
}

export function BikeScanner({ defaultTarget, onOpenChat }: BikeScannerProps) {
  const { t, language } = useLanguage();
  const { isSignedIn } = useAuth();
  const targets = t.bike.targets;

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [target, setTarget] = useState(defaultTarget || targets[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);

  const [analyzingText, setAnalyzingText] = useState(t.bike.status.init);
  const [pendingHint, setPendingHint] = useState(0);
  const [diagnosisData, setDiagnosisData] = useState<Diagnosis | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | undefined>();
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [showDisclaimerWarning, setShowDisclaimerWarning] = useState(false);

  const [diagnosticContext, setDiagnosticContext] = useState<DiagnosticContextData | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpRequest, setFollowUpRequest] = useState<{ message: string, action_required: string } | null>(null);
  const [firstFile, setFirstFile] = useState<File | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [stickyError, setStickyError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const PENDING_HINTS = t.bike.pendingHints || [
    "Gotowe do diagnozy usterek",
    "Podaj kontekst by zwiększyć trafność",
    "Graj lub zrób zdjęcie łańcucha",
  ];

  const clearPendingFile = () => {
    setPendingFile(null);
  };

  const runDiagnosis = async (file: File, forceComplete: boolean = false) => {
    setIsAnalyzing(true);
    setAnalyzingText(t.bike.status.init);
    setStickyError(null);

    const formData = new FormData();
    formData.append("isFollowUp", isFollowUp ? "true" : "false");
    formData.append("locale", language);
    formData.append("vehicleType", "bike");
    formData.append("vehicleMake", "Rower");

    if (diagnosticContext) {
      const ctxParts = [];
      ctxParts.push(`Sprzęt rowerowy: ${target}`);
      if (diagnosticContext.mileage) ctxParts.push(`${t.context.mileageBike}: ${diagnosticContext.mileage}`);
      if (diagnosticContext.obdCodes) ctxParts.push(`${t.context.obdBike}: ${diagnosticContext.obdCodes}`);
      if (diagnosticContext.condition) ctxParts.push(`${t.context.whenOccurs} ${diagnosticContext.condition}`);
      if (diagnosticContext.tags && diagnosticContext.tags.length > 0) ctxParts.push(`${t.context.quickTagsTitle} ${diagnosticContext.tags.join(', ')}`);
      if (diagnosticContext.description) ctxParts.push(`${t.context.descTitle}: ${diagnosticContext.description}`);
      formData.set("context", ctxParts.join('\n'));
    } else {
      formData.append("context", `Sprzęt rowerowy: ${target}`);
    }

    if (forceComplete) {
      formData.set("context", (formData.get("context") || "") + "\n\nZażądano podjęcia ostatecznej decyzji diagnostycznej mimo braku follow-up'u.");
    }

    let interval: NodeJS.Timeout | undefined;

    try {
      const allFilesToUpload: File[] = [];
      if (isFollowUp && firstFile) allFilesToUpload.push(firstFile);
      allFilesToUpload.push(file);
      if (diagnosticContext?.contextFiles) {
        allFilesToUpload.push(...diagnosticContext.contextFiles);
      }

      interval = setInterval(() => {
        setAnalyzingText(prev => prev === t.bike.status.init ? t.bike.status.analyze : t.bike.status.check);
      }, 2500);

      setAnalyzingText("Łączenie z chmurą...");
      const uploadUrlResponse = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: allFilesToUpload.map(f => ({ filename: f.name || 'file.bin', contentType: f.type || 'application/octet-stream' }))
        })
      });

      if (!uploadUrlResponse.ok) throw new Error(`Błąd dostępu do chmury: ${uploadUrlResponse.status}`);
      const uploadUrlText = await uploadUrlResponse.text();
      let urls;
      try {
        const parsed = JSON.parse(uploadUrlText);
        urls = parsed.urls;
      } catch (e) {
        throw new Error(`Błąd chmury: niepoprawny format odpowiedzi (zaczyna się od: ${uploadUrlText.substring(0, 50)})`);
      }

      setAnalyzingText("Wgrywanie plików na GCS...");
      const uploadedFileParts = [];
      for (let i = 0; i < allFilesToUpload.length; i++) {
        const f = allFilesToUpload[i];
        const urlInfo = urls[i];

        const putRes = await fetch(urlInfo.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": f.type || 'application/octet-stream' },
          body: f
        });

        if (!putRes.ok) throw new Error("Błąd bezpośredniego wgrywania pliku.");

        uploadedFileParts.push({
          fileData: { fileUri: urlInfo.gcsUri, mimeType: urlInfo.mimeType }
        });
      }

      formData.append("fileParts", JSON.stringify(uploadedFileParts));

      const response = await fetch("/api/diagnose", { method: "POST", body: formData });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Non-JSON response from /api/diagnose:", responseText);
        throw new Error(`Serwer zwrócił błąd: ${response.status} ${response.statusText} - ${responseText.substring(0, 100)}`);
      }

      clearInterval(interval);
      setIsAnalyzing(false);

      if (!response.ok) {
        if (response.status === 401) {
          setShowLoginModal(true);
          return;
        }
        if (response.status === 403) {
          setShowNoCreditsModal(true);
          return;
        }
        throw new Error(data?.message || "Błąd wykonania zapytania AI");
      }

      const aiResponse = data.aiResponse;
      if (aiResponse?.status === "follow_up" && aiResponse?.follow_up_request) {
        setIsFollowUp(true);
        setFollowUpRequest(aiResponse.follow_up_request);
        setFirstFile(file);
        setPendingFile(null);
      } else if (aiResponse?.status === "complete" || data.diagnosis) {
        const diagnosis = aiResponse?.final_diagnosis || data.diagnosis;
        setDiagnosisData(diagnosis);
        setDiagnosisId(data.diagnosisId);
        setIsDiagnosisOpen(true);
        setIsFollowUp(false);
        setFollowUpRequest(null);
        setFirstFile(null);
        setPendingFile(null);
      } else {
        throw new Error("Pusta odpowiedź diagnostyczna AI.");
      }
    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setStickyError(err instanceof Error ? err.message : "Zła analiza zdjęcia.");
    }
  };

  const handleAnalyzeClick = () => {
    if (!pendingFile) return;

    if (!isDisclaimerAccepted) {
      setShowDisclaimerWarning(true);
      setTimeout(() => setShowDisclaimerWarning(false), 2000);
      return;
    }

    if (!isSignedIn) {
      setShowLoginModal(true);
      return;
    }

    runDiagnosis(pendingFile, false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMB = file.size / (1024 * 1024);

      if (file.type.startsWith('video/') && sizeMB > MAX_VIDEO_SIZE_MB) {
        alert(`${t.auto.errors.fileTooLarge} (${sizeMB.toFixed(1)}MB). ${t.auto.errors.maxSize} ${MAX_VIDEO_SIZE_MB}MB.`);
        return;
      }
      if (file.type.startsWith('image/') && sizeMB > MAX_IMAGE_SIZE_MB) {
        alert(`${t.auto.errors.fileTooLarge} (${sizeMB.toFixed(1)}MB). ${t.auto.errors.maxSize} ${MAX_IMAGE_SIZE_MB}MB.`);
        return;
      }

      setPendingFile(file);
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (!pendingFile) { setPendingHint(0); return; }
    const id = setInterval(() => setPendingHint(h => (h + 1) % PENDING_HINTS.length), 2800);
    return () => clearInterval(id);
  }, [pendingFile, PENDING_HINTS.length]);

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col items-center font-sans relative overflow-hidden selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-surface)_0%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full overflow-y-auto scrollbar-hide pb-[calc(env(safe-area-inset-bottom,0px)+120px)] md:pb-[calc(env(safe-area-inset-bottom,0px)+140px)]">

        <motion.div
          animate={{ opacity: isAnalyzing ? 0 : 1, y: isAnalyzing ? -20 : 0 }}
          className="w-full px-6 flex flex-col items-center pt-16 md:pt-24 pb-1 relative z-20 gap-2 md:gap-3 shrink-0"
        >
          <div className="w-full bg-surface/80 p-3 md:p-4 rounded-[24px] md:rounded-[32px] border border-foreground/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] group flex flex-col gap-1 md:gap-3">
            <div className="flex flex-col items-start px-2">
              <span className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase mb-0.5">{t.bike.selectElement || "Wybierz element"}</span>
            </div>

            <div className="relative w-full">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-background/50 border border-foreground/[0.05] rounded-2xl px-4 py-3 text-sm text-foreground flex items-center justify-between cursor-pointer focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
              >
                <span>{target}</span>
                <ChevronDown className={`w-4 h-4 text-foreground/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-14 left-0 w-full bg-surface-elevated border border-foreground/[0.05] rounded-2xl shadow-xl overflow-hidden z-20"
                  >
                    {targets.map((tOption: string) => (
                      <div
                        key={tOption}
                        onClick={() => { setTarget(tOption); setIsDropdownOpen(false); }}
                        className="px-4 py-3 hover:bg-foreground/5 cursor-pointer text-sm text-foreground border-b border-foreground/[0.02] last:border-0"
                      >
                        {tOption}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Legal Disclaimer Checkbox */}
          <div className={`w-full px-2 mt-2 flex justify-center transition-all duration-300 ${showDisclaimerWarning ? 'scale-105' : ''}`}>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0">
                <input
                  type="checkbox"
                  checked={isDisclaimerAccepted}
                  onChange={(e) => {
                    setIsDisclaimerAccepted(e.target.checked);
                    if (e.target.checked) setShowDisclaimerWarning(false);
                  }}
                  className={`peer appearance-none w-5 h-5 rounded-md border bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 transition-all duration-300 ${showDisclaimerWarning ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-white/10'}`}
                />
                <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-300">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-[11px] text-foreground/50 leading-relaxed group-hover:text-foreground/70 transition-colors select-none">
                {t.disclaimer.checkbox}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDisclaimerModalOpen(true);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors font-medium"
                >
                  {t.disclaimer.link}
                </button>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Central Record/Visualizer */}
        <div className="z-10 flex flex-col items-center w-full relative flex-1 justify-center min-h-[240px] md:min-h-[280px]">
          <div className="min-h-[3.5rem] md:min-h-[4rem] py-1 mb-2 md:mb-4 flex flex-col items-center justify-center z-10">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div key="analyzing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center">
                  <h2 className="text-xl md:text-2xl font-bold tracking-wide mb-1 md:mb-2 text-foreground text-center px-4">{t.loadingAI}</h2>
                  <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">{analyzingText}</p>
                </motion.div>
              ) : pendingFile ? (
                <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center">
                  <h2 className="text-xl md:text-2xl font-bold tracking-wide mb-1 md:mb-2 text-foreground text-center px-4">{t.auto.readyForAnalysis || "Gotowy do analizy"}</h2>
                  <p className="text-sm text-emerald-400/70 font-medium tracking-wide text-center px-4">{PENDING_HINTS[pendingHint]}</p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center">
                  <h2 className={`text-xl md:text-2xl font-bold tracking-wide mb-1 md:mb-2 text-center px-4 text-foreground/90`}>
                    {t.bike.visualScan || 'Skan Wizualny'}
                  </h2>
                  <p className="text-sm text-foreground/50 tracking-wide text-center px-4">{t.bike.visualScanDesc || 'Zrób zdjęcie ewidentnych uszkodzeń'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex items-center justify-center w-[180px] h-[180px] md:w-[200px] md:h-[200px]">
            <AnimatePresence mode="wait">
              {pendingFile && !isAnalyzing ? (
                <motion.button key="analyze" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={handleAnalyzeClick} className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center overflow-hidden bg-emerald-500/20 shadow-2xl shadow-emerald-500/10 border border-emerald-500/40 z-20 hover:bg-emerald-500/30 transition-opacity`}>
                  <div className="flex flex-col items-center gap-1">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 drop-shadow-md" />
                    <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-emerald-400/90">
                      {language === 'pl' ? 'ANALIZUJ' : 'ANALYZE'}
                    </span>
                  </div>
                </motion.button>
              ) : (
                <motion.button
                  key="record"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="relative z-20 w-[110px] h-[110px] md:w-[120px] md:h-[120px] rounded-full flex flex-col items-center justify-center overflow-hidden bg-emerald-500 shadow-xl shadow-emerald-500/20 border-4 border-background"
                >
                  {isAnalyzing ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Camera className="w-10 h-10 text-white" />}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div animate={{ opacity: isAnalyzing ? 0 : 1, y: isAnalyzing ? 20 : 0 }} className="w-full px-6 flex gap-3 md:gap-4 pt-1 md:pt-4 shrink-0 relative z-20">
          <button
            onClick={() => galleryInputRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 md:py-5 rounded-[24px] md:rounded-[32px] border backdrop-blur-3xl transition-all ${pendingFile ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}
          >
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${pendingFile ? 'bg-emerald-500/10' : 'bg-foreground/5'}`}>
              {pendingFile ? <span className="text-emerald-400 text-base">✓</span> : <ImageIcon className="w-4 h-4" />}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-widest ${pendingFile ? 'text-emerald-400' : 'text-foreground/50'}`}>
              {pendingFile ? (t.auto.loaded || "Załadowano") : t.auto.uploadFiles}
            </span>
          </button>

          <button onClick={() => setIsContextModalOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 py-3 md:py-5 rounded-[24px] md:rounded-[32px] backdrop-blur-3xl transition-all">
            <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
              <FileText className="w-4 h-4 text-foreground/60" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">
              {diagnosticContext ? (t.auto.contextReady || "Kontekst gotowy") : t.auto.uploadContext}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Absolute Overlays */}
      <AnimatePresence>
        {stickyError && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute z-[70] inset-x-4 top-4 bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex gap-4 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <h3 className="text-red-500 font-bold text-sm tracking-wide uppercase">Błąd diagnostyki</h3>
              <p className="text-foreground/80 text-sm">{stickyError}</p>
            </div>
            <button onClick={() => setStickyError(null)}><XCircle className="w-5 h-5 text-foreground/50 hover:text-foreground" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFollowUp && followUpRequest && !isAnalyzing && !pendingFile && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute inset-0 z-[60] flex flex-col bg-background/80 backdrop-blur-xl pt-16 px-6 pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Etap 2 &middot; Follow Up Danych</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">{t.auto.oneStepToDiagnosis || "Jeden krok do diagnozy"}</h2>
              <div className="w-full bg-surface/40 border border-foreground/[0.06] rounded-[20px] p-5">
                <p className="text-[10px] font-bold text-emerald-400/70 uppercase mb-2">{t.auto.aiInstruction || "Instrukcja od AI"}</p>
                <p className="text-foreground/80 text-sm leading-relaxed">{followUpRequest.message}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 font-bold tracking-wider uppercase text-[11px] py-5 px-6 rounded-[24px]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{t.auto.recordLive || "Nagraj live z kamery/mikrofonu"}</span>
                </div>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-surface/50 border border-foreground/[0.06] font-bold uppercase text-[11px] py-4 px-6 rounded-[24px]"
              >
                <ImageIcon className="w-4 h-4" /> {t.auto.addFromLibrary || "Dodaj plik z biblioteki"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContextModalOpen && <ContextModal onClose={() => setIsContextModalOpen(false)} onSave={(data) => { setDiagnosticContext(data); setIsContextModalOpen(false); }} initialData={diagnosticContext || undefined} variant="bike" />}
        {isDiagnosisOpen && diagnosisData && <BikeDiagnosisReport onClose={() => {
          setIsDiagnosisOpen(false);
          setDiagnosisData(null);
          setDiagnosticContext(null);
          setFirstFile(null);
        }} data={diagnosisData} diagnosisId={diagnosisId} onOpenChat={onOpenChat} />}
      </AnimatePresence>

      <input type="file" accept="image/*,video/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*,video/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      <DisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
      />
      <NoCreditsModal
        isOpen={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
      />
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
