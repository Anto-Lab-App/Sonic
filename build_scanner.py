import re
import sys

file_path = 'src/components/Scanner.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # 1. Context Reminder (the previous feature I need to keep)
    if 'import DiagnosisReport from \'./DiagnosisReport\';' in line:
        new_lines.append(line)
        new_lines.append("import ContextModal from './ContextModal';\n")
        continue
    
    if 'const [pendingFile, setPendingFile] = useState<File | null>(null);' in line:
        new_lines.append('  const [pendingFiles, setPendingFiles] = useState<File[]>([]);\n')
        new_lines.append('  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);\n')
        new_lines.append('  const [showContextReminder, setShowContextReminder] = useState(false);\n')
        continue

    # Timeout logic in startRecording
    if 'setIsRecording(true);' in line:
        new_lines.append(line)
        new_lines.append('      recordingTimeoutRef.current = setTimeout(async () => {\n')
        new_lines.append('        const audioFile = await stopRecording();\n')
        new_lines.append('        if (audioFile) setPendingFiles(prev => [...prev, audioFile].slice(0, 4));\n')
        new_lines.append('      }, 30000);\n')
        continue
        
    if 'if (animationRef.current) cancelAnimationFrame(animationRef.current);' in line and i < 200:
        new_lines.append('      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);\n')
        new_lines.append(line)
        continue

    # stopRecording / Cancel
    if 'setPendingFile(null);' in line:
        new_lines.append(line.replace('setPendingFile(null)', 'setPendingFiles([])'))
        continue

    # toggleRecording
    if 'setPendingFile(audioFile);' in line:
        new_lines.append(line.replace('setPendingFile(audioFile)', 'setPendingFiles(prev => [...prev, audioFile].slice(0, 4))'))
        continue

    if 'if (mode === \'visual\') {' in line and i > 230 and i < 250:
        new_lines.append('      const preScanSeen = sessionStorage.getItem(\'hasSeenPreScan\') === \'true\';\n')
        new_lines.append('      if (!preScanSeen) {\n')
        new_lines.append('        setShowPreScan(true);\n')
        new_lines.append('        return;\n')
        new_lines.append('      }\n')
        new_lines.append(line)
        continue

    # handleAnalyzeClick
    if 'if (!pendingFile) return;' in line:
        new_lines.append('    if (pendingFiles.length === 0) return;\n')
        new_lines.append('    if (!diagnosticContext && !vehicleMake && !vehicleDetails) {\n')
        new_lines.append('      setShowContextReminder(true);\n')
        new_lines.append('      return;\n')
        new_lines.append('    }\n')
        continue

    # preScanSeen block inside handleAnalyzeClick (we removed it from there)
    if 'const preScanSeen = localStorage.getItem(\'hasSeenPreScan\') === \'true\';' in line:
        continue
    if 'if (!preScanSeen) {' in line and i < 265:
        # Skip the next 3 lines
        continue
    if 'setShowPreScan(true);' in line and i < 265:
        continue
    if 'return;' in line and lines[i-1].strip() == 'setShowPreScan(true);' and i < 265:
        continue
    if '}' in line and lines[i-2].strip() == 'setShowPreScan(true);' and i < 265:
        continue

    if 'runDiagnosis(pendingFile, false);' in line and i < 270:
        new_lines.append('    runDiagnosis(false);\n')
        continue

    # handlePreScanProceed
    if 'localStorage.setItem(\'hasSeenPreScan\', \'true\');' in line:
        new_lines.append('    sessionStorage.setItem(\'hasSeenPreScan\', \'true\');\n')
        continue
    if 'if (pendingFile) setTimeout(() => runDiagnosis(pendingFile, false), 200);' in line:
        # Just skip, we don't auto-run anymore
        continue

    # runDiagnosis signature
    if 'const runDiagnosis = async (file: File, forceComplete: boolean = false) => {' in line:
        new_lines.append('  const runDiagnosis = async (forceComplete: boolean = false) => {\n')
        continue

    if 'if (!file || file.size === 0) {' in line:
        new_lines.append('    if (pendingFiles.length === 0) {\n')
        continue

    if 'if (file.type.startsWith(\'audio/\') || file.type.startsWith(\'video/\')) {' in line:
        new_lines.append('    const mediaFile = pendingFiles.find((f: File) => f.type.startsWith(\'audio/\') || f.type.startsWith(\'video/\'));\n')
        new_lines.append('    if (mediaFile) {\n')
        continue

    if 'URL.createObjectURL(file)' in line:
        new_lines.append(line.replace('file', 'mediaFile'))
        continue
    if 'media = document.createElement(file.type' in line:
        new_lines.append(line.replace('file.type', 'mediaFile.type'))
        continue

    if 'formData.append("file", file);' in line:
        new_lines.append('    for (const f of pendingFiles) {\n')
        new_lines.append('      formData.append("file", f);\n')
        new_lines.append('    }\n')
        continue

    if 'diagnosticContext.contextFiles.forEach(f => {' in line:
        new_lines.append(line.replace('f => {', '(f: File) => {'))
        continue

    if 'setFirstFile(file);' in line:
        new_lines.append('        if (pendingFiles.length > 0) setFirstFile(pendingFiles[0]);\n')
        continue

    # handleFileChange
    if 'const file = e.target.files[0];' in line:
        new_lines.append('      const newFiles = Array.from(e.target.files);\n')
        continue
    if 'setPendingFile(file);' in line:
        new_lines.append('      setPendingFiles(prev => [...prev, ...newFiles].slice(0, 4));\n')
        continue

    # handleFileChange input multiples
    if 'ref={fileInputRef}' in line and '<input' in line:
        new_lines.append(line.replace('ref={fileInputRef}', 'ref={fileInputRef} multiple'))
        continue
    if 'ref={galleryInputRef}' in line and '<input' in line:
        new_lines.append(line.replace('ref={galleryInputRef}', 'ref={galleryInputRef} multiple'))
        continue

    # UI generic replacements for `pendingFile` -> `pendingFiles.length > 0`
    if 'pendingFile' in line and i > 400:
        # Be VERY careful. Only replace EXACT words.
        l = line
        l = l.replace('!pendingFile', 'pendingFiles.length === 0')
        l = l.replace('pendingFile ?', 'pendingFiles.length > 0 ?')
        l = l.replace('pendingFile &&', 'pendingFiles.length > 0 &&')
        # for `(isRecording || pendingFile) &&`
        l = l.replace('isRecording || pendingFile', 'isRecording || pendingFiles.length > 0')
        
        if '✓ Załadowano' in l:
            l = l.replace('✓ Załadowano', '✓ Załadowano (${pendingFiles.length})')
            
        new_lines.append(l)
        continue
        
    # Context Reminder modal insertion
    if '{/* Follow-up Overlay */}' in line:
        new_lines.append("""
      <AnimatePresence>
        {showContextReminder && (
          <ContextModal
            isOpen={showContextReminder}
            onClose={() => setShowContextReminder(false)}
            onSave={(context) => {
              setDiagnosticContext(context);
              setShowContextReminder(false);
            }}
            initialData={diagnosticContext || {
              mileage: '',
              obdCodes: '',
              condition: '',
              tags: [],
              description: '',
              contextFiles: []
            }}
            customActions={
              <div className="flex flex-col gap-3 mt-8 w-full">
                <button
                  onClick={() => setShowContextReminder(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#00D1FF] hover:bg-[#00b8e6] text-black font-semibold text-sm py-4 px-6 rounded-[20px] transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:shadow-[0_0_30px_rgba(0,209,255,0.5)]"
                >
                  Uzupełnij dane pojazdu
                </button>
                <button
                  onClick={() => { setShowContextReminder(false); if (pendingFiles.length > 0) runDiagnosis(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/[0.05] text-foreground/60 font-semibold text-sm py-4 px-6 rounded-[20px] transition-all"
                >
                  Kontynuuj bez kontekstu
                </button>
              </div>
            }
          />
        )}
      </AnimatePresence>
""")
        new_lines.append(line)
        continue

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Python build script complete.")
