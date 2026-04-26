const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. State changes
txt = txt.replace(
  'const [pendingFile, setPendingFile] = useState<File | null>(null);',
  'const [pendingFiles, setPendingFiles] = useState<File[]>([]);\n  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);'
);

// 2. Timeout in startRecording
txt = txt.replace(
  'setIsRecording(true);\n      startVisualizerLoop(false);',
  'setIsRecording(true);\n      startVisualizerLoop(false);\n      recordingTimeoutRef.current = setTimeout(async () => {\n        const audioFile = await stopRecording();\n        if (audioFile) setPendingFiles(prev => [...prev, audioFile].slice(0, 4));\n      }, 30000);'
);

txt = txt.replace(
  'if (animationRef.current) cancelAnimationFrame(animationRef.current);',
  'if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);\n      if (animationRef.current) cancelAnimationFrame(animationRef.current);'
);

// 3. cancelRecording
txt = txt.replace(
  `  const cancelRecording = () => {\n    stopRecording();\n    setPendingFile(null);\n  };`,
  `  const cancelRecording = () => {\n    stopRecording();\n    setPendingFiles([]);\n  };`
);

// 4. toggleRecording
const oldToggle = `  const toggleRecording = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) {
        setPendingFile(audioFile);
      } else {
        setError('Nie udało się nagrać audio. Spróbuj ponownie.');
      }
    } else {
      if (mode === 'visual') {
        fileInputRef.current?.click();
      } else {
        startRecording();
      }
    }
  };`;

const newToggle = `  const toggleRecording = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) {
        setPendingFiles(prev => [...prev, audioFile].slice(0, 4));
      } else {
        setError('Nie udało się nagrać audio. Spróbuj ponownie.');
      }
    } else {
      const preScanSeen = sessionStorage.getItem('hasSeenPreScan') === 'true';
      if (!preScanSeen) {
        setShowPreScan(true);
        return;
      }
      if (mode === 'visual') {
        fileInputRef.current?.click();
      } else {
        startRecording();
      }
    }
  };`;
txt = txt.replace(oldToggle, newToggle);

// 5. handleAnalyzeClick
const oldAnalyzeClick = `    const handleAnalyzeClick = () => {
    if (!pendingFile) return;

    const preScanSeen = localStorage.getItem('hasSeenPreScan') === 'true';
    if (!preScanSeen) {
      setShowPreScan(true);
      return;
    }

    if (!diagnosticContext && !vehicleMake && !vehicleDetails) {
      setShowContextReminder(true);
      return;
    }

    runDiagnosis(pendingFile, false);
  };`;

const newAnalyzeClick = `  const handleAnalyzeClick = () => {
    if (pendingFiles.length === 0) return;

    if (!diagnosticContext && !vehicleMake && !vehicleDetails) {
      setShowContextReminder(true);
      return;
    }

    runDiagnosis(false);
  };`;
txt = txt.replace(oldAnalyzeClick, newAnalyzeClick);

// 6. handlePreScanProceed
const oldPreScanProceed = `  const handlePreScanProceed = () => {
    localStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingFile) setTimeout(() => runDiagnosis(pendingFile, false), 200);
  };`;
const newPreScanProceed = `  const handlePreScanProceed = () => {
    sessionStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
  };`;
txt = txt.replace(oldPreScanProceed, newPreScanProceed);


// 7. runDiagnosis
const oldRunDiagnosis = `  const runDiagnosis = async (file: File, forceComplete: boolean = false) => {
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
           resolve(999);
        };
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

    setIsAnalyzing(true);
    setAnalyzingText(t.auto.status.init);
    setError(null);
    setStickyError(null);

    const formData = new FormData();
    formData.append('file', file);`;

const newRunDiagnosis = `  const runDiagnosis = async (forceComplete: boolean = false) => {
    if (pendingFiles.length === 0) {
      const msg = 'Dodaj co najmniej jeden plik!';
      alert(msg);
      setError(msg);
      return;
    }

    const mediaFile = pendingFiles.find(f => f.type.startsWith('audio/') || f.type.startsWith('video/'));
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      const duration = await new Promise<number>((resolve) => {
        const media = document.createElement(mediaFile.type.startsWith('video/') ? 'video' : 'audio');
        media.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(media.duration);
        };
        media.onerror = () => {
           URL.revokeObjectURL(url);
           resolve(999);
        };
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

    setIsAnalyzing(true);
    setAnalyzingText(t.auto.status.init);
    setError(null);
    setStickyError(null);

    const formData = new FormData();
    for (const file of pendingFiles) {
      formData.append('file', file);
    }`;
txt = txt.replace(oldRunDiagnosis, newRunDiagnosis);

// 8. handleFileChange
const oldFileChange2 = `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoadingFile(true);
      const file = e.target.files[0];
      // Short delay so user sees loading state
      await new Promise(r => setTimeout(r, 400));
      setPendingFile(file);
      setIsLoadingFile(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };`;

