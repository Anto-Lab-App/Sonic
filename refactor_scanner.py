import sys

file_path = 'src/components/Scanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State changes
content = content.replace(
    'const [pendingFile, setPendingFile] = useState<File | null>(null);',
    'const [pendingFiles, setPendingFiles] = useState<File[]>([]);\n  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);'
)

# 2. handleFileChange
old_file_change = """  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
new_file_change = """  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoadingFile(true);
      const newFiles = Array.from(e.target.files);
      await new Promise(r => setTimeout(r, 400));
      setPendingFiles(prev => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, 4); // Max 4 files limit
      });
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };"""
content = content.replace(old_file_change, new_file_change)

# 3. startRecording / stopRecording / toggleRecording / cancelRecording
content = content.replace('setPendingFile(null);', 'setPendingFiles([]);')
content = content.replace('setPendingFile(audioFile);', 'setPendingFiles(prev => [...prev, audioFile].slice(0,4));')

old_toggle = """    const toggleRecording = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) {
        setPendingFile(audioFile);
      } else {
        setError('Nie udało się nagrać audio. Spróbuj ponownie.');
      }
    } else {
      const preScanSeen = sessionStorage.getItem('hasSeenPreScan') === 'true';
      if (!preScanSeen) {
        setPendingAction(() => () => {
          if (mode === 'visual') fileInputRef.current?.click();
          else startRecording();
        });
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
new_toggle = """  const toggleRecording = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) {
        setPendingFiles(prev => [...prev, audioFile].slice(0,4));
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
content = content.replace(old_toggle, new_toggle)

old_prescan_proceed = """    const handlePreScanProceed = () => {
    sessionStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingAction) {
      setTimeout(pendingAction, 200);
      setPendingAction(null);
    }
  };"""
new_prescan_proceed = """  const handlePreScanProceed = () => {
    sessionStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
  };"""
content = content.replace(old_prescan_proceed, new_prescan_proceed)

# Add timeout to startRecording
content = content.replace(
    'setIsRecording(true);\n      startVisualizerLoop(false);',
    'setIsRecording(true);\n      startVisualizerLoop(false);\n\n      recordingTimeoutRef.current = setTimeout(async () => {\n        const audioFile = await stopRecording();\n        if (audioFile) setPendingFiles(prev => [...prev, audioFile].slice(0,4));\n      }, 30000);'
)

# Clear timeout in stopRecording
content = content.replace(
    'if (animationRef.current) cancelAnimationFrame(animationRef.current);',
    'if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);\n      if (animationRef.current) cancelAnimationFrame(animationRef.current);'
)

# 4. runDiagnosis parameters and form data loop
old_run_sig = "const runDiagnosis = async (file: File, forceComplete: boolean = false) => {"
new_run_sig = "const runDiagnosis = async (forceComplete: boolean = false) => {"
content = content.replace(old_run_sig, new_run_sig)

# We need to replace the single file validation in runDiagnosis with multi-file handling
# Find the start of runDiagnosis
import re
run_diagnosis_regex = re.compile(r'const runDiagnosis = async \(forceComplete: boolean = false\) => \{[\s\S]*?formData\.append\(\'file\', file\);')

new_run_body = """const runDiagnosis = async (forceComplete: boolean = false) => {
    if (pendingFiles.length === 0) {
      const msg = 'Dodaj co najmniej jeden plik (zdjęcie, wideo, audio)!';
      alert(msg);
      setError(msg);
      return;
    }

    // Check duration for the first audio/video file as a basic safeguard
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
    }"""
content = run_diagnosis_regex.sub(new_run_body, content)


# 5. UI replacements: pendingFile -> pendingFiles.length > 0
content = content.replace('!pendingFile', 'pendingFiles.length === 0')
content = content.replace('pendingFile ?', 'pendingFiles.length > 0 ?')
content = content.replace('pendingFile &&', 'pendingFiles.length > 0 &&')
content = content.replace('pendingFile)', 'pendingFiles.length > 0)')
content = content.replace('pendingFile)', 'pendingFiles.length > 0)') # multiple occurrences
content = content.replace('setFirstFile(null);', 'setFirstFile(null);\n          setPendingFiles([]);')

# Fix handleAnalyzeClick calls
content = content.replace('runDiagnosis(pendingFile, false);', 'runDiagnosis(false);')
content = content.replace('runDiagnosis(pendingFile!, false);', 'runDiagnosis(false);')
content = content.replace('if (pendingFile) runDiagnosis(pendingFile, false);', 'if (pendingFiles.length > 0) runDiagnosis(false);')

# Fix UI text for multiple files
content = content.replace('"Plik gotowy — naciśnij aby analizować"', '`Gotowe: ${pendingFiles.length} plik(ów) — nacisnij analizuj`')

# Add 'multiple' to inputs
content = content.replace('ref={fileInputRef}', 'ref={fileInputRef} multiple')
content = content.replace('ref={galleryInputRef}', 'ref={galleryInputRef} multiple')


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Scanner.tsx successfully refactored via Python script.")
