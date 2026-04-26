const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Add showContextReminder state
txt = txt.replace(
  "const [showPreScan, setShowPreScan] = useState(false);",
  "const [showPreScan, setShowPreScan] = useState(false);\n  const [showContextReminder, setShowContextReminder] = useState(false);"
);

// 2. Update handleAnalyzeClick
const newAnalyze = `  const handleAnalyzeClick = () => {
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

// Find and replace the old handleAnalyzeClick block. We use regex matching the whole function.
txt = txt.replace(
  /const handleAnalyzeClick = \(\) => \{[\s\S]*?runDiagnosis\(pendingFile, false\);\s*\};/,
  newAnalyze
);

// 3. Add the modal before Sticky Error Overlay
const modalHtml = `      {/* Context Reminder Overlay */}
      <AnimatePresence>
        {showContextReminder && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute inset-0 z-[75] flex flex-col overflow-y-auto"
          >
            <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl" />
            <div className="relative z-10 flex flex-col h-full pt-14 px-6 pb-8 justify-center">
              <div className="flex-1 flex flex-col justify-center gap-4 text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-8 h-8 text-[#00D1FF]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Brak kontekstu</h2>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  Wgrałeś plik, ale nie uzupełniłeś danych pojazdu ani kontekstu awarii. AI bez podpowiedzi (marka pojazdu itp.) może wydać mniej precyzyjną diagnozę.
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={() => { setShowContextReminder(false); setIsContextModalOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-[#00D1FF]/10 hover:bg-[#00D1FF]/15 border border-[#00D1FF]/25 text-[#00D1FF] font-bold text-sm py-4 px-6 rounded-[20px] transition-all"
                >
                  Uzupełnij dane pojazdu
                </button>
                <button
                  onClick={() => { setShowContextReminder(false); runDiagnosis(pendingFile, false); }}
                  className="w-full flex items-center justify-center gap-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/[0.05] text-foreground/60 font-semibold text-sm py-4 px-6 rounded-[20px] transition-all"
                >
                  Kontynuuj bez kontekstu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Error Overlay`;

txt = txt.replace("{/* Sticky Error Overlay", modalHtml);

fs.writeFileSync(file, txt);
console.log("Scanner.tsx context reminder added successfully!");
