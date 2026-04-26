const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// The reason it failed earlier is that JS replace() with strings only replaces the FIRST occurrence!
txt = txt.replaceAll('setPendingFile(null);', 'setPendingFiles([]);');
txt = txt.replaceAll('setPendingFile(audioFile);', 'setPendingFiles(prev => [...prev, audioFile].slice(0, 4));');
txt = txt.replaceAll('setPendingFile(file);', 'setPendingFiles([file]);'); // Just in case
txt = txt.replaceAll('!pendingFile', 'pendingFiles.length === 0');
txt = txt.replaceAll('pendingFile ?', 'pendingFiles.length > 0 ?');
txt = txt.replaceAll('pendingFile &&', 'pendingFiles.length > 0 &&');
txt = txt.replaceAll('pendingFile)', 'pendingFiles.length > 0)');
txt = txt.replaceAll('pendingFile)', 'pendingFiles.length > 0)');

// We also missed some 'file' properties in runDiagnosis because we had an old `file.size`
txt = txt.replace(/if \(!file \|\| file.size === 0\)/g, 'if (pendingFiles.length === 0)');

// And the runDiagnosis call in handlePreScanProceed (wait, we removed that!)
txt = txt.replaceAll('runDiagnosis(pendingFile, false)', 'runDiagnosis(false)');
txt = txt.replaceAll('runDiagnosis(pendingFile)', 'runDiagnosis()');

fs.writeFileSync(file, txt);
