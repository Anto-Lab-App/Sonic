"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, ChevronDown, AlertCircle, Mic, Camera, Image as ImageIcon, Loader2, X, Sparkles } from 'lucide-react';

import { ContextModal } from './ContextModal';
import { InstructionsModal } from './InstructionsModal';
import { DiagnosisReport } from './DiagnosisReport';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Diagnosis, DiagnosticContextData } from '@/types/diagnosis';

// Utility for smooth animation interpolation
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

interface ScannerProps {
  mode?: 'audio' | 'visual';
}

export function Scanner({
  mode = 'audio'
}: ScannerProps) {
  const { t } = useLanguage();
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [hasSeenInstructionsState, setHasSeenInstructionsState] = useState(false);
  const [analyzingText, setAnalyzingText] = useState(t.auto.status.init);
  const [pendingHint, setPendingHint] = useState(0);
  const [diagnosisData, setDiagnosisData] = useState<Diagnosis | null>(null);

  const PENDING_HINTS = [
    "Plik gotowy — naciśnij aby analizować",
    "Możesz dodać dane pojazdu lub opis",
    "Kliknij przycisk aby uruchomić AI",
    "Dodaj kody OBD-II w kontekście",
  ];
  
  // New States for Follow-up Flow
  const [diagnosticContext, setDiagnosticContext] = useState<DiagnosticContextData | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpRequest, setFollowUpRequest] = useState<{ message: string, action_required: string } | null>(null);
  const [firstFile, setFirstFile] = useState<File | null>(null);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Refs for the concentric rings
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  // Store current scales for smooth lerping
  const currentScales = useRef<number[]>([1, 1, 1, 1, 1]);

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
          const engineThump = Math.sin(time * 15) * 80 + 80; // Low frequency thump
          const mechanicalWhine = Math.sin(time * 2 + i * 0.1) * 40 + 40;

          // Bass gets the thump, higher freqs get the whine
          let val = 0;
          if (i < 15) val = engineThump + noise;
          else val = mechanicalWhine + noise;

          const dropoff = Math.pow(1 - (i / 128), 1.5);
          dataArray[i] = Math.min(255, Math.max(0, val * dropoff));
        }
      }

      // Calculate frequency bands
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

      // Target scales based on frequencies (inner to outer)
      // Using Math.pow for non-linear reactions, but with softer multipliers for a calmer feel
      const targetScales = [
        1 + Math.pow(treble / 255, 1.5) * 0.3,
        1 + Math.pow(highMid / 255, 1.5) * 0.6,
        1 + Math.pow(mid / 255, 1.5) * 1.0,
        1 + Math.pow(lowMid / 255, 1.5) * 1.5,
        1 + Math.pow(bass / 255, 1.5) * 2.2
      ];

      // Smoothly interpolate scales
      for (let i = 0; i < 5; i++) {
        currentScales.current[i] = lerp(currentScales.current[i], targetScales[i], 0.05); // Extremely slow lerp for liquid feel

        if (ringsRef.current[i]) {
          const scale = currentScales.current[i];
          const intensity = targetScales[i] - 1; // How loud this band is

          // Opacity fades out as scale increases, but gets a boost from intensity
          const baseOpacity = 0.15 - (i * 0.02);
          const opacity = Math.max(0, baseOpacity - (scale - 1) * 0.04 + (intensity * 0.05));

          ringsRef.current[i]!.style.transform = `translate(-50%, -50%) scale(${scale})`;
          ringsRef.current[i]!.style.opacity = opacity.toString();

          // Dynamic color shifting based on intensity (deep blue to bright cyan)
          const r = Math.min(255, intensity * 80);
          const g = Math.min(255, 209 + intensity * 46); // #00D1FF is rgb(0, 209, 255)
          const b = 255;
          ringsRef.current[i]!.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
      }

      animationRef.current = requestAnimationFrame(updateData);
    };
    updateData();
  };

  const startRecording = async () => {
    setError(null);
    setIsDemoMode(false);
    recordedChunksRef.current = [];
    try {
      // 1. Initialize AudioContext FIRST to tie it to the user gesture (fixes iOS/Safari bugs)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      // 2. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Set up analyzer
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.9; // Extremely high smoothing for liquid, non-jittery reaction
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // 4. Start MediaRecorder to capture real audio data
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;

      setIsRecording(true);
      startVisualizerLoop(false);
    } catch (err) {
      console.warn("Microphone access denied or error:", err);
      setError(t.auto.noMic);
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

      // Reset rings to idle state smoothly
      for (let i = 0; i < 5; i++) {
        currentScales.current[i] = 1;
        if (ringsRef.current[i]) {
          ringsRef.current[i]!.style.transform = `translate(-50%, -50%) scale(1)`;
          ringsRef.current[i]!.style.opacity = '0';
        }
      }
    });
  };

  // Cancel recording without triggering analysis
  const cancelRecording = () => {
    stopRecording();
    setPendingFile(null);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) {
        setPendingFile(audioFile);
      } else {
        setError('Nie udało się nagrać audio. Spróbuj ponownie.');
      }
    } else {
      if (!hasSeenInstructionsState) {
        setShowInstructions(true);
      } else {
        if (mode === 'visual') {
          fileInputRef.current?.click();
        } else {
          startRecording();
        }
      }
    }
  };

  const handleInstructionsProceed = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenInstructions', 'true');
      setHasSeenInstructionsState(true);
    }
    setShowInstructions(false);
  };

  const handleAnalyzeClick = () => {
    if (!pendingFile) return;
    
    // Soft reminder — nie blokujemy, tylko ostrzegamy raz
    if (!diagnosticContext && (!vehicleMake || !vehicleDetails)) {
      setError('Wskazówka: Dodanie danych pojazdu zwiększa trafność diagnozy.');
      // Clear warning after 4s and proceed anyway
      setTimeout(() => setError(null), 4000);
    }
    
    runDiagnosis(pendingFile, false);
  };

  const runDiagnosis = async (file: File, forceComplete: boolean = false) => {
    if (!file || file.size === 0) {
      const msg = 'Najpierw nagraj dźwięk usterki!';
      alert(msg);
      setError(msg);
      return;
    }

    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
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
        // Czasami duration ładuje się w nieskończoność dla surowych blobów z MediaRecordera, fallback:
        setTimeout(() => {
           URL.revokeObjectURL(url);
           resolve(999);
        }, 1500);
        media.src = url;
      });

      if (duration > 0 && duration < 1) {
        const msg = 'Nagranie musi trwać co najmniej 1 sekundę!';
        alert(msg);
        setError(msg);
        return;
      }
    }

    // Set UI to analyzing
    setIsAnalyzing(true);
    setAnalyzingText(t.auto.status.init);
    setError(null);

    // Create form data
    const formData = new FormData();
    // If we're in follow_up state, append the first file alongside the new one
    if (isFollowUp && firstFile) {
      formData.append("file", firstFile);
    }
    formData.append("file", file);

    formData.append("vehicleMake", vehicleMake);
    formData.append("vehicleDetails", vehicleDetails);

    // Build context text from diagnosticContext
    if (diagnosticContext) {
      const ctxParts = [];
      if (diagnosticContext.mileage) ctxParts.push(`Przebieg: ${diagnosticContext.mileage}`);
      if (diagnosticContext.obdCodes) ctxParts.push(`Kody OBD-II: ${diagnosticContext.obdCodes}`);
      if (diagnosticContext.condition) ctxParts.push(`Okoliczności: ${diagnosticContext.condition}`);
      if (diagnosticContext.tags.length > 0) ctxParts.push(`Tagi: ${diagnosticContext.tags.join(', ')}`);
      if (diagnosticContext.description) ctxParts.push(`Opis: ${diagnosticContext.description}`);
      formData.append("context", ctxParts.join('\n'));

      // Attach context files if any
      if (diagnosticContext.contextFiles && diagnosticContext.contextFiles.length > 0) {
        diagnosticContext.contextFiles.forEach(f => {
          formData.append("file", f);
        });
      }
    }

    if (forceComplete) {
      formData.append("context", (formData.get("context") || "") + "\n\nUWAGA: Użytkownik odmówił przetestowania fizycznego - wymuś ostateczną diagnozę z dostępnym zestawem danych ze statusem 'complete'.");
    }

    // Mock progress messages
    const statuses = [
      t.auto.status.audio,
      t.auto.status.engine,
      t.auto.status.db,
    ];
    let statusIndex = 0;
    const interval = setInterval(() => {
      statusIndex = (statusIndex + 1) % statuses.length;
      setAnalyzingText(statuses[statusIndex]);
    }, 2500);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      clearInterval(interval);
      setIsAnalyzing(false);

      console.log('[Sonic Frontend] Response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || t.auto.status.error);
      }

      const aiResponse = data.aiResponse;
      
      // Handle AI Response based on status field
      if (aiResponse?.status === "follow_up" && aiResponse?.follow_up_request) {
        setIsFollowUp(true);
        setFollowUpRequest(aiResponse.follow_up_request);
        setFirstFile(file);
      } else if (aiResponse?.status === "complete" || data.diagnosis) {
        // Accept either complete status or legacy diagnosis field
        const diagnosis = aiResponse?.final_diagnosis || data.diagnosis;
        if (!diagnosis) {
          throw new Error("AI zwróciło status 'complete', ale brak danych diagnozy.");
        }
        setDiagnosisData(diagnosis);
        setIsDiagnosisOpen(true);
        setIsFollowUp(false);
        setFollowUpRequest(null);
        setFirstFile(null);
        setPendingFile(null);
      } else {
        console.error('[Sonic Frontend] Unexpected response structure:', data);
        throw new Error("Nieoczekiwana struktura odpowiedzi od AI. Spróbuj ponownie.");
      }

    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      const msg = err instanceof Error ? err.message : t.auto.status.error;
      setError(msg);
      // In case of error we don't drop the follow up state, user might retry
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    setHasSeenInstructionsState(localStorage.getItem('hasSeenInstructions') === 'true');
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Cycle through hint messages when file is pending
  useEffect(() => {
    if (!pendingFile) { setPendingHint(0); return; }
    const id = setInterval(() => setPendingHint(h => (h + 1) % PENDING_HINTS.length), 2800);
    return () => clearInterval(id);
  }, [pendingFile]);

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col items-center font-sans relative overflow-hidden selection:bg-[#00D1FF]/30">
      {/* Premium Deep Navy Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#13172B_0%,#06080F_100%)] pointer-events-none" />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.08, 0.15, 0.08],
          rotate: [0, 45, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-gradient-to-br from-[#00D1FF] to-transparent rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
          rotate: [0, -45, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-gradient-to-tl from-[#00D1FF] to-transparent rounded-full blur-[120px] pointer-events-none"
      />

      {/* Mobile-perfect container */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full overflow-y-auto scrollbar-hide pb-[100px] md:pb-[120px]">

        {/* Cancel button during recording or when pendingFile exists — top left */}
        <AnimatePresence>
          {(isRecording || pendingFile) && !isAnalyzing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={cancelRecording}
              className="fixed top-6 left-6 z-50 w-11 h-11 rounded-full bg-foreground/5 backdrop-blur-2xl border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              aria-label="Anuluj"
            >
              <X className="w-5 h-5 text-foreground/70" strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Top Inputs + Protipy Button */}
        <motion.div
          animate={{ opacity: (isRecording || isAnalyzing) ? 0 : 1, y: (isRecording || isAnalyzing) ? -20 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-6 flex flex-col items-center pt-4 pb-1 relative z-20 gap-3 shrink-0"
          style={{ pointerEvents: (isRecording || isAnalyzing) ? 'none' : 'auto' }}
        >
          <div className="w-full bg-surface/80 hover:bg-surface-hover/90 transition-all duration-500 p-4 rounded-[32px] border border-foreground/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] group flex flex-col gap-3">
            <div className="flex flex-col items-start px-2">
              <span className="text-[10px] font-semibold tracking-widest text-[#00D1FF] uppercase mb-0.5">{t.auto.vehicleData}</span>
              <span className="text-xs text-foreground/50">{t.auto.vehicleDataSub}</span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder={t.auto.makeModelPlaceholder}
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="w-full bg-background/50 border border-foreground/[0.05] rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#00D1FF]/40 focus:ring-1 focus:ring-[#00D1FF]/20 transition-all"
              />
              <input
                type="text"
                placeholder={t.auto.yearEnginePlaceholder}
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                className="w-full bg-background/50 border border-foreground/[0.05] rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-[#00D1FF]/40 focus:ring-1 focus:ring-[#00D1FF]/20 transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium tracking-wider text-foreground/40 hover:text-foreground/80 transition-colors bg-surface-elevated/50 border border-foreground/[0.05] px-5 py-2.5 rounded-full shadow-sm max-w-full"
          >
            <AlertCircle size={14} className="shrink-0" /> <span className="truncate">{t.auto.protips}</span>
          </button>
        </motion.div>

        {/* Center Concentric Visualizer & Button */}
        <div className={`z-10 flex flex-col items-center w-full relative flex-1 justify-center min-h-[280px]`}>

          {/* Status Text - always visible, cycles through states */}
          <div className="h-16 mb-4 flex flex-col items-center justify-end z-10">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key={analyzingText}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center px-2"
                >
                  <h2 className="text-2xl font-bold tracking-wide mb-2 text-foreground">{t.loadingAI}</h2>
                  <p className="text-xs font-semibold tracking-widest text-purple-400/80 uppercase">{analyzingText}</p>
                </motion.div>
              ) : pendingFile ? (
                <motion.div
                  key={`pending-${pendingHint}`}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center px-2"
                >
                  <h2 className="text-2xl font-bold tracking-wide mb-2 text-foreground">Gotowy do analizy</h2>
                  <p className="text-sm text-[#00D1FF]/70 font-medium tracking-wide">{PENDING_HINTS[pendingHint]}</p>
                </motion.div>
              ) : (
                <motion.div
                  key={isRecording ? 'recording' : 'idle'}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center px-2"
                >
                  <h2 className={`text-2xl font-bold tracking-wide mb-2 ${isRecording ? 'text-foreground' : 'text-foreground/90'}`}>
                    {mode === 'visual'
                      ? (isRecording ? t.auto.audioOpening : t.auto.visualTitle)
                      : (isRecording ? (isDemoMode ? t.demoMode : t.auto.audioListening) : t.auto.audioTap)}
                  </h2>
                  <p className="text-sm text-foreground/50 font-medium tracking-wide text-center px-4">
                    {mode === 'visual'
                      ? t.auto.visualSub
                      : (isRecording
                        ? (isDemoMode ? t.auto.audioSubDemo : t.auto.audioSubSrc)
                        : t.auto.audioSubReq)
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex items-center justify-center w-[200px] h-[200px]">

            {/* Concentric Rings (Solid circles expanding outwards and fading) */}
            <div className="absolute inset-0 pointer-events-none" style={{ display: mode === 'visual' ? 'none' : 'block' }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  ref={(el) => { ringsRef.current[i] = el; }}
                  className="absolute top-1/2 left-1/2 w-[160px] h-[160px] rounded-full bg-[#00D1FF] mix-blend-screen transition-opacity duration-200"
                  style={{
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 0,
                    willChange: 'transform, opacity, background-color'
                  }}
                />
              ))}
            </div>

            {/* Continuous Subtle Waves (Emanating from center) */}
            <AnimatePresence>
              {isRecording && mode === 'audio' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={`wave-${i}`}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: 4, opacity: [0, 0.15, 0, 0] }}
                      transition={{
                        scale: {
                          duration: 6,
                          repeat: Infinity,
                          delay: i * 2,
                          ease: "easeOut",
                        },
                        opacity: {
                          duration: 6,
                          repeat: Infinity,
                          delay: i * 2,
                          times: [0, 0.2, 0.8, 1], // Fades out completely before the scale ends to prevent popping
                          ease: "easeInOut",
                        }
                      }}
                      className="absolute w-[160px] h-[160px] rounded-full border-[1.5px] border-[#00D1FF]/40 mix-blend-screen"
                      style={{ willChange: 'transform, opacity' }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Idle Breathing Animation for Rings (only when not recording) */}
            {!isRecording && mode === 'audio' && (
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.1, 0.03] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <div className="w-[180px] h-[180px] rounded-full bg-[#00D1FF] blur-md" />
              </motion.div>
            )}

            {/* Central Button (Steve Jobs / Apple Style with Logo) */}
            <motion.button
              onClick={pendingFile ? handleAnalyzeClick : toggleRecording}
              style={{ pointerEvents: isAnalyzing ? 'none' : 'auto' }}
              animate={
                isRecording || pendingFile
                  ? {
                    scale: [0.98, 1.02, 0.98],
                    boxShadow: [
                      '0 0 30px rgba(0, 209, 255, 0.2), inset 0 2px 20px rgba(0, 209, 255, 0.1)',
                      '0 0 60px rgba(0, 209, 255, 0.4), inset 0 2px 20px rgba(0, 209, 255, 0.2)',
                      '0 0 30px rgba(0, 209, 255, 0.2), inset 0 2px 20px rgba(0, 209, 255, 0.1)'
                    ]
                  }
                  : {
                    scale: 1,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.05)'
                  }
              }
              transition={
                isRecording || pendingFile
                  ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              }
              className={`relative z-10 w-[160px] h-[160px] rounded-full flex items-center justify-center overflow-hidden backdrop-blur-3xl group ${pendingFile ? 'bg-surface-elevated/60 border border-blue-500/20' : 'bg-surface-elevated/90 border border-foreground/[0.08]'}`}
            >
              {/* Inner Depth Shadow */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] pointer-events-none" />

              {/* Minimalist Mic Icon inside button */}
              <div className="relative z-10 flex flex-col items-center justify-center select-none">
                <motion.div
                  animate={isRecording ? { opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex items-center justify-center p-4"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-12 h-12 stroke-[1.5] text-purple-400 animate-spin" />
                  ) : pendingFile ? (
                    <Sparkles className="w-12 h-12 stroke-[1.5] text-[#00D1FF]/60" />
                  ) : mode === 'audio' ? (
                    <Mic className={`w-12 h-12 stroke-[1.5] transition-colors duration-500 ${isRecording ? 'text-primary' : 'text-foreground/80'}`} />
                  ) : (
                    <Camera className={`w-12 h-12 stroke-[1.5] transition-colors duration-500 ${isRecording ? 'text-foreground' : 'text-foreground/80'}`} />
                  )}

                  {isAnalyzing && (
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent border-t-purple-400 border-r-purple-400/50 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  {(isRecording || isAnalyzing) && mode === 'audio' && (
                    <motion.div
                      className={`absolute inset-0 blur-xl rounded-full -z-10 ${isAnalyzing ? 'bg-purple-500' : 'bg-[#00D1FF]'}`}
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>
              </div>
            </motion.button>

            {/* Analyzing glow ring (visible when isAnalyzing) */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full pointer-events-none border border-purple-400/30"
                />
              )}
            </AnimatePresence>

            <input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} className="hidden" ref={galleryInputRef} onChange={handleFileChange} />

            {/* Error Message Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-[-80px] flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-xl backdrop-blur-md z-50"
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
          animate={{ opacity: (isRecording || isAnalyzing) ? 0 : 1, y: (isRecording || isAnalyzing) ? 20 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-6 flex gap-4 pt-4 shrink-0 relative z-20"
          style={{ pointerEvents: (isRecording || isAnalyzing) ? 'none' : 'auto' }}
        >
          <button onClick={() => galleryInputRef.current?.click()} className="flex-1 group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 bg-surface/80 hover:bg-surface-hover/90 transition-all duration-500 py-5 rounded-[32px] border border-foreground/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 rounded-full bg-foreground/5 group-hover:bg-foreground/10 group-hover:scale-105 transition-all duration-500 flex items-center justify-center shadow-inner border border-foreground/5">
              {mode === 'audio' ? (
                <Upload className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
              ) : (
                <ImageIcon className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-foreground/50 group-hover:text-foreground/90 uppercase tracking-widest transition-colors text-center px-2 truncate w-full">
              {mode === 'audio' ? t.auto.uploadAudio : t.auto.uploadFiles}
            </span>
          </button>

          <button onClick={() => setIsContextModalOpen(true)} className="flex-1 group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 bg-surface/80 hover:bg-surface-hover/90 transition-all duration-500 py-5 rounded-[32px] border border-foreground/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 rounded-full bg-foreground/5 group-hover:bg-foreground/10 group-hover:scale-105 transition-all duration-500 flex items-center justify-center shadow-inner border border-foreground/5">
              <FileText className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-foreground/50 group-hover:text-foreground/90 uppercase tracking-widest transition-colors text-center px-2 truncate w-full">
              {diagnosticContext ? "KONTEKST DODANY" : t.auto.uploadContext}
            </span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isFollowUp && followUpRequest && !isAnalyzing && !isRecording && !pendingFile && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-[60] flex flex-col"
          >
            {/* Blurred background */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full pt-16 px-6 pb-8">
              {/* Top badge */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-2 bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded-full px-4 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-[#00D1FF] uppercase">Etap 2 &middot; Test Diagnostyczny</span>
                </div>
              </div>
              
              {/* Message */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">Jeden krok<br />do diagnozy</h2>
                <p className="text-foreground/60 text-sm max-w-xs mx-auto leading-relaxed">
                  {followUpRequest.message}
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                {/* Primary: Record */}
                <button
                  onClick={() => {
                    if (mode === 'audio') startRecording();
                    else fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-[#00D1FF]/10 hover:bg-[#00D1FF]/15 border border-[#00D1FF]/25 hover:border-[#00D1FF]/40 text-[#00D1FF] font-bold tracking-wider uppercase text-xs py-5 px-6 rounded-[24px] transition-all active:scale-95"
                >
                  {mode === 'audio' ? <Mic className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  {followUpRequest.action_required}
                </button>

                {/* Secondary: Upload photo/video */}
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 bg-surface/50 hover:bg-surface border border-foreground/[0.06] hover:border-foreground/[0.12] text-foreground/60 hover:text-foreground font-bold tracking-wider uppercase text-xs py-4 px-6 rounded-[24px] transition-all active:scale-95"
                >
                  <ImageIcon className="w-4 h-4" />
                  Dodaj zdjęcie lub wideo
                </button>

                {/* Skip */}
                <button
                  onClick={() => {
                    if (firstFile) runDiagnosis(firstFile, true);
                  }}
                  className="w-full flex items-center justify-center text-foreground/30 hover:text-foreground/60 font-medium text-xs py-3 transition-colors"
                >
                  Nie mogę wykonać testu — pomiń i wydaj diagnozę
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContextModalOpen && <ContextModal onClose={() => setIsContextModalOpen(false)} onSave={(data) => { setDiagnosticContext(data); setIsContextModalOpen(false); }} initialData={diagnosticContext || undefined} />}
        {showInstructions && <InstructionsModal onProceed={handleInstructionsProceed} isAudioMode={mode === 'audio'} />}
        {isDiagnosisOpen && diagnosisData && <DiagnosisReport onClose={() => { setIsDiagnosisOpen(false); setDiagnosisData(null); }} data={diagnosisData} />}
      </AnimatePresence>
    </div>
  );
}
