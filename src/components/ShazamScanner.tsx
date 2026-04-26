"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioLines, Camera, Image as ImageIcon, Loader2, AlertCircle, X, CheckCircle2, Sparkles, XCircle, Gauge, Wind, Hash, Car } from 'lucide-react';
import { IdentificationReport } from './IdentificationReport';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

const ICON_MAP: Record<string, any> = {
  "Gauge": Gauge,
  "Wind": Wind,
  "Hash": Hash,
  "Car": Car
};

interface ShazamScannerProps {
  onScanComplete?: () => void;
}

export function ShazamScanner({ onScanComplete }: ShazamScannerProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mode, setMode] = useState<'audio' | 'visual'>('audio');

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [showPreScan, setShowPreScan] = useState(false);
  const [stickyError, setStickyError] = useState<string | null>(null);

  const [analyzingText, setAnalyzingText] = useState(t.shazam.status.init);
  const [pendingHint, setPendingHint] = useState(0);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [identificationData, setIdentificationData] = useState<any | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentScales = useRef<number[]>([1, 1, 1, 1, 1]);

  const PENDING_HINTS = [
    "Dźwięk gotowy — naciśnij aby rozpoznać",
    "Możesz też dodać pliki z biblioteki",
    "Uruchom silnik AI",
  ];

  const cleanup = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();

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

  useEffect(() => {
    if (!pendingFile) { setPendingHint(0); return; }
    const id = setInterval(() => setPendingHint(h => (h + 1) % PENDING_HINTS.length), 2800);
    return () => clearInterval(id);
  }, [pendingFile]);

  const startVisualizerLoop = (isDemo: boolean) => {
    const updateData = () => {
      const dataArray = new Uint8Array(128);

      if (!isDemo && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else if (isDemo) {
        const time = Date.now() / 1000;
        for (let i = 0; i < 128; i++) {
          const noise = Math.random() * 40;
          const engineThump = Math.sin(time * 20) * 100 + 80;
          const val = i < 15 ? engineThump + noise : noise;
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

      const targetScales = [
        1 + Math.pow(getAverage(100, 128) / 255, 1.8) * 0.4,
        1 + Math.pow(getAverage(60, 100) / 255, 1.8) * 0.8,
        1 + Math.pow(mid / 255, 1.8) * 1.5,
        1 + Math.pow(lowMid / 255, 1.8) * 2.2,
        1 + Math.pow(bass / 255, 1.8) * 3.5
      ];

      for (let i = 0; i < 5; i++) {
        currentScales.current[i] = lerp(currentScales.current[i], targetScales[i], 0.08);

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

  const startRecording = async () => {
    setStickyError(null);
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
      analyser.smoothingTimeConstant = 0.9;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      setIsRecording(true);
      setIsDemoMode(false);
      startVisualizerLoop(false);

      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = setTimeout(async () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          const f = await stopRecording();
          if (f) setPendingFile(f);
        }
      }, 30000);
    } catch (err) {
      console.warn("Microphone error:", err);
      setIsDemoMode(true);
      setIsRecording(true);
      startVisualizerLoop(true);
    }
  };

  const stopRecording = (): Promise<File | null> => {
    return new Promise((resolve) => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      cleanup();
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
          recordedChunksRef.current = [];
          mediaRecorderRef.current = null;
          resolve(file);
        };
        recorder.stop();
      } else {
        resolve(null);
      }
      setIsRecording(false);
      setIsDemoMode(false);
    });
  };

  const cancelRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    stopRecording();
    setPendingFile(null);
  };

  const runIdentification = async (file: File) => {
    setIsAnalyzing(true);
    setStickyError(null);
    setAnalyzingText(mode === 'audio' ? t.shazam.status.isoAudio : t.shazam.status.isoVisual);

    let interval: NodeJS.Timeout | undefined;

    try {
      interval = setInterval(() => {
        setAnalyzingText(prev => prev === t.shazam.status.isoAudio || prev === t.shazam.status.isoVisual ? t.shazam.status.search : t.shazam.status.identify);
      }, 2500);

      setAnalyzingText("Łączenie z chmurą...");
      const uploadUrlResponse = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ filename: file.name || 'file.bin', contentType: file.type || 'application/octet-stream' }]
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
      const urlInfo = urls[0];
      const putRes = await fetch(urlInfo.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || 'application/octet-stream' },
        body: file
      });

      if (!putRes.ok) throw new Error("Błąd bezpośredniego wgrywania pliku.");

      const uploadedFileParts = [{
        fileData: { fileUri: urlInfo.gcsUri, mimeType: urlInfo.mimeType }
      }];

      const formData = new FormData();
      formData.append("fileParts", JSON.stringify(uploadedFileParts));

      const res = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error("Non-JSON response from /api/identify:", responseText);
        throw new Error(`Serwer zwrócił błąd: ${res.status} ${res.statusText} - ${responseText.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(json?.message || `Zwrócono błąd serwera. Status: ${res.status}`);
      }

      if (json.status === 'success' && json.data) {
        // Map string icons to real icon components
        if (json.data.specs) {
          json.data.specs = json.data.specs.map((spec: any) => ({
            ...spec,
            icon: ICON_MAP[spec.icon] || Car
          }));
        }

        setIdentificationData(json.data);
        setIsReportOpen(true);
        if (onScanComplete) onScanComplete();
      } else {
        throw new Error("Wystąpił nieznany problem ze zwróceniem danych.");
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Zawiodła identyfikacja elementu.";
      setStickyError(msg);
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (!pendingFile) return;
    const preScanSeen = localStorage.getItem('hasSeenShazamPreScan') === 'true';
    if (!preScanSeen) {
      setShowPreScan(true);
      return;
    }
    runIdentification(pendingFile);
  };

  const handleAudioClick = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) setPendingFile(audioFile);
    } else {
      if (mode !== 'audio') setMode('audio');
      startRecording();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoadingFile(true);
      setMode(e.target.accept.includes('video') || e.target.accept.includes('image') ? 'visual' : 'audio');
      const file = e.target.files[0];
      await new Promise(r => setTimeout(r, 400));
      setPendingFile(file);
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col items-center font-sans relative overflow-hidden selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-surface)_0%,transparent_100%)] pointer-events-none opacity-40" />

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full overflow-y-auto scrollbar-hide pb-[100px] md:pb-[120px]">
        {/* Top Cancel button when recording or pending file */}
        <AnimatePresence>
          {(isRecording || pendingFile) && !isAnalyzing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={cancelRecording}
              className="fixed top-6 left-6 z-50 w-11 h-11 rounded-full bg-foreground/5 backdrop-blur-2xl border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            >
              <X className="w-5 h-5 text-foreground/70" strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Title Section */}
        <motion.div
          animate={{ opacity: (isRecording || isAnalyzing) ? 0 : 1, y: (isRecording || isAnalyzing) ? -20 : 0 }}
          className="w-full text-center mt-12 mb-6 px-6"
        >
          <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-3">{t.shazam.title}</h1>
          <p className="text-muted font-medium px-4 text-sm leading-relaxed">{t.shazam.desc}</p>
        </motion.div>

        {/* Central Animation Area */}
        <div className="z-10 flex flex-col items-center w-full relative flex-1 justify-center min-h-[280px]">
          {/* Status Message */}
          <div className="h-16 mb-4 flex flex-col items-center justify-end z-10">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  className="flex flex-col items-center text-center px-2"
                >
                  <h2 className="text-2xl font-bold tracking-wide mb-2 text-foreground">{t.loadingAI}</h2>
                  <p className="text-xs font-semibold tracking-widest text-primary/80 uppercase">{analyzingText}</p>
                </motion.div>
              ) : pendingFile ? (
                <motion.div
                  key={`pending-${pendingHint}`}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  className="flex flex-col items-center text-center px-2"
                >
                  <h2 className="text-2xl font-bold tracking-wide mb-2 text-foreground">Gotowy do analizy</h2>
                  <p className="text-sm text-primary/70 font-medium tracking-wide">{PENDING_HINTS[pendingHint]}</p>
                </motion.div>
              ) : (
                <motion.div
                  key={isRecording ? 'recording' : 'idle'}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  className="flex flex-col items-center text-center px-2"
                >
                  <h2 className={`text-2xl font-bold tracking-wide mb-2 ${isRecording ? 'text-foreground' : 'text-foreground/90'}`}>
                    {isRecording ? t.shazam.listening : "Dotknij, aby nasłuchiwać"}
                  </h2>
                  {isDemoMode && isRecording && <span className="text-[10px] text-muted">{t.demoMode}</span>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
            {/* Liquid Rings */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  ref={(el) => { ringsRef.current[i] = el; }}
                  className="absolute top-1/2 left-1/2 w-[160px] h-[160px] md:w-[180px] md:h-[180px] rounded-full bg-primary mix-blend-screen transition-opacity duration-200"
                  style={{ transform: 'translate(-50%, -50%) scale(1)', opacity: 0, willChange: 'transform, opacity' }}
                />
              ))}
            </div>

            {/* AI Action Button or Recording Button */}
            <AnimatePresence mode="wait">
              {pendingFile && !isAnalyzing ? (
                <motion.button
                  key="analyze"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={handleAnalyzeClick}
                  className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center overflow-hidden bg-primary/20 hover:bg-primary/30 border border-primary/40 shadow-[0_0_50px_rgba(var(--color-primary),0.3)] transition-all group z-20"
                >
                  <Sparkles className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),1)]" />
                </motion.button>
              ) : (
                <motion.button
                  key="record"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isAnalyzing ? { scale: 0.9, opacity: 0.8 } : isRecording ? { scale: [0.95, 1.05, 0.95] } : { scale: 1, opacity: 1 }}
                  transition={{ duration: isRecording ? 2 : 0.3, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
                  onClick={handleAudioClick}
                  disabled={isAnalyzing}
                  className="relative z-20 w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full flex flex-col items-center justify-center overflow-hidden bg-primary shadow-[0_0_50px_rgba(var(--color-primary),0.5)] border-4 border-background group shrink-0"
                >
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)] pointer-events-none" />
                  {isAnalyzing ? (
                    <Loader2 className="w-16 h-16 text-white animate-spin drop-shadow-lg" />
                  ) : (
                    <AudioLines className={`w-14 h-14 text-white drop-shadow-lg transition-transform duration-500 ${isRecording ? 'scale-110' : 'group-hover:scale-110'}`} />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Visual Identification Button */}
            {!pendingFile && !isRecording && !isAnalyzing && (
              <motion.button
                onClick={() => { setMode('visual'); galleryInputRef.current?.click(); }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-[-10px] right-[-10px] z-30 w-16 h-16 rounded-full bg-surface border-4 border-background flex items-center justify-center shadow-2xl transition-all duration-300 group"
              >
                <Camera className="w-7 h-7 text-primary group-hover:text-primary-hover transition-colors" />
              </motion.button>
            )}
          </div>

          {/* Sticky Error Overlay */}
          <AnimatePresence>
            {stickyError && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="absolute inset-x-4 top-4 z-[70]"
              >
                <div className="bg-gradient-to-br from-red-500/20 to-red-950/40 border border-red-500/30 shadow-[0_8px_32px_rgba(239,68,68,0.2)] rounded-2xl p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/20">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-red-500 font-bold text-sm tracking-wide mb-1 uppercase">Błąd Identyfikacji</h3>
                      <p className="text-foreground/80 text-sm leading-relaxed">{stickyError}</p>
                    </div>
                    <button onClick={() => setStickyError(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                      <XCircle className="w-5 h-5 text-foreground/50 hover:text-foreground" />
                    </button>
                  </div>
                  <button
                    onClick={() => setStickyError(null)}
                    className="w-full mt-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors uppercase tracking-widest"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Upload Action */}
        <motion.div
          animate={{ opacity: (isRecording || isAnalyzing) ? 0 : 1, y: (isRecording || isAnalyzing) ? 20 : 0 }}
          className="w-full px-6 flex pt-4 relative z-20"
        >
          <button
            onClick={() => galleryInputRef.current?.click()}
            className={`w-full group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 transition-all duration-500 py-4 rounded-[32px] border backdrop-blur-3xl ${pendingFile ? 'bg-primary/20 border-primary/40' : 'bg-white/5 border-white/10'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${pendingFile ? 'bg-primary/20 border-primary/30' : 'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5'}`}>
              {isLoadingFile ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : pendingFile ? <span className="text-primary text-base">✓</span> : <ImageIcon className="w-4 h-4 text-foreground/60" />}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-widest ${isLoadingFile ? 'text-primary/60' : pendingFile ? 'text-primary/80' : 'text-foreground/50'}`}>
              {isLoadingFile ? 'Wczytuję...' : pendingFile ? `Gotowo: ${pendingFile.name.substring(0, 15)}...` : 'Wyślij plik z biblioteki'}
            </span>
          </button>
        </motion.div>
      </div>

      <input type="file" accept="image/*,video/*,audio/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*,video/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      {/* Pre-Scan Tips Overlay */}
      <AnimatePresence>
        {showPreScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mt-6 mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Wskazówki Shazam</h2>
              <button onClick={() => setShowPreScan(false)} className="w-10 h-10 rounded-full bg-surface border border-foreground/10 flex items-center justify-center">
                <X className="w-5 h-5 text-foreground/70" />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-4 max-w-sm mx-auto">
              {[
                { icon: '🌪️', tip: 'Unikaj wiatru — rejestruj wydech w miejscu osłoniętym od porywów wiatru.' },
                { icon: '🔊', tip: 'Złap pełny dźwięk wkręcania silnika na wyższe obroty, nie tylko bieg jałowy.' },
                { icon: '📸', tip: 'Wgrywając zdjęcie, upewnij się że detale (badge, zbieg wydechów) nie są zamazane.' },
              ].map(({ icon, tip }) => (
                <div key={tip} className="flex items-start gap-4 bg-surface/50 border border-border-subtle rounded-2xl p-4">
                  <span className="text-2xl pt-1">{icon}</span>
                  <p className="text-sm font-medium text-foreground/80 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 mb-6 pb-20">
              <button
                onClick={() => {
                  localStorage.setItem('hasSeenShazamPreScan', 'true');
                  setShowPreScan(false);
                  if (pendingFile) runIdentification(pendingFile);
                }}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold uppercase tracking-widest text-sm"
              >
                Zrozumiano, Analizuj
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReportOpen && identificationData && (
          <IdentificationReport
            identifiedCar={identificationData}
            onClose={() => {
              setIsReportOpen(false);
              setPendingFile(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
