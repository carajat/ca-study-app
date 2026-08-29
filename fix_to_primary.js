const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');
let style = fs.readFileSync('style.css', 'utf8');

// app.js replacements
app = app.replace(/isPaused \? 'var\(--text-muted, #888888\)' :/g, "isPaused ? 'var(--primary, #C9A15B)' :");
app = app.replace(/isTrkPaused \? 'var\(--text-muted, #888888\)' :/g, "isTrkPaused ? 'var(--primary, #C9A15B)' :");

// SVGs
app = app.replace(/const _svgPartial = `([^`]*)var\(--text-muted\)([^`]*)var\(--text-muted\)([^`]*)var\(--text-muted\)([^`]*)`;/, "const _svgPartial = `$1var(--primary)$2var(--primary)$3var(--primary)$4`;");
app = app.replace(/const _svgWarn = `([^`]*)var\(--text-muted\)([^`]*)var\(--text-muted\)([^`]*)var\(--text-muted\)([^`]*)`;/, "const _svgWarn = `$1var(--primary)$2var(--primary)$3var(--primary)$4`;");
app = app.replace(/const _svgWarnSm = `([^`]*)var\(--text-muted\)([^`]*)var\(--text-muted\)([^`]*)var\(--text-muted\)([^`]*)`;/, "const _svgWarnSm = `$1var(--primary)$2var(--primary)$3var(--primary)$4`;");

// Pending Status
app = app.replace(/if \(st === 'pending'\) return `<div class="cons-slot-status cons-status-upcoming" style="color:var\(--text-muted\);"><span/g, "if (st === 'pending') return `<div class=\"cons-slot-status cons-status-upcoming\" style=\"color:var(--primary);\"><span");

// Progress bar < 80
app = app.replace(/else if \(pct > 0\) \{ bg = 'var\(--text-muted\)'; border = '1px solid var\(--text-muted\)'; color = '#ffffff'; \}/g, "else if (pct > 0) { bg = 'var(--primary)'; border = '1px solid var(--primary)'; color = '#ffffff'; }");

fs.writeFileSync('app.js', app);

// style.css replacements
style = style.replace(/\.st-timer-display\.paused \{\n  border-color: var\(--text-muted\);\n\}/, '.st-timer-display.paused {\n  border-color: var(--primary);\n}');
style = style.replace(/\.st-timer-display\.paused span \{\n  color: var\(--text-muted\);/, '.st-timer-display.paused span {\n  color: var(--primary);');
style = style.replace(/body\[data-theme="light"\]   \.st-timer-display\.paused span \{ color: var\(--text-muted\); \}/g, 'body[data-theme="light"]   .st-timer-display.paused span { color: var(--primary); }');

style = style.replace(/\.cons-status-partial \{ color: var\(--text-muted\); \}/g, '.cons-status-partial { color: var(--primary); }'); 
style = style.replace(/\.cons-status-missed  \{ color: var\(--text-muted\); opacity: 0\.7; \}/g, '.cons-status-missed  { color: var(--primary); opacity: 0.7; }');

fs.writeFileSync('style.css', style);
console.log('Fixed to primary color');
