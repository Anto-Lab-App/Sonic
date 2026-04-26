const fs = require('fs');
const file = 'src/components/BikeScanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Change default mode
txt = txt.replace(
  "const [mode, setMode] = useState<'audio' | 'visual'>('audio');",
  "const [mode, setMode] = useState<'audio' | 'visual'>('visual');"
);

// 2. Change text
txt = txt.replace(
  "{isRecording ? t.auto.audioListening : t.auto.audioTap}",
  "{isRecording ? t.auto.audioListening : 'Skan Wizualny'}"
);
txt = txt.replace(
  "{t.auto.audioSubReq}",
  "{isRecording ? t.auto.audioSubReq : 'Zrób zdjęcie ewidentnych uszkodzeń'}"
);

// 3. Swap the Big Button and the Small Floater Button logic
const bigButtonRegex = /onClick=\{async \(\) => \{ if \(isRecording\) \{ const f = await stopRecording\(\); if \(f\) setPendingFile\(f\); \} else \{ startRecording\(\); \} \}\}/g;
txt = txt.replace(
  bigButtonRegex,
  "onClick={async () => { if (isRecording) { const f = await stopRecording(); if (f) setPendingFile(f); } else { setMode('visual'); fileInputRef.current?.click(); } }}"
);

const bigButtonIconRegex = /<Mic className=\{`w-10 h-10 text-white transition-transform \$\{isRecording \? 'scale-110' : ''\}`\} \/>/g;
txt = txt.replace(
  bigButtonIconRegex,
  "{isRecording ? <Mic className=\"w-10 h-10 text-white animate-pulse\" /> : <Camera className=\"w-10 h-10 text-white\" />}"
);

const smallButtonRegex = /onClick=\{\(\) => \{ setMode\('visual'\); fileInputRef\.current\?\.click\(\); \}\}/g;
txt = txt.replace(
  smallButtonRegex,
  "onClick={() => { setMode('audio'); startRecording(); }}"
);

const smallButtonIconRegex = /<Camera className=\"w-6 h-6 text-emerald-400\" \/>/g;
txt = txt.replace(
  smallButtonIconRegex,
  '<Mic className="w-6 h-6 text-emerald-400" />'
);

fs.writeFileSync(file, txt);
console.log("Bike UI priority fixed");
