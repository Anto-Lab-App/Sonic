const fs = require('fs');
const files = [
  'src/components/ShazamScanner.tsx',
  'src/components/BikeScanner.tsx',
  'src/app/api/identify/route.ts'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\\\n/g, '\\n');
    fs.writeFileSync(f, text);
    console.log('Fixed', f);
  }
});
