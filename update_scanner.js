const fs = require('fs');

let content = fs.readFileSync('src/components/Scanner.tsx', 'utf-8');

// 1. Update State
content = content.replace(
    `const [pendingFile, setPendingFile] = useState<File | null>(null);`,
    `const [pendingFiles, setPendingFiles] = useState<File[]>([]);\n  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);`
);

content = content.replace(
    `const [firstFile, setFirstFile] = useState<File | null>(null);`,
    `const [firstFiles, setFirstFiles] = useState<File[]>([]);`
);

// 2. handleFileChange Update
content = content.replace(
    `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };`,
    `  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoadingFile(true);
      const incomingFiles = Array.from(e.target.files);
      
      let currentVideos = pendingFiles.filter(f => f.type.startsWith('video/')).length;
      let currentImages = pendingFiles.filter(f => f.type.startsWith('image/')).length;
      let currentAudio = pendingFiles.filter(f => f.type.startsWith('audio/')).length;
      
      const acceptedFiles: File[] = [];
      
      for (const file of incomingFiles) {
        if (file.type.startsWith('video/')) {
          if (currentVideos < 1) {
            acceptedFiles.push(file);
            currentVideos++;
          } else {
            alert("Możesz dodać maksymalnie 1 wideo.");
          }
        } else if (file.type.startsWith('image/')) {
          if (currentImages < 3) {
            acceptedFiles.push(file);
            currentImages++;
          } else {
            alert("Możesz dodać maksymalnie 3 zdjęcia.");
          }
        } else if (file.type.startsWith('audio/')) {
          if (currentAudio < 1 && currentVideos < 1) {
            acceptedFiles.push(file);
            currentAudio++;
          } else {
            alert("Możesz dodać maksymalnie 1 plik audio/wideo.");
          }
        } else {
          // fallback
          acceptedFiles.push(file);
        }
      }
      
      await new Promise(r => setTimeout(r, 400));
      setPendingFiles(prev => [...prev, ...acceptedFiles]);
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };`
);

// 3. toggleRecording & startRecording / stopRecording
content = content.replace(
    `      setIsRecording(true);
      startVisualizerLoop(false);`,
    `      setIsRecording(true);
      startVisualizerLoop(false);

      recordingTimeoutRef.current = setTimeout(() => {
         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            toggleRecording();
         }
      }, 60000);`
);

content = content.replace(
    `      setIsRecording(false);
      setIsDemoMode(false);`,
    `      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      setIsRecording(false);
      setIsDemoMode(false);`
);

// 4. cancelRecording
content = content.replace(
    `  const cancelRecording = () => {
    stopRecording();
    setPendingFile(null);
  };`,
    `  const cancelRecording = () => {
    stopRecording();
    setPendingFiles([]);
  };`
);

// 5. toggleRecording
content = content.replace(
    `  const toggleRecording = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) {
        setPendingFile(audioFile);
      } else {`,
    `  const toggleRecording = async () => {
    if (isRecording) {
      const audioFile = await stopRecording();
      if (audioFile) {
        setPendingFiles(prev => [...prev, audioFile]);
      } else {`
);

// 6. runDiagnosis
content = content.replace(
    `  const runDiagnosis = async (file: File, forceComplete: boolean = false) => {
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
    }`,
    `  const runDiagnosis = async (files: File[], forceComplete: boolean = false) => {
    if (!files || files.length === 0) {
      const msg = 'Najpierw nagraj dźwięk usterki!';
      alert(msg);
      setError(msg);
      return;
    }

    for (const file of files) {
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
        if (duration > 60 && file.type.startsWith('video/')) {
          const msg = 'Wideo nie może być dłuższe niż 60 sekund. Skróć nagranie.';
          alert(msg);
          setError(msg);
          return;
        }
      }
    }`
);

