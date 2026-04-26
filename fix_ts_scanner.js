const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Fix PENDING_HINTS definition issue (can't use pendingFiles before it's declared)
txt = txt.replace(
  "`Gotowe: ${pendingFiles.length} plik(ów) — nacisnij analizuj`",
  '"Pliki gotowe — naciśnij aby analizować"'
);

// Fix remaining pendingFile references
txt = txt.replace(/\bpendingFile\b/g, "pendingFiles.length > 0");

// However, we just blindly replaced 'pendingFile' with 'pendingFiles.length > 0'.
// We need to undo this for the places where 'pendingFiles.length > 0' was already correctly formed, 
// because now it might say 'pendingFiles.length > 0s.length > 0'.
txt = txt.replace(/pendingFiles\.length > 0s/g, "pendingFiles");
txt = txt.replace(/pendingFiles\.length > 0 \?/g, "pendingFiles.length > 0 ?");

// Actually, wait, replacing blindly is risky. Let's do it carefully.
// Let's reload from disk to undo my risky replace above!
txt = fs.readFileSync(file, 'utf8');

// Fix PENDING_HINTS
txt = txt.replace(
  "`Gotowe: ${pendingFiles.length} plik(ów) — nacisnij analizuj`",
  '"Pliki gotowe — naciśnij aby analizować"'
);

// We had errors at lines 450, 663, 678, 766
// Let's manually replace the known patterns.
txt = txt.replace("isRecording || pendingFile", "isRecording || pendingFiles.length > 0");
txt = txt.replace("pendingFile ?", "pendingFiles.length > 0 ?");
txt = txt.replace("pendingFile) {", "pendingFiles.length > 0) {");
txt = txt.replace("!pendingFile &&", "pendingFiles.length === 0 &&");
txt = txt.replace("pendingFile &&", "pendingFiles.length > 0 &&");

// In toggleRecording we had:
// onClick={pendingFile ? handleAnalyzeClick : toggleRecording}
txt = txt.replace(
  "onClick={pendingFile ? handleAnalyzeClick : toggleRecording}",
  "onClick={pendingFiles.length > 0 ? handleAnalyzeClick : toggleRecording}"
);

// In the Center Button animate prop:
// isRecording || pendingFile
txt = txt.replace(
  "isRecording || pendingFile\n                  ?",
  "isRecording || pendingFiles.length > 0\n                  ?"
);
txt = txt.replace(
  "isRecording || pendingFile\n                   ?",
  "isRecording || pendingFiles.length > 0\n                   ?"
);

// In the Cancel button AnimatePresence:
// (isRecording || pendingFile) && !isAnalyzing
txt = txt.replace(
  "(isRecording || pendingFile) && !isAnalyzing",
  "(isRecording || pendingFiles.length > 0) && !isAnalyzing"
);


fs.writeFileSync(file, txt);
console.log("TS fixes applied to Scanner.tsx");
