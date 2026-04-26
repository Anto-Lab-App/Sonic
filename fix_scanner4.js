const fs = require('fs');
let content = fs.readFileSync('src/components/Scanner.tsx', 'utf-8');

// 1. Fix DiagnosticContextData import
content = content.replace(
    `import type { Diagnosis } from '@/types/diagnosis';\n\nexport interface DiagnosticContextData {\n  mileage: string;\n  obdCodes: string;\n  condition: string;\n  tags: string[];\n  description: string;\n  contextFiles?: File[];\n}`,
    `import type { Diagnosis } from '@/types/diagnosis';\nimport type { DiagnosticContextData } from './ContextModal';`
);

// 2. Fix pendingFile -> pendingFiles
content = content.replace(`setPendingFile(null); // clear so follow-up overlay shows`, `setPendingFiles([]);`);
content = content.replace(/setPendingFile\([^)]*\);/g, `setPendingFiles([]);`);
content = content.replace(/setFirstFile\([^)]*\);/g, `setFirstFiles([]);`);
content = content.replace(/firstFile\)/g, `firstFiles.length > 0)`);
content = content.replace(/firstFile\b/g, `firstFiles`);

// Restore setFirstFiles(files) and setPendingFiles(prev => [...prev, audioFile])
content = content.replace(`setPendingFiles([]); // clear so follow-up overlay shows (condition: pendingFiles.length === 0)`, `setPendingFiles([]);`);
content = content.replace(`setPendingFiles([]);`, `setPendingFiles([]);`);

// Wait, the previous replacement replaced everything with `setPendingFiles([])`. That's bad for `setPendingFiles(prev => [...prev, audioFile])` and `setFirstFiles(files)`. Let's do it carefully with explicit search strings.


