"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioLines, Camera, Loader2, AlertCircle } from 'lucide-react';
import { IdentificationReport } from './IdentificationReport';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

interface ShazamScannerProps {
  onScanComplete?: () => void;
}

export function ShazamScanner({ onScanComplete }: ShazamScannerProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mode, setMode] = useState<'audio' | 'visual' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [analyzingText, setAnalyzingText] = useState(t.shazam.status.init);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for the concentric rings (liquid effect)
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentScales = useRef<number[]>([1, 1, 1, 1, 1]);

  const cleanup = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();

    // Reset rings
    for (let i = 0; i < 5; i++) {
      currentScales.current[i] = 1;
      if (ringsRef.current[i]) {
        ringsRef.current[i]!.style.transform = `translate(-50%, -50%) scale(1)`;
        ringsRef.current[i]!.style.opacity = '0';
      }
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const simulateProcessing = () => {
    setIsAnalyzing(true);
    setAnalyzingText(mode === 'audio' ? t.shazam.status.isoAudio : t.shazam.status.isoVisual);

    setTimeout(() => {
      setAnalyzingText(t.shazam.status.search);
    }, 1500);

    setTimeout(() => {
      setAnalyzingText(t.shazam.status.identify);
    }, 3000);

    setTimeout(() => {
      setIsAnalyzing(false);
      setIsReportOpen(true);
      if (onScanComplete) onScanComplete();
    }, 4500);
  };

  const startVisualizerLoop = (isDemo: boolean) => {
    const updateData = () => {
      const dataArray = new Uint8Array(128);

      if (!isDemo && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else if (isDemo) {
        // Generate fake engine-like frequency data for demo mode
        const time = Date.now() / 1000;
        for (let i = 0; i < 128; i++) {
          const noise = Math.random() * 40;
          const engineThump = Math.sin(time * 20) * 100 + 80;
          const mechanicalWhine = Math.sin(time * 3 + i * 0.1) * 50 + 40;

          let val = i < 15 ? engineThump + noise : mechanicalWhine + noise;
          const dropoff = Math.pow(1 - (i / 128), 1.5);
          dataArray[i] = Math.min(255, Math.max(0, val * dropoff));
        }
      }

      const getAverage = (start: number, end: number) => {
        let sum = 0;
        for (let i = start; i < end; i++) sum += dataArray[i];
        return sum / (end - start);
      };

      const bass = getAverage(0, 10);
      const lowMid = getAverage(10, 30);
      const mid = getAverage(30, 60);
      const highMid = getAverage(60, 100);
      const treble = getAverage(100, 128);

      // Liquid aggressive scaling based on frequency bands
      const targetScales = [
        1 + Math.pow(treble / 255, 1.8) * 0.4,
        1 + Math.pow(highMid / 255, 1.8) * 0.8,
        1 + Math.pow(mid / 255, 1.8) * 1.5,
        1 + Math.pow(lowMid / 255, 1.8) * 2.2,
        1 + Math.pow(bass / 255, 1.8) * 3.5
      ];

      for (let i = 0; i < 5; i++) {
        currentScales.current[i] = lerp(currentScales.current[i], targetScales[i], 0.08); // Smooth liquid lerp

        if (ringsRef.current[i]) {
          const scale = currentScales.current[i];
          const intensity = targetScales[i] - 1;

          const baseOpacity = 0.25 - (i * 0.04);
          const opacity = Math.max(0, baseOpacity - (scale - 1) * 0.05 + (intensity * 0.06));

          ringsRef.current[i]!.style.transform = `translate(-50%, -50%) scale(${scale})`;
          ringsRef.current[i]!.style.opacity = opacity.toString();
        }
      }

      animationRef.current = requestAnimationFrame(updateData);
    };
    updateData();
  };

  const startAudioRecording = async () => {
    setError(null);
    setMode('audio');

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      audioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85; // Liquid smoothing
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsRecording(true);
      setIsDemoMode(false);
      startVisualizerLoop(false);

    } catch (err) {
      console.warn("No mic or demo mode:", err);
      // Fallback for demo
      setIsRecording(true);
      setIsDemoMode(true);
      startVisualizerLoop(true);
    }
  };

  const stopAudioRecording = () => {
    cleanup();
    setIsRecording(false);
    simulateProcessing();
  };

  const handleAudioClick = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const handleVisualClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering audio click if positioned nearby
    setMode('visual');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateProcessing();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans relative overflow-hidden selection:bg-primary/30">

      {/* Background radial gradients for Shazam vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-surface)_0%,transparent_100%)] pointer-events-none opacity-40" />

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center h-full px-6">

        {/* Title Section */}
        <motion.div
          animate={{ opacity: (isRecording || isAnalyzing) ? 0 : 1, y: (isRecording || isAnalyzing) ? -20 : 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-3">{t.shazam.title}</h1>
          <p className="text-muted font-medium px-4 text-sm leading-relaxed">
            {t.shazam.desc}
          </p>
        </motion.div>

        {/* Central Shazam Animation Area */}
        <div className="relative flex flex-col items-center justify-center w-full my-8">

          <div className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[240px] md:h-[240px]">

            {/* Liquid Concentric Rings */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  ref={(el) => { ringsRef.current[i] = el; }}
                  className="absolute top-1/2 left-1/2 w-[160px] h-[160px] md:w-[180px] md:h-[180px] rounded-full bg-primary mix-blend-screen transition-opacity duration-200"
                  style={{
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 0,
                    willChange: 'transform, opacity'
                  }}
                />
              ))}
            </div>

            {/* Idle Breathing Animation for Rings (only when not recording) */}
            {!isRecording && mode === 'audio' && !isAnalyzing && (
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.2, 0.05] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <div className="w-[180px] h-[180px] rounded-full bg-primary blur-md" />
              </motion.div>
            )}

            {/* Main Audio Button */}
            <motion.button
              onClick={handleAudioClick}
              disabled={isAnalyzing}
              animate={
                isAnalyzing ? { scale: 0.9, opacity: 0.8 } :
                  isRecording ? { scale: [0.95, 1.05, 0.95] } : { scale: 1 }
              }
              transition={{ duration: isRecording ? 2 : 0.3, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
              className="relative z-20 w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full flex flex-col items-center justify-center overflow-hidden bg-primary shadow-[0_0_50px_rgba(var(--color-primary),0.5)] border-4 border-background group shrink-0"
            >
              <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)] pointer-events-none" />

              {isAnalyzing && mode === 'audio' ? (
                <Loader2 className="w-16 h-16 text-white animate-spin drop-shadow-lg" />
              ) : (
                <AudioLines className={`w-14 h-14 text-white drop-shadow-lg transition-transform duration-500 ${isRecording ? 'scale-110' : 'group-hover:scale-110'}`} />
              )}
            </motion.button>

            {/* Floating Visual Identification Button (Camera) */}
            <motion.button
              onClick={handleVisualClick}
              disabled={isAnalyzing || isRecording}
              animate={{
                opacity: (isRecording || isAnalyzing) ? 0 : 1,
                scale: (isRecording || isAnalyzing) ? 0.8 : 1,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-[-10px] right-[-10px] z-30 w-16 h-16 rounded-full bg-surface border-4 border-background flex items-center justify-center shadow-2xl transition-all duration-300 group"
            >
              {isAnalyzing && mode === 'visual' ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <Camera className="w-7 h-7 text-primary group-hover:text-primary-hover transition-colors" />
              )}
            </motion.button>
          </div>

          {/* Status Message */}
          <div className="h-12 mt-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-bold tracking-widest text-primary uppercase text-center"
                >
                  {analyzingText}
                </motion.div>
              ) : isRecording ? (
                <motion.div
                  key="recording"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-lg font-semibold text-foreground">{t.shazam.listening}</span>
                  {isDemoMode && <span className="text-[10px] text-muted">{t.demoMode}</span>}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <input type="file" accept="image/*,video/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>

      <AnimatePresence>
        {isReportOpen && <IdentificationReport onClose={() => setIsReportOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-[100px] flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-xl backdrop-blur-md z-50"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
