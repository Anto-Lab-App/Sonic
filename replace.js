const fs = require('fs');

const files = [
  'C:/Users/ziole/antoni-digital-portfolio/sonic/src/components/Scanner.tsx',
  'C:/Users/ziole/antoni-digital-portfolio/sonic/src/components/Chat.tsx',
  'C:/Users/ziole/antoni-digital-portfolio/sonic/src/components/SettingsModal.tsx',
  'C:/Users/ziole/antoni-digital-portfolio/sonic/src/components/BottomNav.tsx',
  'C:/Users/ziole/antoni-digital-portfolio/sonic/src/components/DiagnosisReport.tsx',
  'C:/Users/ziole/antoni-digital-portfolio/sonic/src/components/ContextModal.tsx',
  'C:/Users/ziole/antoni-digital-portfolio/sonic/src/components/InstructionsModal.tsx'
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File missing: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Background replacements
  content = content.replace(/bg-\[#0B121A\]/g, 'bg-background');
  content = content.replace(/bg-\[#06080F\]/g, 'bg-background');
  content = content.replace(/bg-\[#09111e\]/g, 'bg-background');
  content = content.replace(/bg-\[#060B11\]/g, 'bg-background');
  
  content = content.replace(/bg-\[#1A1D2E\]\/80/g, 'bg-surface/80');
  content = content.replace(/bg-\[#1A1D2E\]/g, 'bg-surface');
  content = content.replace(/bg-\[#151B26\]/g, 'bg-surface');
  content = content.replace(/bg-\[#141d2c\]/g, 'bg-surface');
  content = content.replace(/bg-\[#131A24\]/g, 'bg-surface');
  content = content.replace(/bg-\[#0D131F\]/g, 'bg-surface-elevated');
  content = content.replace(/bg-\[#0D131B\]/g, 'bg-surface-elevated');
  
  content = content.replace(/bg-\[#24283B\]/g, 'bg-surface-hover');
  content = content.replace(/bg-\[#232C3B\]/g, 'bg-surface-hover');
  content = content.replace(/bg-\[#1A2130\]/g, 'bg-surface-hover');
  content = content.replace(/bg-\[#1A2330\]/g, 'bg-surface-hover');
  
  content = content.replace(/bg-\[#0A0D14\]/g, 'bg-surface-elevated');
  content = content.replace(/bg-\[#080C16\]/g, 'bg-surface-elevated');

  // Borders
  content = content.replace(/border-\[#232C3B\]/g, 'border-border-subtle');
  content = content.replace(/border-\[#1E2734\]/g, 'border-border-subtle');
  content = content.replace(/border-\[#222B38\]/g, 'border-border-subtle');
  content = content.replace(/border-\[#334155\]/g, 'border-border-subtle');

  // Text
  content = content.replace(/text-\[#00D1FF\]/g, 'text-primary');
  content = content.replace(/text-\[#0A84FF\]/g, 'text-primary');
  content = content.replace(/text-\[#3B82F6\]/g, 'text-primary');
  content = content.replace(/text-blue-500/g, 'text-primary');
  content = content.replace(/text-blue-400/g, 'text-primary');
  
  content = content.replace(/text-\[#8A94A6\]/g, 'text-muted');
  content = content.replace(/text-\[#5C6B82\]/g, 'text-muted');
  content = content.replace(/text-\[#8A9BB3\]/g, 'text-muted');
  content = content.replace(/text-\[#64748B\]/g, 'text-muted');
  content = content.replace(/text-\[#475569\]/g, 'text-muted');
  
  content = content.replace(/text-slate-200/g, 'text-foreground');
  content = content.replace(/text-slate-300/g, 'text-foreground/90');
  content = content.replace(/text-slate-400/g, 'text-muted');
  content = content.replace(/text-slate-500/g, 'text-muted/80');

  // Modifiers
  content = content.replace(/bg-blue-500/g, 'bg-primary');
  content = content.replace(/border-blue-500/g, 'border-primary');
  
  content = content.replace(/text-white/g, 'text-foreground');
  content = content.replace(/bg-white/g, 'bg-foreground');
  content = content.replace(/border-white/g, 'border-foreground');
  content = content.replace(/ring-white/g, 'ring-foreground');

  fs.writeFileSync(filePath, content, 'utf8');
}

files.forEach(processFile);
console.log('DONE REPLACING');
process.exit(0);
