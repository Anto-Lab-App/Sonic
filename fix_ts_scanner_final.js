const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Fix 'file' -> 'mediaFile' inside the duration check block of runDiagnosis
const oldMediaBlock = `    if (mediaFile) {
      const url = URL.createObjectURL(file);
      const duration = await new Promise<number>((resolve) => {
        const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
        media.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(media.duration);
        };
        media.onerror = () => {
           URL.revokeObjectURL(url);
           resolve(999);
        };
        setTimeout(() => {
           URL.revokeObjectURL(url);
           resolve(999);
        }, 1500);
        media.src = url;
      });

      if (duration > 0 && duration < 1) {
        const msg = 'Nagranie musi trwać co najmniej 1 sekundę!';
        alert(msg);
        setError(msg);
        return;
      }
    }`;

const newMediaBlock = `    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      const duration = await new Promise<number>((resolve) => {
        const media = document.createElement(mediaFile.type.startsWith('video/') ? 'video' : 'audio');
        media.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(media.duration);
        };
        media.onerror = () => {
           URL.revokeObjectURL(url);
           resolve(999);
        };
        setTimeout(() => {
           URL.revokeObjectURL(url);
           resolve(999);
        }, 1500);
        media.src = url;
      });

      if (duration > 0 && duration < 1) {
        const msg = 'Nagranie musi trwać co najmniej 1 sekundę!';
        alert(msg);
        setError(msg);
        return;
      }
    }`;

txt = txt.replace(oldMediaBlock, newMediaBlock);

// Fix remaining occurrences of pendingFile
txt = txt.replace(/pendingFile\s*\?/g, "pendingFiles.length > 0 ?");
txt = txt.replace(/pendingFile\)/g, "pendingFiles.length > 0)");
txt = txt.replace(/!pendingFile/g, "pendingFiles.length === 0");

// Fix runDiagnosis(pendingFile, false) and runDiagnosis(pendingFiles.length > 0, false) etc.
txt = txt.replace(/runDiagnosis\([\s\S]*?, false\)/g, "runDiagnosis(false)");
// And just in case:
txt = txt.replace(/runDiagnosis\(pendingFile\)/g, "runDiagnosis()");

// Let's do a broader regex for `pendingFile` if it's used as a boolean check
txt = txt.replace(/&& pendingFile/g, "&& pendingFiles.length > 0");
txt = txt.replace(/pendingFile &&/g, "pendingFiles.length > 0 &&");
txt = txt.replace(/\|\| pendingFile/g, "|| pendingFiles.length > 0");
txt = txt.replace(/pendingFile \|\|/g, "pendingFiles.length > 0 ||");

// Sometimes there's `if (pendingFile) ...`
txt = txt.replace(/if \(pendingFile\)/g, "if (pendingFiles.length > 0)");

fs.writeFileSync(file, txt);
console.log("Final TS fixes applied to Scanner.tsx");
