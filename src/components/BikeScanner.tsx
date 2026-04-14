"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, ChevronDown, AlertCircle, Mic, Camera, Image as ImageIcon, Loader2, X, Sparkles, XCircle } from 'lucide-react';

import { ContextModal } from './ContextModal';
import { BikeDiagnosisReport } from './BikeDiagnosisReport';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Diagnosis, DiagnosticContextData } from '@/types/diagnosis';

const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

interface BikeScannerProps {
  targets?: string[];
  defaultTarget?: string;
}

export function BikeScanner({ defaultTarget }: BikeScannerProps) {
  const { t } = useLanguage();
  const targets = t.bike.targets;

  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mode, setMode] = useState<'audio' | 'visual'>('audio');

  const [target, setTarget] = useState(defaultTarget || targets[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  
  const [analyzingText, setAnalyzingText] = useState(t.bike.status.init);
  const [pendingHint, setPendingHint] = useState(0);
  const [diagnosisData, setDiagnosisData] = useState<Diagnosis | null>(null);

  const [diagnosticContext, setDiagnosticContext] = useState<DiagnosticContextData | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpRequest, setFollowUpRequest] = useState<{ message: string, action_required: string } | null>(null);
  const [firstFile, setFirstFile] = useState<File | null>(null);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [showPreScan, setShowPreScan] = useState(false);
  const [stickyError, setStickyError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  const currentScales = useRef<number[]>([1, 1, 1, 1, 1]);

  const PENDING_HINTS = [
    "Gotowe do diagnozy usterek",
    "Podaj kontekst by zwiększyć trafność",
    "Graj lub zrób zdjęcie łańcucha",
  ];

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
      startVisualizerLoop(false);
    } catch (err) {
      console.warn("Microphone access denied:", err);
      setIsDemoMode(true);
      setIsRecording(true);
      startVisualizerLoop(true);
    }
  };

  const stopRecording = (): Promise<File | null> => {
    return new Promise((resolve) => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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

      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();

      setIsRecording(false);
      setIsDemoMode(false);

      for (let i = 0; i < 5; i++) {
        currentScales.current[i] = 1;
        if (ringsRef.current[i]) {
          ringsRef.current[i]!.style.transform = `translate(-50%, -50%) scale(1)`;
          ringsRef.current[i]!.style.opacity = '0';
        }
      }
    });
  };

  const cancelRecording = () => {
    stopRecording();
    setPendingFile(null);
  };

  const runDiagnosis = async (file: File, forceComplete: boolean = false) => {
    setIsAnalyzing(true);
    setAnalyzingText(t.bike.status.init);
    setStickyError(null);

    const formData = new FormData();
    if (isFollowUp && firstFile) {
      formData.append("file", firstFile);
    }
    formData.append("file", file);
    formData.append("context", \`Sprzęt rowerowy: \${target}\`);

    if (diagnosticContext) {
      const ctxParts = [];
      if (diagnosticContext.condition) ctxParts.push(\`Warunki jazdy: \${diagnosticContext.condition}\`);
      if (diagnosticContext.description) ctxParts.push(\`Objaw trzeszczenia/pęknięć: \${diagnosticContext.description}\`);
      formData.set("context", formData.get("context") + "\\n" + ctxParts.join('\\n'));
      if (diagnosticContext.contextFiles) {
        diagnosticContext.contextFiles.forEach(f => formData.append("file", f));
      }
    }

    if (forceComplete) {
      formData.set("context", (formData.get("context") || "") + "\\n\\nZażądano podjęcia ostatecznej decyzji diagnostycznej mimo braku follow-up'u.");
    }

    const interval = setInterval(() => {
      setAnalyzingText(prev => prev === t.bike.status.init ? t.bike.status.analyze : t.bike.status.check);
    }, 2500);

    try {
      const response = await fetch("/api/diagnose", { method: "POST", body: formData });
      const data = await response.json();
      clearInterval(interval);
      setIsAnalyzing(false);

      if (!response.ok) throw new Error(data.message || "Błąd wykonania zapytania AI");

      const aiResponse = data.aiResponse;
      if (aiResponse?.status === "follow_up" && aiResponse?.follow_up_request) {
        setIsFollowUp(true);
        setFollowUpRequest(aiResponse.follow_up_request);
        setFirstFile(file);
        setPendingFile(null);
      } else if (aiResponse?.status === "complete" || data.diagnosis) {
        const diagnosis = aiResponse?.final_diagnosis || data.diagnosis;
        setDiagnosisData(diagnosis);
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
      setStickyError(err instanceof Error ? err.message : "Zła analiza dźwiękowa/zdjęcia.");
    }
  };

  const handleAnalyzeClick = () => {
    if (!pendingFile) return;
    const preScanSeen = localStorage.getItem('hasSeenBikePreScan') === 'true';
    if (!preScanSeen) {
      setShowPreScan(true);
      return;
    }
    runDiagnosis(pendingFile, false);
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

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!pendingFile) { setPendingHint(0); return; }
    const id = setInterval(() => setPendingHint(h => (h + 1) % PENDING_HINTS.length), 2800);
    return () => clearInterval(id);
  }, [pendingFile]);

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col items-center font-sans relative overflow-hidden selection:bg-orange-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#2D1F16_0%,#06080F_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full overflow-y-auto scrollbar-hide pb-[100px] md:pb-[120px]">

        <AnimatePresence>
          {(isRecording || pendingFile) && !isAnalyzing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={cancelRecording}
              className="fixed top-6 left-6 z-50 w-11 h-11 rounded-full bg-foreground/5 backdrop-blur-2xl border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
            >
              <X className="w-5 h-5 text-foreground/70" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ opacity: (isRecording || isAnalyzing) ? 0 : 1, y: (isRecording || isAnalyzing) ? -20 : 0 }}
          className="w-full px-6 flex flex-col items-center pt-8 pb-1 relative z-20 gap-3 shrink-0"
        >
          <div className="w-full bg-surface/80 p-4 rounded-[32px] border border-foreground/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] group flex flex-col gap-3">
            <div className="flex flex-col items-start px-2">
              <span className="text-[10px] font-semibold tracking-widest text-orange-400 uppercase mb-0.5">{t.bike.selectTarget}</span>
            </div>
            
            <div className="relative w-full">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-background/50 border border-foreground/[0.05] rounded-2xl px-4 py-3 text-sm text-foreground flex items-center justify-between cursor-pointer focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20"
              >
                <span>{target}</span>
                <ChevronDown className={\`w-4 h-4 text-foreground/50 transition-transform \${isDropdownOpen ? 'rotate-180' : ''}\`} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-14 left-0 w-full bg-surface-elevated border border-foreground/[0.05] rounded-2xl shadow-xl overflow-hidden z-20"
                  >
                    {targets.map(tOption => (
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

          <button
            onClick={() => setShowPreScan(true)}
            className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium tracking-wider text-foreground/40 hover:text-foreground/80 transition-colors bg-surface-elevated/50 border border-foreground/[0.05] px-5 py-2.5 rounded-full"
          >
            <AlertCircle size={14} className="shrink-0" /> <span className="truncate">Wskazówki</span>
          </button>
        </motion.div>

        {/* Central Record/Visualizer */}
        <div className="z-10 flex flex-col items-center w-full relative flex-1 justify-center min-h-[280px]">
          <div className="h-16 mb-4 flex flex-col items-center justify-end z-10">
             <AnimatePresence mode="wait">
               {isAnalyzing ? (
                 <motion.div key="analyzing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center">
                   <h2 className="text-2xl font-bold tracking-wide mb-2 text-foreground">{t.loadingAI}</h2>
                   <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase">{analyzingText}</p>
                 </motion.div>
               ) : pendingFile ? (
                 <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center">
                   <h2 className="text-2xl font-bold tracking-wide mb-2 text-foreground">Gotowy do analizy</h2>
                   <p className="text-sm text-orange-400/70 font-medium tracking-wide">{PENDING_HINTS[pendingHint]}</p>
                 </motion.div>
               ) : (
                 <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center">
                   <h2 className={\`text-2xl font-bold tracking-wide mb-2 \${isRecording ? 'text-foreground' : 'text-foreground/90'}\`}>
                     {isRecording ? t.bike.audioListening : t.bike.audioTap}
                   </h2>
                   <p className="text-sm text-foreground/50 tracking-wide text-center px-4">{t.bike.audioSubReq}</p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="relative flex items-center justify-center w-[200px] h-[200px]">
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  ref={(el) => { ringsRef.current[i] = el; }}
                  className="absolute top-1/2 left-1/2 w-[140px] h-[140px] rounded-full bg-orange-500 transition-opacity duration-200"
                  style={{ transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {pendingFile && !isAnalyzing ? (
                 <motion.button key="analyze" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={handleAnalyzeClick} className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center overflow-hidden bg-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.3)] border border-orange-500/40 z-20 hover:bg-orange-500/30">
                   <Sparkles className="w-12 h-12 text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,1)]" />
                 </motion.button>
              ) : (
                 <motion.button
                   key="record"
                   onClick={async () => { if (isRecording) { const f = await stopRecording(); if (f) setPendingFile(f); } else { startRecording(); } }}
                   disabled={isAnalyzing}
                   className="relative z-20 w-[120px] h-[120px] rounded-full flex flex-col items-center justify-center overflow-hidden bg-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.6)] border-4 border-background"
                 >
                   {isAnalyzing ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Mic className={\`w-10 h-10 text-white transition-transform \${isRecording ? 'scale-110' : ''}\`} />}
                 </motion.button>
              )}
            </AnimatePresence>
            
            {!pendingFile && !isRecording && !isAnalyzing && (
              <motion.button
                onClick={() => { setMode('visual'); fileInputRef.current?.click(); }}
                className="absolute bottom-[-5px] right-[-5px] z-30 w-14 h-14 rounded-full bg-surface border-4 border-background flex items-center justify-center shadow-lg"
              >
                <Camera className="w-6 h-6 text-orange-400" />
              </motion.button>
            )}
          </div>
        </div>

        <motion.div animate={{ opacity: (isRecording || isAnalyzing) ? 0 : 1, y: (isRecording || isAnalyzing) ? 20 : 0 }} className="w-full px-6 flex gap-4 pt-4 shrink-0 relative z-20">
          <button 
            onClick={() => galleryInputRef.current?.click()} 
            className={\`flex-1 flex flex-col items-center justify-center gap-2 py-5 rounded-[32px] border backdrop-blur-3xl \${pendingFile ? 'bg-orange-500/5 border-orange-500/20' : 'bg-surface/80 border-foreground/[0.05]'}\`}
          >
            <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${pendingFile ? 'bg-orange-500/10' : 'bg-foreground/5'}\`}>
              {pendingFile ? <span className="text-orange-400 text-base">✓</span> : mode === 'audio' ? <Upload className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <span className={\`text-[10px] font-semibold uppercase tracking-widest \${pendingFile ? 'text-orange-400' : 'text-foreground/50'}\`}>
              {pendingFile ? "Załadowano" : mode === 'audio' ? t.bike.uploadAudio : t.bike.uploadFiles}
            </span>
          </button>

          <button onClick={() => setIsContextModalOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-2 bg-surface/80 py-5 rounded-[32px] border border-foreground/[0.05] backdrop-blur-3xl">
            <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
              <FileText className="w-4 h-4 text-foreground/60" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/50">
              {diagnosticContext ? "Kontekst gotowy" : t.bike.uploadContext}
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
        {isFollowUp && followUpRequest && !isAnalyzing && !isRecording && !pendingFile && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute inset-0 z-[60] flex flex-col bg-background/80 backdrop-blur-xl pt-16 px-6 pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">Etap 2 &middot; Follow Up Danych</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">Jeden krok do diagnozy</h2>
              <div className="w-full bg-surface/40 border border-foreground/[0.06] rounded-[20px] p-5">
                <p className="text-[10px] font-bold text-orange-400/70 uppercase mb-2">Instrukcja od AI</p>
                <p className="text-foreground/80 text-sm leading-relaxed">{followUpRequest.message}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
              <button
                onClick={() => { if (mode === 'audio') startRecording(); else fileInputRef.current?.click(); }}
                className="w-full flex items-center justify-center gap-3 bg-orange-500/10 border border-orange-500/25 text-orange-500 font-bold tracking-wider uppercase text-[11px] py-5 px-6 rounded-[24px]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Nagraj live z kamery/mikrofonu</span>
                </div>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 bg-surface/50 border border-foreground/[0.06] font-bold uppercase text-[11px] py-4 px-6 rounded-[24px]"
              >
                <ImageIcon className="w-4 h-4" /> Dodaj plik z biblioteki
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContextModalOpen && <ContextModal onClose={() => setIsContextModalOpen(false)} onSave={(data) => { setDiagnosticContext(data); setIsContextModalOpen(false); }} initialData={diagnosticContext || undefined} />}
        {isDiagnosisOpen && diagnosisData && <BikeDiagnosisReport onClose={() => { 
          setIsDiagnosisOpen(false); 
          setDiagnosisData(null); 
          setDiagnosticContext(null);
          setFirstFile(null);
        }} data={diagnosisData} />}
      </AnimatePresence>

      <AnimatePresence>
        {showPreScan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mt-6 mb-8">
               <h2 className="text-2xl font-bold">Wskazówki Bikerów</h2>
               <button onClick={() => setShowPreScan(false)} className="w-10 h-10 rounded-full bg-surface items-center justify-center flex"><X className="w-5 h-5 text-foreground/70" /></button>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-4 max-w-sm mx-auto">
               {[
                 { icon: '⚠️', tip: 'Unieś koło, wkręć pedał przed skanem napędu, aby dźwięk był sterylny.' },
                 { icon: '📸', tip: 'Wgrywając zdjęcie ramy, dbaj o silne oświetlenie pęknięć karbonu / spawu.' },
               ].map(({ icon, tip }) => (
                 <div key={tip} className="flex gap-4 border border-border-subtle bg-surface/50 rounded-2xl p-4">
                   <span className="text-2xl pt-1">{icon}</span>
                   <p className="text-sm font-medium">{tip}</p>
                 </div>
               ))}
            </div>
            <div className="mt-6 mb-4 pb-10">
               <button onClick={() => { localStorage.setItem('hasSeenBikePreScan', 'true'); setShowPreScan(false); if (pendingFile) runDiagnosis(pendingFile, false); }} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold uppercase text-sm">
                 Zrozumiałem
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" accept="image/*,video/*,audio/*" className="hidden" ref={galleryInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*,video/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

    </div>
  );
}