const newFileChange2 = `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoadingFile(true);
      const newFiles = Array.from(e.target.files);
      await new Promise(r => setTimeout(r, 400));
      setPendingFiles(prev => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, 4);
      });
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };`;
txt = txt.replace(oldFileChange2, newFileChange2);


// 9. UI replacements (using exact full lines to avoid partial match issues)

txt = txt.replace(
  `          {(isRecording || pendingFile) && !isAnalyzing && (`,
  `          {(isRecording || pendingFiles.length > 0) && !isAnalyzing && (`
);

txt = txt.replace(
  `              className={\`relative z-10 w-[160px] h-[160px] rounded-full flex items-center justify-center overflow-hidden backdrop-blur-3xl group \${pendingFile ? 'bg-surface-elevated/60 border border-blue-500/20' : 'bg-surface-elevated/90 border border-foreground/[0.08]'}\`}`,
  `              className={\`relative z-10 w-[160px] h-[160px] rounded-full flex items-center justify-center overflow-hidden backdrop-blur-3xl group \${pendingFiles.length > 0 ? 'bg-surface-elevated/60 border border-blue-500/20' : 'bg-surface-elevated/90 border border-foreground/[0.08]'}\`}`
);

txt = txt.replace(
  `              onClick={pendingFile ? handleAnalyzeClick : toggleRecording}`,
  `              onClick={pendingFiles.length > 0 ? handleAnalyzeClick : toggleRecording}`
);

txt = txt.replace(
  `                isRecording || pendingFile
                  ? { duration: 4, repeat: Infinity, ease: "easeInOut" }`,
  `                isRecording || pendingFiles.length > 0
                  ? { duration: 4, repeat: Infinity, ease: "easeInOut" }`
);

txt = txt.replace(
  `                isRecording || pendingFile
                   ? { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }`,
  `                isRecording || pendingFiles.length > 0
                   ? { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }`
);

txt = txt.replace(
  `                  ) : pendingFile ? (`,
  `                  ) : pendingFiles.length > 0 ? (`
);

txt = txt.replace(
  `            <input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} className="hidden" ref={galleryInputRef} onChange={handleFileChange} />`,
  `            <input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} capture="environment" className="hidden" ref={fileInputRef} multiple onChange={handleFileChange} />
            <input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} className="hidden" ref={galleryInputRef} multiple onChange={handleFileChange} />`
);

txt = txt.replace(
  `            <div className={\`w-10 h-10 rounded-full transition-all duration-500 flex items-center justify-center shadow-inner border \${
              pendingFile ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20' : 'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5'
            }\`}>
              {isLoadingFile ? (
                <Loader2 className="w-4 h-4 text-[#00D1FF] animate-spin" />
              ) : pendingFile ? (
                <span className="text-[#00D1FF] text-base">✓</span>`,
  `            <div className={\`w-10 h-10 rounded-full transition-all duration-500 flex items-center justify-center shadow-inner border \${
              pendingFiles.length > 0 ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20' : 'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5'
            }\`}>
              {isLoadingFile ? (
                <Loader2 className="w-4 h-4 text-[#00D1FF] animate-spin" />
              ) : pendingFiles.length > 0 ? (
                <span className="text-[#00D1FF] text-base">✓</span>`
);

txt = txt.replace(
  `              pendingFile ? 'text-[#00D1FF]/80' : 
              'text-foreground/50 group-hover:text-foreground/90'
            }\`}>
              {isLoadingFile ? 'Wczytuję...' : pendingFile ? \`✓ Załadowano\` : mode === 'audio' ? t.auto.uploadAudio : t.auto.uploadFiles}`,
  `              pendingFiles.length > 0 ? 'text-[#00D1FF]/80' : 
              'text-foreground/50 group-hover:text-foreground/90'
            }\`}>
              {isLoadingFile ? 'Wczytuję...' : pendingFiles.length > 0 ? \`✓ Załadowano (\${pendingFiles.length})\` : mode === 'audio' ? t.auto.uploadAudio : t.auto.uploadFiles}`
);

txt = txt.replace(
  `        {isFollowUp && followUpRequest && !isAnalyzing && !isRecording && !pendingFile && (`,
  `        {isFollowUp && followUpRequest && !isAnalyzing && !isRecording && pendingFiles.length === 0 && (`
);

txt = txt.replace(
  `          setVehicleDetails('');
          setFirstFile(null);
          // Set to idle mode implicitly`,
  `          setVehicleDetails('');
          setFirstFile(null);
          setPendingFiles([]);
          // Set to idle mode implicitly`
);

txt = txt.replace(
  `                  Rozumiem — analizuj teraz`,
  `                  Zrozumiałem — kontynuuj`
);

txt = txt.replace(
  `                  onClick={() => { setShowContextReminder(false); if(pendingFile) runDiagnosis(pendingFile, false); }}`,
  `                  onClick={() => { setShowContextReminder(false); if(pendingFiles.length > 0) runDiagnosis(false); }}`
);


fs.writeFileSync(file, txt);
console.log("Safe refactoring complete.");
