import sys

file_path = 'src/components/Scanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. State changes
txt = txt.replace(
    'const [pendingFile, setPendingFile] = useState<File | null>(null);',
    'const [pendingFiles, setPendingFiles] = useState<File[]>([]);\n  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);'
)

# 2. Timeout in startRecording
txt = txt.replace(
    'setIsRecording(true);\n      startVisualizerLoop(false);',
    'setIsRecording(true);\n      startVisualizerLoop(false);\n      recordingTimeoutRef.current = setTimeout(async () => {\n        const audioFile = await stopRecording();\n        if (audioFile) setPendingFiles(prev => [...prev, audioFile].slice(0, 4));\n      }, 30000);'
)

txt = txt.replace(
    'if (animationRef.current) cancelAnimationFrame(animationRef.current);',
    'if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);\n      if (animationRef.current) cancelAnimationFrame(animationRef.current);'
)

# 3. cancelRecording
txt = txt.replace(
    '  const cancelRecording = () => {\n    stopRecording();\n    setPendingFile(null);\n  };',
    '  const cancelRecording = () => {\n    stopRecording();\n    setPendingFiles([]);\n  };'
)

# 4. toggleRecording
old_toggle = """  const toggleRecording = async () => {
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
  };"""

new_toggle = """  const toggleRecording = async () => {
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
  };"""
txt = txt.replace(old_toggle, new_toggle)

# 5. handleAnalyzeClick
old_analyze_click = """  const handleAnalyzeClick = () => {
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
  };"""

new_analyze_click = """  const handleAnalyzeClick = () => {
    if (pendingFiles.length === 0) return;

    if (!diagnosticContext && !vehicleMake && !vehicleDetails) {
      setShowContextReminder(true);
      return;
    }

    runDiagnosis(false);
  };"""
txt = txt.replace(old_analyze_click, new_analyze_click)

# 6. handlePreScanProceed
old_prescan = """  const handlePreScanProceed = () => {
    localStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingFile) setTimeout(() => runDiagnosis(pendingFile, false), 200);
  };"""
new_prescan = """  const handlePreScanProceed = () => {
    sessionStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
  };"""
txt = txt.replace(old_prescan, new_prescan)

# 7. runDiagnosis logic
old_rund = """  const runDiagnosis = async (file: File, forceComplete: boolean = false) => {
    if (!file || file.size === 0) {
      const msg = 'Najpierw nagraj dźwięk usterki!';
      alert(msg);
      setError(msg);
      return;
    }

    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      const duration = await new Promise<number>((resolve) => {
        const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');"""

new_rund = """  const runDiagnosis = async (forceComplete: boolean = false) => {
    if (pendingFiles.length === 0) {
      const msg = 'Dodaj co najmniej jeden plik!';
      alert(msg);
      setError(msg);
      return;
    }

    const mediaFile = pendingFiles.find((f: File) => f.type.startsWith('audio/') || f.type.startsWith('video/'));
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      const duration = await new Promise<number>((resolve) => {
        const media = document.createElement(mediaFile.type.startsWith('video/') ? 'video' : 'audio');"""
txt = txt.replace(old_rund, new_rund)

# 8. formData inside runDiagnosis
txt = txt.replace('formData.append("file", file);', 'for (const f of pendingFiles) {\n      formData.append("file", f);\n    }')

# 9. diagnostic context files type
txt = txt.replace('diagnosticContext.contextFiles.forEach(f => {', 'diagnosticContext.contextFiles.forEach((f: File) => {')

# 10. AI Response follow_up
old_follow = """      if (aiResponse?.status === "follow_up" && aiResponse?.follow_up_request) {
        setIsFollowUp(true);
        setFollowUpRequest(aiResponse.follow_up_request);
        setFirstFile(file);
        setPendingFile(null); // clear so follow-up overlay shows"""
new_follow = """      if (aiResponse?.status === "follow_up" && aiResponse?.follow_up_request) {
        setIsFollowUp(true);
        setFollowUpRequest(aiResponse.follow_up_request);
        if (pendingFiles.length > 0) setFirstFile(pendingFiles[0]);
        setPendingFiles([]); // clear so follow-up overlay shows"""
txt = txt.replace(old_follow, new_follow)

