const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. STATE CHANGES
txt = txt.replace(
  'const [pendingFile, setPendingFile] = useState<File | null>(null);',
  'const [pendingFiles, setPendingFiles] = useState<File[]>([]);\n  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);'
);

// 2. TIMEOUT IN RECORDING
txt = txt.replace(
  'setIsRecording(true);\n      startVisualizerLoop(false);',
  'setIsRecording(true);\n      startVisualizerLoop(false);\n      recordingTimeoutRef.current = setTimeout(async () => {\n        const audioFile = await stopRecording();\n        if (audioFile) setPendingFiles(prev => [...prev, audioFile].slice(0, 4));\n      }, 30000);'
);

txt = txt.replace(
  'if (animationRef.current) cancelAnimationFrame(animationRef.current);',
  'if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);\n      if (animationRef.current) cancelAnimationFrame(animationRef.current);'
);

// 3. FILE CHANGE HANDLER
const oldFileChange = `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

const newFileChange = `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
txt = txt.replace(oldFileChange, newFileChange);

// 4. TOGGLE RECORDING
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

// 5. RUN DIAGNOSIS
const oldRunSig = `const runDiagnosis = async (file: File, forceComplete: boolean = false) => {`;
const newRunSig = `const runDiagnosis = async (forceComplete: boolean = false) => {`;
txt = txt.replace(oldRunSig, newRunSig);

const oldRunBody1 = `    if (!file || file.size === 0) {
      const msg = 'Najpierw nagraj dźwięk usterki!';
      alert(msg);
      setError(msg);
      return;
    }`;
const newRunBody1 = `    if (pendingFiles.length === 0) {
      const msg = 'Dodaj co najmniej jeden plik!';
      alert(msg);
      setError(msg);
      return;
    }`;
txt = txt.replace(oldRunBody1, newRunBody1);

const oldRunBody2 = `    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      const duration = await new Promise<number>((resolve) => {
        const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');`;
const newRunBody2 = `    const mediaFile = pendingFiles.find(f => f.type.startsWith('audio/') || f.type.startsWith('video/'));
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      const duration = await new Promise<number>((resolve) => {
        const media = document.createElement(mediaFile.type.startsWith('video/') ? 'video' : 'audio');`;
txt = txt.replace(oldRunBody2, newRunBody2);

const oldFormData = `    const formData = new FormData();
    formData.append('file', file);`;
const newFormData = `    const formData = new FormData();
    for (const f of pendingFiles) {
      formData.append('file', f);
    }`;
txt = txt.replace(oldFormData, newFormData);


// 6. UI FIXES FOR MULTI-FILE

// Cancel button
txt = txt.replace(`cancelRecording = () => {
    stopRecording();
    setPendingFile(null);`, `cancelRecording = () => {
    stopRecording();
    setPendingFiles([]);`);

// Analyze click
txt = txt.replace(`if (!pendingFile) return;`, `if (pendingFiles.length === 0) return;`);
txt = txt.replace(`runDiagnosis(pendingFile, false);`, `runDiagnosis(false);`);

// PreScan Proceed
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

// JSX Checks
// We do EXACT string replacements to avoid regex nightmares.
txt = txt.replace(`{(isRecording || pendingFile) && !isAnalyzing && (`, `{(isRecording || pendingFiles.length > 0) && !isAnalyzing && (`);
txt = txt.replace(`pendingFile ? handleAnalyzeClick : toggleRecording`, `pendingFiles.length > 0 ? handleAnalyzeClick : toggleRecording`);
txt = txt.replace(`isRecording || pendingFile`, `isRecording || pendingFiles.length > 0`);
txt = txt.replace(`isRecording || pendingFile`, `isRecording || pendingFiles.length > 0`); // 2nd occurrence
txt = txt.replace(`pendingFile ? 'bg-surface-elevated/60 border border-blue-500/20' : 'bg-surface-elevated/90 border border-foreground/[0.08]'`, `pendingFiles.length > 0 ? 'bg-surface-elevated/60 border border-blue-500/20' : 'bg-surface-elevated/90 border border-foreground/[0.08]'`);
txt = txt.replace(`pendingFile ? (`, `pendingFiles.length > 0 ? (`);
txt = txt.replace(`pendingFile ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20' : 'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5'`, `pendingFiles.length > 0 ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20' : 'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5'`);
txt = txt.replace(`pendingFile ? (
                <span className="text-[#00D1FF] text-base">✓</span>`, `pendingFiles.length > 0 ? (
                <span className="text-[#00D1FF] text-base">✓</span>`);
txt = txt.replace(`pendingFile ? 'text-[#00D1FF]/80'`, `pendingFiles.length > 0 ? 'text-[#00D1FF]/80'`);
txt = txt.replace(`pendingFile ? \`✓ Załadowano\` :`, `pendingFiles.length > 0 ? \`✓ Załadowano (\${pendingFiles.length})\` :`);
txt = txt.replace(`!isAnalyzing && !isRecording && !pendingFile && (`, `!isAnalyzing && !isRecording && pendingFiles.length === 0 && (`);
txt = txt.replace(`setFirstFile(null);
          // Set to idle mode implicitly`, `setFirstFile(null);\n          setPendingFiles([]);\n          // Set to idle mode implicitly`);
txt = txt.replace(`if (pendingFile) runDiagnosis(pendingFile, false);`, `if (pendingFiles.length > 0) runDiagnosis(false);`);

// 7. Inputs
txt = txt.replace(`ref={fileInputRef}`, `ref={fileInputRef} multiple`);
txt = txt.replace(`ref={galleryInputRef}`, `ref={galleryInputRef} multiple`);

fs.writeFileSync(file, txt);
console.log("Scanner.tsx safely refactored via Node script.");
