"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle, Camera, Image as ImageIcon, Loader2, BookOpen } from 'lucide-react';

import { ContextModal } from './ContextModal';
import { InstructionsModal } from './InstructionsModal';
import { BikeDiagnosisReport } from './BikeDiagnosisReport';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Diagnosis } from '@/types/diagnosis';

interface BikeScannerProps {
  targets?: string[];
  defaultTarget?: string;
}

export function BikeScanner({
  defaultTarget
}: BikeScannerProps) {
  const { t } = useLanguage();
  const targets = t.bike.targets;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [target, setTarget] = useState(defaultTarget || targets[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);

  const [hasSeenInstructionsState, setHasSeenInstructionsState] = useState(false);
  const [analyzingText, setAnalyzingText] = useState(t.bike.status.init);
  const [diagnosisData, setDiagnosisData] = useState<Diagnosis | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const runDiagnosis = async (file: File) => {
    if (!file || file.size === 0) {
      const msg = 'Najpierw nagraj dźwięk usterki!';
      alert(msg);
      setError(msg);
      return;
    }

    // Dodatkowe zabezpieczenie: jeśli plik to audio/video, sprawdzamy czy ma > 1s
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      try {
        const url = URL.createObjectURL(file);
        const duration = await new Promise<number>((resolve) => {
          const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
          media.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(media.duration);
          };
          media.onerror = () => {
             URL.revokeObjectURL(url);
             resolve(999); // Ignore on error
          };
          media.src = url;
        });

        if (duration > 0 && duration < 1) {
          const msg = 'Najpierw nagraj dźwięk usterki!';
          alert(msg);
          setError(msg);
          return;
        }
      } catch (err) {
        console.warn("Could not check duration", err);
      }
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalyzingText(t.bike.status.analyze);

    const t1 = setTimeout(() => {
      setAnalyzingText(t.bike.status.check);
    }, 1500);

    const t2 = setTimeout(() => {
      setAnalyzingText(t.bike.status.dev);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', `Diagnostyka roweru. Obiekt: ${target}`);

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${res.status}`);
      }

      const json = await res.json();

      if (json.status === 'success' && json.diagnosis) {
        setDiagnosisData(json.diagnosis);
        setIsDiagnosisOpen(true);
      } else {
        throw new Error(json.message || 'Unexpected API response format');
      }
    } catch (err) {
      console.error('Bike diagnosis API error:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się uzyskać diagnozy.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAnalyzing(false);
    }
  };

  const toggleCapture = () => {
    if (isAnalyzing) return;

    if (!hasSeenInstructionsState) {
      setShowInstructions(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleInstructionsProceed = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenBikeInstructions', 'true');
      setHasSeenInstructionsState(true);
    }
    setShowInstructions(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      runDiagnosis(e.target.files[0]);
    }
  };

  useEffect(() => {
    setHasSeenInstructionsState(localStorage.getItem('hasSeenBikeInstructions') === 'true');
  }, []);

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col items-center font-sans relative overflow-hidden selection:bg-orange-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-surface)_0%,transparent_100%)] pointer-events-none opacity-50" />

      {/* Decorative Bike accents */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.05, 0.1, 0.05],
          rotate: [0, 15, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-br from-orange-500 to-transparent rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full overflow-y-auto scrollbar-hide pb-[100px] md:pb-[120px]">

        {/* Top Dropdown & Protipy */}
        <motion.div
          animate={{ opacity: isAnalyzing ? 0 : 1, y: isAnalyzing ? -20 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-6 flex flex-col items-center pt-12 pb-2 relative z-20 gap-4 shrink-0"
          style={{ pointerEvents: isAnalyzing ? 'none' : 'auto' }}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full bg-surface/80 hover:bg-surface-hover/90 transition-all duration-500 px-6 py-4 rounded-[32px] border border-border-subtle backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] group"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-semibold tracking-widest text-muted uppercase mb-0.5 group-hover:text-foreground/80 transition-colors">{t.bike.section}</span>
              <span className="text-sm font-medium tracking-wide text-foreground truncate max-w-[200px] sm:max-w-[300px]">{target}</span>
            </div>
            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <ChevronDown className="w-5 h-5 text-muted group-hover:text-foreground transition-colors" />
            </motion.div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, scale: 0.98, filter: "blur(5px)" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-[88px] w-[calc(100%-3rem)] bg-surface-elevated/95 backdrop-blur-3xl border border-border-subtle rounded-[28px] shadow-2xl overflow-hidden z-50"
              >
                <div className="py-2 flex flex-col">
                  {targets.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTarget(t);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-6 py-3.5 text-sm transition-all duration-300 flex items-center justify-between ${target === t
                        ? 'bg-orange-500/10 text-orange-500 font-medium'
                        : 'text-foreground/70 hover:bg-surface-hover hover:text-foreground'
                        }`}
                    >
                      {t}
                      {target === t && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Protipy Button */}
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-medium tracking-wider text-orange-500/50 hover:text-orange-500/80 transition-colors max-w-full"
          >
            <AlertCircle size={12} className="shrink-0" /> <span className="truncate">{t.bike.protips}</span>
          </button>
        </motion.div>

        <div className={`z-10 flex flex-col items-center flex-1 w-full relative justify-center min-h-[280px]`}>

          {/* Status Text  */}
          <div className="h-16 mb-8 flex flex-col items-center justify-end z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={isAnalyzing ? 'analyzing' : 'idle'}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center px-2"
              >
                <h2 className={`text-2xl font-bold tracking-wide mb-2 ${isAnalyzing ? 'text-foreground' : 'text-foreground/90'}`}>
                  {isAnalyzing ? t.loading : t.bike.title}
                </h2>
                <p className="text-sm text-muted font-medium tracking-wide text-center px-4">
                  {t.bike.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex items-center justify-center w-[200px] h-[200px]">

            {/* Idle Breathing Ring */}
            {!isAnalyzing && (
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.1, 0.03] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <div className="w-[180px] h-[180px] rounded-full bg-orange-500 blur-md" />
              </motion.div>
            )}

            {/* Central Bike Visual Capture Button */}
            <motion.button
              onClick={toggleCapture}
              style={{ pointerEvents: isAnalyzing ? 'none' : 'auto' }}
              animate={{
                scale: 1,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.05)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-[160px] h-[160px] rounded-full flex items-center justify-center overflow-hidden bg-surface-elevated/90 backdrop-blur-3xl border border-border-subtle group"
            >
              <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center select-none">
                <div className="relative flex items-center justify-center p-4">
                  {isAnalyzing ? (
                    <Loader2 className="w-12 h-12 stroke-[1.5] text-orange-400 animate-spin" />
                  ) : (
                    <Camera className="w-12 h-12 stroke-[1.5] transition-colors duration-500 text-foreground/80 group-hover:text-orange-500" />
                  )}

                  {isAnalyzing && (
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent border-t-orange-400 border-r-orange-400/50 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  {isAnalyzing && (
                    <motion.div
                      className="absolute inset-0 blur-xl rounded-full bg-orange-500 -z-10"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>
              </div>
            </motion.button>

            {/* Analyzing Text */}
            <div className="absolute -bottom-12 left-0 right-0 flex justify-center">
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div
                    key={analyzingText}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="absolute text-[10px] md:text-xs font-semibold tracking-widest text-orange-400/80 uppercase whitespace-nowrap"
                  >
                    {analyzingText}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input type="file" accept="image/*,video/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <input type="file" accept="image/*,video/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />

            {/* Error Message Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-[-60px] flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl backdrop-blur-md z-50"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Buttons */}
        <motion.div
          animate={{ opacity: isAnalyzing ? 0 : 1, y: isAnalyzing ? 20 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-6 flex gap-4 pt-4 shrink-0 relative z-20"
          style={{ pointerEvents: isAnalyzing ? 'none' : 'auto' }}
        >
          <button onClick={() => galleryInputRef.current?.click()} className="flex-1 group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 bg-surface/80 hover:bg-surface-hover/90 transition-all duration-500 py-5 rounded-[32px] border border-border-subtle backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4 transition-colors text-foreground/60 group-hover:text-orange-500" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest px-2 transition-colors text-muted group-hover:text-orange-500 truncate w-full text-center">
              {t.bike.gallery}
            </span>
          </button>

          <button onClick={() => setIsContextModalOpen(true)} className="flex-1 group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 bg-surface/80 hover:bg-surface-hover/90 transition-all duration-500 py-5 rounded-[32px] border border-border-subtle backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4 transition-colors text-foreground/60 group-hover:text-orange-500" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest px-2 transition-colors text-muted group-hover:text-orange-500 truncate w-full text-center">
              {t.bike.addContext}
            </span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isContextModalOpen && <ContextModal variant="bike" onClose={() => setIsContextModalOpen(false)} />}
        {showInstructions && <InstructionsModal variant="bike" isAudioMode={false} onProceed={handleInstructionsProceed} />}
        {isDiagnosisOpen && diagnosisData && <BikeDiagnosisReport data={diagnosisData} onClose={() => { setIsDiagnosisOpen(false); setDiagnosisData(null); }} />}
      </AnimatePresence>
    </div>
  );
}
