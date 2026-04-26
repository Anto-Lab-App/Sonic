const fs = require('fs');
const file = 'src/components/Scanner.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. setPendingFile -> setPendingFiles([])
txt = txt.replace(/setPendingFile\(null\)/g, "setPendingFiles([])");

// 2. pendingFile -> pendingFiles.length > 0
// We must be careful not to match 'pendingFiles'
txt = txt.replace(/\b(!|)pendingFile(?!s)\b/g, (match, p1) => {
  if (p1 === '!') return "pendingFiles.length === 0";
  return "pendingFiles.length > 0";
});

// 3. runDiagnosis signature fix
// If we had runDiagnosis(false), but it expected 0-1 arguments and got 2?
// Wait: `src/components/Scanner.tsx(259,18): error TS2345: Argument of type 'boolean' is not assignable to parameter of type 'File'.`
// Ah! In `runDiagnosis`, I changed the signature to `const runDiagnosis = async (forceComplete: boolean = false)`
// So `runDiagnosis(false)` means forceComplete=false. But wait, if I did `const runDiagnosis = async (forceComplete: boolean = false)` it expects a boolean.
// Why did it say "Argument of type 'boolean' is not assignable to parameter of type 'File'"?
// Let's check `Scanner.tsx` line 259: `runDiagnosis(false);`
// If it says that, it means `runDiagnosis` still has `file: File` in its signature somewhere?!
// Let's force rewrite runDiagnosis signature correctly.
txt = txt.replace(/const runDiagnosis = async \(file: File, forceComplete: boolean = false\) => {/g, 'const runDiagnosis = async (forceComplete: boolean = false) => {');

// 4. TS7006: Parameter 'f' implicitly has an 'any' type.
txt = txt.replace(/for \(const f of pendingFiles\) {/g, 'for (const f of pendingFiles) {'); // This is fine. Wait, line 332: `const formData = new FormData();\n    for (const f of pendingFiles) {` - wait, the error is `(332,48): error TS7006: Parameter 'f' implicitly has an 'any' type.`
txt = txt.replace(/pendingFiles\.find\(f =>/g, 'pendingFiles.find((f: File) =>');


fs.writeFileSync(file, txt);
