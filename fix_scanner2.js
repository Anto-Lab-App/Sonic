const fs = require('fs');
let content = fs.readFileSync('src/components/Scanner.tsx', 'utf-8');

// Fix remaining issues
content = content.replace(
    `import type { Diagnosis, DiagnosticContextData } from '@/types/diagnosis';`,
    `import type { Diagnosis } from '@/types/diagnosis';\n\nexport interface DiagnosticContextData {\n  mileage: string;\n  obdCodes: string;\n  condition: string;\n  tags: string[];\n  description: string;\n  contextFiles?: File[];\n}`
);

content = content.replace(
    `setPendingFile(null); // clear so follow-up overlay shows`,
    `setPendingFiles([]); // clear so follow-up overlay shows`
);

content = content.replace(
    `        setFirstFile(file);`,
    `        setFirstFiles(files);`
);

content = content.replace(
    `        setFirstFile(null);`,
    `        setFirstFiles([]);`
);

content = content.replace(
    `        setPendingFile(null);`,
    `        setPendingFiles([]);`
);

content = content.replace(
    `if (isFollowUp && firstFile) {`,
    `if (isFollowUp && firstFiles.length > 0) {`
);

content = content.replace(
    `formData.append("file", firstFile);`,
    `firstFiles.forEach(f => formData.append("file", f));`
);

content = content.replace(
    `if (pendingFile) setTimeout(() => runDiagnosis(pendingFile, false), 200);`,
    `if (pendingFiles.length > 0) setTimeout(() => runDiagnosis(pendingFiles, false), 200);`
);

content = content.replace(
    `{(isRecording || pendingFile) && !isAnalyzing && (`,
    `{(isRecording || pendingFiles.length > 0) && !isAnalyzing && (`
);

content = content.replace(
    `isRecording || pendingFile`,
    `isRecording || pendingFiles.length > 0`
);
content = content.replace(
    `isRecording || pendingFile`,
    `isRecording || pendingFiles.length > 0`
);

content = content.replace(
    `pendingFile`,
    `pendingFiles.length > 0`
);

// We'll replace all isolated `pendingFile` occurrences:
content = content.replace(/\bpendingFile\b/g, 'pendingFiles.length > 0');

fs.writeFileSync('src/components/Scanner.tsx', content, 'utf-8');
console.log('Done fix 2');