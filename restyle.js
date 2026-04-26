const fs = require('fs');
const file = 'src/components/BikeScanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace gradient background
txt = txt.replace(
  /bg-\[radial-gradient\(circle_at_50%_0%,#2D1F16_0%,#06080F_100%\)\]/g, 
  "bg-[radial-gradient(circle_at_50%_0%,var(--color-surface)_0%,transparent_100%)] opacity-40"
);

// Downgrade excessive glowing drop shadows
txt = txt.replace(/shadow-\[0_0_40px_rgba\(249,115,22,0\.6\)\]/g, "shadow-xl shadow-emerald-500/20");
txt = txt.replace(/shadow-\[0_0_50px_rgba\(249,115,22,0\.3\)\]/g, "shadow-2xl shadow-emerald-500/10");
txt = txt.replace(/drop-shadow-\[0_0_10px_rgba\(249,115,22,1\)\]/g, "drop-shadow-md");

// Replace orange colors with emerald (a cooler, more premium tech color)
txt = txt.replace(/orange-500/g, "emerald-500");
txt = txt.replace(/orange-400/g, "emerald-400");
txt = txt.replace(/text-orange-400\/70/g, "text-emerald-400/70");
txt = txt.replace(/bg-orange-500\/10/g, "bg-emerald-500/10");
txt = txt.replace(/bg-orange-500\/20/g, "bg-emerald-500/20");
txt = txt.replace(/border-orange-500\/40/g, "border-emerald-500/40");
txt = txt.replace(/border-orange-500\/20/g, "border-emerald-500/20");
txt = txt.replace(/border-orange-500\/25/g, "border-emerald-500/25");
txt = txt.replace(/bg-orange-500\/5/g, "bg-emerald-500/5");

fs.writeFileSync(file, txt);
console.log("Restyled BikeScanner.tsx");
