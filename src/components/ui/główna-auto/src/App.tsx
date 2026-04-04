/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, ChevronDown, AlertCircle, Mic } from 'lucide-react';

// Utility for smooth animation interpolation
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [target, setTarget] = useState('Silnik spalinowy (Diesel)');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Refs for the concentric rings
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  // Store current scales for smooth lerping
  const currentScales = useRef<number[]>([1, 1, 1, 1, 1]);

  const targets = [
    'Silnik spalinowy (Diesel)',
    'Silnik spalinowy (Benzyna)',
    'Silnik elektryczny',
    'Skrzynia biegów',
    'Pompa wody'
  ];

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

      setIsRecording(true);
      startVisualizerLoop(false);
    } catch (err) {
      console.warn("Microphone access denied or error:", err);
      setError("Brak mikrofonu. Uruchomiono tryb demonstracyjny.");
      setIsDemoMode(true);
      setIsRecording(true);
      startVisualizerLoop(true);
    }
  };

  const stopRecording = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#06080F] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden selection:bg-[#00D1FF]/30">
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
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-screen flex-1">
        
        {/* Top Dropdown */}
        <motion.div 
          animate={{ opacity: isRecording ? 0 : 1, y: isRecording ? -20 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-6 flex flex-col items-center pt-12 pb-4 relative z-20"
          style={{ pointerEvents: isRecording ? 'none' : 'auto' }}
        >
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full bg-[#1A1D2E]/80 hover:bg-[#24283B]/90 transition-all duration-500 px-6 py-4 rounded-[32px] border border-white/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] group"
          >
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-0.5 group-hover:text-white/60 transition-colors">Cel diagnozy</span>
            <span className="text-sm font-medium tracking-wide text-white/90">{target}</span>
          </div>
          <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
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
              className="absolute top-[calc(100%+8px)] w-[calc(100%-3rem)] bg-[#1A1D2E]/95 backdrop-blur-3xl border border-white/[0.05] rounded-[28px] shadow-2xl overflow-hidden z-50"
            >
              <div className="py-2 flex flex-col">
                {targets.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTarget(t);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-6 py-3.5 text-sm transition-all duration-300 flex items-center justify-between ${
                      target === t 
                        ? 'bg-[#00D1FF]/10 text-[#00D1FF] font-medium' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {t}
                    {target === t && <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_rgba(0,209,255,0.8)]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>

        {/* Center Concentric Visualizer & Button */}
      <div className="z-10 flex flex-col items-center justify-center flex-1 w-full relative my-8">
        
        {/* Status Text (Moved above the button for better visibility like Shazam) */}
        <div className="h-16 mb-8 flex flex-col items-center justify-end z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={isRecording ? 'recording' : 'idle'}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h2 className={`text-2xl font-bold tracking-wide mb-2 ${isRecording ? 'text-white' : 'text-white/90'}`}>
                {isRecording ? (isDemoMode ? 'Tryb Demo...' : 'Nasłuchiwanie...') : 'Dotknij, aby diagnozować'}
              </h2>
              <p className="text-sm text-white/50 font-medium tracking-wide text-center px-4">
                {isRecording 
                  ? (isDemoMode ? 'Symulacja dźwięku silnika (brak mikrofonu)' : 'Zbliż telefon do źródła dźwięku') 
                  : 'Wymagany dostęp do mikrofonu'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative flex items-center justify-center w-[200px] h-[200px]">
          
          {/* Concentric Rings (Solid circles expanding outwards and fading) */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                ref={el => ringsRef.current[i] = el} 
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
            {isRecording && (
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
          {!isRecording && (
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
            onClick={toggleRecording}
            animate={
              isRecording
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
              isRecording
                ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }
            className="relative z-10 w-[160px] h-[160px] rounded-full flex items-center justify-center overflow-hidden backdrop-blur-3xl border border-white/[0.08] group bg-[#080C16]/90"
          >
            {/* Inner Depth Shadow */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.6)] pointer-events-none" />

            {/* Minimalist Mic Icon inside button */}
            <div className="relative z-10 flex flex-col items-center justify-center select-none">
              <motion.div
                animate={isRecording ? { opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] } : { opacity: 1, scale: 1 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <Mic className={`w-12 h-12 stroke-[1.5] transition-colors duration-500 ${isRecording ? 'text-[#00D1FF]' : 'text-white/80'}`} />
                {isRecording && (
                  <motion.div 
                    className="absolute inset-0 bg-[#00D1FF] blur-xl rounded-full -z-10"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.div>
            </div>
          </motion.button>
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

        {/* Bottom Buttons */}
        <motion.div 
          animate={{ opacity: isRecording ? 0 : 1, y: isRecording ? 20 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full px-6 flex gap-4 pb-12 relative z-20"
          style={{ pointerEvents: isRecording ? 'none' : 'auto' }}
        >
          <button className="flex-1 group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 bg-[#1A1D2E]/80 hover:bg-[#24283B]/90 transition-all duration-500 py-5 rounded-[32px] border border-white/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 group-hover:scale-105 transition-all duration-500 flex items-center justify-center shadow-inner border border-white/5">
              <Upload className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-white/50 group-hover:text-white/90 uppercase tracking-widest transition-colors text-center px-2">
              Wgraj audio
            </span>
          </button>
          
          <button className="flex-1 group relative overflow-hidden flex flex-col items-center justify-center gap-2.5 bg-[#1A1D2E]/80 hover:bg-[#24283B]/90 transition-all duration-500 py-5 rounded-[32px] border border-white/[0.05] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 group-hover:scale-105 transition-all duration-500 flex items-center justify-center shadow-inner border border-white/5">
              <FileText className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-white/50 group-hover:text-white/90 uppercase tracking-widest transition-colors text-center px-2">
              Wgraj kontekst
            </span>
          </button>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
