const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replaceAll('pendingFile', 'pendingFiles.length > 0');
// wait, if I do this, it will replace `pendingFiles.length > 0s` again?
// Let's use `txt.split('\n')` and replace only the lines.

let lines = txt.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (i === 275 || i === 276 || i === 278 || i === 314 || i === 376) {
    lines[i] = lines[i].replace(/file\./g, 'mediaFile.');
    lines[i] = lines[i].replace(/file,/g, 'mediaFile,');
  }
  if (i === 432 || i === 645 || i === 660 || i === 748 || i === 758) {
    lines[i] = lines[i].replace(/pendingFile/g, 'pendingFiles.length > 0');
  }
  if (i === 847) {
    lines[i] = lines[i].replace(/runDiagnosis\(pendingFile, false\)/g, 'runDiagnosis(false)');
    lines[i] = lines[i].replace(/runDiagnosis\(pendingFiles.length > 0, false\)/g, 'runDiagnosis(false)');
  }
}

txt = lines.join('\n');

fs.writeFileSync(file, txt);
