const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Add pendingAction state
txt = txt.replace(
  "const [pendingFile, setPendingFile] = useState<File | null>(null);",
  "const [pendingFile, setPendingFile] = useState<File | null>(null);\n  const [pendingAction, setPendingAction] = useState<(()=>void) | null>(null);"
);

// 2. Change toggleRecording to intercept startRecording
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
      const preScanSeen = localStorage.getItem('hasSeenPreScan') === 'true';
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

txt = txt.replace(oldToggle, newToggle);

// 3. Change handleAnalyzeClick to NOT intercept
const oldAnalyze = `  const handleAnalyzeClick = () => {
    if (!pendingFile) return;

    const preScanSeen = localStorage.getItem('hasSeenPreScan') === 'true';
    if (!preScanSeen) {
      setShowPreScan(true);
      return;
    }

    runDiagnosis(pendingFile, false);
  };`;

const newAnalyze = `  const handleAnalyzeClick = () => {
    if (!pendingFile) return;
    runDiagnosis(pendingFile, false);
  };`;
  
txt = txt.replace(oldAnalyze, newAnalyze);

// 4. Change handlePreScanProceed to execute pendingAction
const oldProceed = `  const handlePreScanProceed = () => {
    localStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingFile) setTimeout(() => runDiagnosis(pendingFile, false), 200);
  };`;

const newProceed = `  const handlePreScanProceed = () => {
    localStorage.setItem('hasSeenPreScan', 'true');
    setShowPreScan(false);
    if (pendingAction) {
      setTimeout(pendingAction, 200);
      setPendingAction(null);
    }
  };`;
  
txt = txt.replace(oldProceed, newProceed);

// 5. Change the button text in the Pre-Scan overlay to apply globally
txt = txt.replace("Rozumiem — analizuj teraz", "Zrozumiałem — kontynuuj");

// 6. Fix CSS issues in the modal - add overflow-y-auto so we can scroll on small phones
txt = txt.replace(
  'className="absolute inset-0 z-[70] flex flex-col"',
  'className="absolute inset-0 z-[70] flex flex-col overflow-y-auto"'
);


fs.writeFileSync(file, txt);
console.log("Scanner.tsx pre-scan logic updated successfully!");