// runDiagnosis appending logic
content = content.replace(
    `    // If we're in follow_up state, append the first file alongside the new one
    if (isFollowUp && firstFile) {
      formData.append("file", firstFile);
    }
    formData.append("file", file);`,
    `    // If we're in follow_up state, append the first file alongside the new one
    if (isFollowUp && firstFiles.length > 0) {
      firstFiles.forEach(f => formData.append("file", f));
    }
    files.forEach(f => formData.append("file", f));`
);

// handleAnalyzeClick and handlePreScanProceed
content = content.replace(
    `  const handleAnalyzeClick = () => {
    if (!pendingFile) return;`,
    `  const handleAnalyzeClick = () => {
    if (pendingFiles.length === 0) return;`
);

content = content.replace(
    `    runDiagnosis(pendingFile, false);
  };`,
    `    runDiagnosis(pendingFiles, false);
  };`
);

content = content.replace(
    `  const handlePreScanProceed = () => {
    localStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingFile) setTimeout(() => runDiagnosis(pendingFile, false), 200);
  };`,
    `  const handlePreScanProceed = () => {
    localStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingFiles.length > 0) setTimeout(() => runDiagnosis(pendingFiles, false), 200);
  };`
);

// Updating dependencies / state references inside UI and runDiagnosis continuation
content = content.replace(
    `        setFirstFile(file);
        setPendingFile(null);`,
    `        setFirstFiles(files);
        setPendingFiles([]);`
);
content = content.replace(
    `        setFirstFile(null);
        setPendingFile(null);`,
    `        setFirstFiles([]);
        setPendingFiles([]);`
);
content = content.replace(
    `          setFirstFile(null);`,
    `          setFirstFiles([]);`
);

// Inputs multiple
content = content.replace(
    `<input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />`,
    `<input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />`
); // no change for capture

content = content.replace(
    `<input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} className="hidden" ref={galleryInputRef} onChange={handleFileChange} />`,
    `<input type="file" accept={mode === 'audio' ? "audio/*,video/*" : "image/*,video/*"} multiple className="hidden" ref={galleryInputRef} onChange={handleFileChange} />`
);

// Fix pendingFile usages in UI
content = content.replace(/!pendingFile/g, 'pendingFiles.length === 0');
content = content.replace(/pendingFile \?/g, 'pendingFiles.length > 0 ?');
content = content.replace(/pendingFile &&/g, 'pendingFiles.length > 0 &&');

// Specific replacements:
// \`✓ Załadowano\` -> \`✓ \${pendingFiles.length} \${pendingFiles.length === 1 ? 'plik' : pendingFiles.length < 5 ? 'pliki' : 'plików'}\`
content = content.replace(
    `pendingFile ? \`✓ Załadowano\``,
    `pendingFiles.length > 0 ? \`✓ \${pendingFiles.length} \${pendingFiles.length === 1 ? 'plik' : pendingFiles.length < 5 ? 'pliki' : 'plików'}\``
);

content = content.replace(
    `if (firstFile) runDiagnosis(firstFile, true);`,
    `if (firstFiles.length > 0) runDiagnosis(firstFiles, true);`
);

content = content.replace(
    `runDiagnosis(pendingFile, false);`,
    `runDiagnosis(pendingFiles, false);`
);

// Fix useEffect for pendingHint
content = content.replace(
    `  useEffect(() => {
    if (!pendingFile) { setPendingHint(0); return; }`,
    `  useEffect(() => {
    if (pendingFiles.length === 0) { setPendingHint(0); return; }`
);

content = content.replace(
    `  }, [pendingFile]);`,
    `  }, [pendingFiles.length]);`
);

content = content.replace(
    `{pendingFile ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20' : 'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5'}`,
    `{pendingFiles.length > 0 ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20' : 'bg-foreground/5 group-hover:bg-foreground/10 border-foreground/5'}`
);

fs.writeFileSync('src/components/Scanner.tsx', content, 'utf-8');
console.log('Done replacing Scanner.tsx');
