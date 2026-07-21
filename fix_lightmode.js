const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// 1. Fix cd-value color
css = css.replace(/\.cd-value \{\s*font-size: 36px;\s*font-weight: 900;\s*color: #fff;/g, '.cd-value {\n  font-size: 36px;\n  font-weight: 900;\n  color: var(--text-primary);');

// 2. Fix day-exam text color
css = css.replace(/\.cal-day\.day-exam \{\s*border: 2px solid var\(--red\);\s*color: #fff;/g, '.cal-day.day-exam {\n  border: 2px solid var(--red);\n  color: var(--red);');

// 3. Fix input backgrounds and borders
css = css.replace(/background: rgba\(255,255,255,0\.04\);\s*border: 1px solid var\(--border-color\);/g, 'background: var(--input-bg);\n  border: 1px solid var(--input-border);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.05\);\s*border: 1px solid rgba\(255, 255, 255, 0\.1\);/g, 'background: var(--input-bg);\n  border: 1px solid var(--input-border);');
css = css.replace(/background: rgba\(255, 255, 255, 0\.1\);/g, 'background: var(--input-bg-focus);');

// 4. Inject theme variables for inputs
const lightThemeVars = `--border-color: rgba(0,0,0,0.1);
    --input-bg: rgba(0,0,0,0.05);
    --input-bg-focus: rgba(0,0,0,0.08);
    --input-border: rgba(0,0,0,0.1);`;

const darkThemeVars = `--border-color: rgba(255,255,255,0.15);
  --input-bg: rgba(255,255,255,0.05);
  --input-bg-focus: rgba(255,255,255,0.1);
  --input-border: rgba(255,255,255,0.1);`;

css = css.replace(/--border-color: rgba\(0,0,0,0\.1\);/g, lightThemeVars);
css = css.replace(/--border-color: rgba\(255,255,255,0\.15\);/g, darkThemeVars);

// Fallback in :root (which matches dark right now)
// Wait, I did a global replace for `--border-color: rgba(255,255,255,0.15);` which exists in :root and [data-theme="dark"].
// So it will automatically add it to both. Perfect.

fs.writeFileSync('style.css', css);

// Bump SW version to v35
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v34/g, 'ca-tracker-v35');
fs.writeFileSync('sw.js', sw);

console.log("Light mode UI fixes applied.");