# Oh wait, the original follow_up clears pendingFile. Let's make sure:
txt = txt.replace('setFirstFile(file);\n        setPendingFile(null);', 'if (pendingFiles.length > 0) setFirstFile(pendingFiles[0]);\n        setPendingFiles([]);')
txt = txt.replace('setFirstFile(null);\n        setPendingFile(null);', 'setFirstFile(null);\n        setPendingFiles([]);')


# 11. handleFileChange
old_filechange = """  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };"""
new_filechange = """  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };"""
txt = txt.replace(old_filechange, new_filechange)

# 12. UI Specific replacements

txt = txt.replace(
  '{(isRecording || pendingFile) && !isAnalyzing && (',
  '{(isRecording || pendingFiles.length > 0) && !isAnalyzing && ('
)

txt = txt.replace(
  'className={`relative z-10 w-[160px] h-[160px] rounded-full flex items-center justify-center overflow-hidden backdrop-blur-3xl group ${pendingFile ? \'bg-surface-elevated/60 border border-blue-500/20\' : \'bg-surface-elevated/90 border border-foreground/[0.08]\'}`}',
  'className={`relative z-10 w-[160px] h-[160px] rounded-full flex items-center justify-center overflow-hidden backdrop-blur-3xl group ${pendingFiles.length > 0 ? \'bg-surface-elevated/60 border border-blue-500/20\' : \'bg-surface-elevated/90 border border-foreground/[0.08]\'}`}'
)

txt = txt.replace(
  'onClick={pendingFile ? handleAnalyzeClick : toggleRecording}',
  'onClick={pendingFiles.length > 0 ? handleAnalyzeClick : toggleRecording}'
)

txt = txt.replace(
  'isRecording || pendingFile\n                  ? { duration: 4, repeat: Infinity, ease: "easeInOut" }',
  'isRecording || pendingFiles.length > 0\n                  ? { duration: 4, repeat: Infinity, ease: "easeInOut" }'
)

txt = txt.replace(
  'isRecording || pendingFile\n                   ? { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }',
  'isRecording || pendingFiles.length > 0\n                   ? { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }'
)

txt = txt.replace(
  ') : pendingFile ? (',
  ') : pendingFiles.length > 0 ? ('
)

txt = txt.replace(
  'ref={fileInputRef} onChange={handleFileChange} />',
  'ref={fileInputRef} multiple onChange={handleFileChange} />'
)

txt = txt.replace(
  'ref={galleryInputRef} onChange={handleFileChange} />',
  'ref={galleryInputRef} multiple onChange={handleFileChange} />'
)

txt = txt.replace(
  'pendingFile ? \'bg-[#00D1FF]/10 border-[#00D1FF]/20\' : \'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5\'',
  'pendingFiles.length > 0 ? \'bg-[#00D1FF]/10 border-[#00D1FF]/20\' : \'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5\''
)

txt = txt.replace(
  'pendingFile ? \'text-[#00D1FF]/80\' :',
  'pendingFiles.length > 0 ? \'text-[#00D1FF]/80\' :'
)

txt = txt.replace(
  'pendingFile ? `✓ Załadowano` : mode === \'audio\'',
  'pendingFiles.length > 0 ? `✓ Załadowano (${pendingFiles.length})` : mode === \'audio\''
)

txt = txt.replace(
  '{isFollowUp && followUpRequest && !isAnalyzing && !isRecording && !pendingFile && (',
  '{isFollowUp && followUpRequest && !isAnalyzing && !isRecording && pendingFiles.length === 0 && ('
)

txt = txt.replace(
  'setFirstFile(null);\n          // Set to idle mode implicitly',
  'setFirstFile(null);\n          setPendingFiles([]);\n          // Set to idle mode implicitly'
)

txt = txt.replace(
  'onClick={() => { setShowContextReminder(false); runDiagnosis(pendingFile, false); }}',
  'onClick={() => { setShowContextReminder(false); runDiagnosis(false); }}'
)

txt = txt.replace(
  'Rozumiem — analizuj teraz',
  'Zrozumiałem — kontynuuj'
)

txt = txt.replace(
  'if (!pendingFile) { setPendingHint(0); return; }',
  'if (pendingFiles.length === 0) { setPendingHint(0); return; }'
)

txt = txt.replace(
  '}, [pendingFile]);',
  '}, [pendingFiles.length]);'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(txt)

print("Python refactoring complete.")
