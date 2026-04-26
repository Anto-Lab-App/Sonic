const fs = require('fs');

const bikeFile = 'src/components/BikeScanner.tsx';
let txt = fs.readFileSync(bikeFile, 'utf8');

txt = txt.replace("import type { Diagnosis, DiagnosticContextData } from '@/types/diagnosis';", "import type { Diagnosis } from '@/types/diagnosis';");
txt = txt.replace("import { ContextModal } from './ContextModal';", "import { ContextModal, type DiagnosticContextData } from './ContextModal';");

txt = txt.replace('t.bike.selectTarget', '"Wybierz element"');
txt = txt.replace('t.bike.audioListening', 't.auto.audioListening');
txt = txt.replace('t.bike.audioTap', 't.auto.audioTap');
txt = txt.replace('t.bike.audioSubReq', 't.auto.audioSubReq');
txt = txt.replace('t.bike.uploadAudio', 't.auto.uploadAudio');
txt = txt.replace('t.bike.uploadFiles', 't.auto.uploadFiles');
txt = txt.replace('t.bike.uploadContext', 't.auto.uploadContext'); // Wait, t.auto has uploadContext
txt = txt.replace('contextFiles.forEach(f =>', 'contextFiles.forEach((f: File) =>');

fs.writeFileSync(bikeFile, txt);

const autoFile = 'src/components/Scanner.tsx';
let txt2 = fs.readFileSync(autoFile, 'utf8');
txt2 = txt2.replace("import type { Diagnosis, DiagnosticContextData } from '@/types/diagnosis';", "import type { Diagnosis } from '@/types/diagnosis';");
txt2 = txt2.replace("import { ContextModal } from './ContextModal';", "import { ContextModal, type DiagnosticContextData } from './ContextModal';");
txt2 = txt2.replace('t.auto.status.audio', 't.auto.status.init');
txt2 = txt2.replace('t.auto.status.engine', 't.auto.status.iso');
txt2 = txt2.replace('t.auto.status.db', 't.auto.status.search');
txt2 = txt2.replace('t.auto.status.error', '"Błąd analizy"');
txt2 = txt2.replace('contextFiles.forEach(f =>', 'contextFiles.forEach((f: File) =>');

fs.writeFileSync(autoFile, txt2);

console.log("Types fixed");
