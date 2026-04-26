const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// The ultimate regex to clean up my accidental infinite replacement
txt = txt.replace(/pendingFiles\.length > 0(?:s\.length > 0)+/g, 'pendingFiles.length > 0');

fs.writeFileSync(file, txt);
