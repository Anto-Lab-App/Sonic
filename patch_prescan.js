const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

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
  };`;

// Replace ignoring whitespace
txt = txt.replace(
  /const toggleRecording = async \(\) => \{[\s\S]*?startRecording\(\);\s*\}\s*\}\s*\};/,
  newToggle
);

const newProceed = `  const handlePreScanProceed = () => {
    sessionStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingAction) {
      setTimeout(pendingAction, 200);
      setPendingAction(null);
    }
  };`;

txt = txt.replace(
  /const handlePreScanProceed = \(\) => \{[\s\S]*?setTimeout\(\(\) => runDiagnosis\(pendingFile, false\), 200\);\s*\};/,
  newProceed
);

// We should also change the button text "Rozumiem — analizuj teraz" -> "Zrozumiem — kontynuuj"
txt = txt.replace("Rozumiem — analizuj teraz", "Zrozumiałem — kontynuuj");

fs.writeFileSync(file, txt);
console.log("Scanner.tsx patched with Regex successfully.");
