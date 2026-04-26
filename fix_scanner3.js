const fs = require('fs');
let content = fs.readFileSync('src/components/Scanner.tsx', 'utf-8');

// Revert the bad regex replacements
content = content.replace(/pendingFiles\.length > 0s\.length > 0s\.length > 0/g, 'pendingFiles.length > 0');
content = content.replace(/pendingFiles\.length > 0s\.length > 0/g, 'pendingFiles.length > 0');
content = content.replace(/pendingFiles\.length > 0s/g, 'pendingFiles');

fs.writeFileSync('src/components/Scanner.tsx', content, 'utf-8');
console.log('Fixed broken variables');
