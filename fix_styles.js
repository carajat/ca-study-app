const fs = require('fs');
let c = fs.readFileSync('style.css', 'utf8');

c = c.replace(/\.st-timer-display\.paused \{\s*border-color: var\(--warning\);\s*\}/, '.st-timer-display.paused {\n  border-color: var(--text-muted);\n}');
c = c.replace(/\.st-timer-display\.paused span \{\s*color: var\(--warning\);/, '.st-timer-display.paused span {\n  color: var(--text-muted);');
c = c.replace(/body\[data-theme="light"\]\s+\.st-timer-display\.paused span \{ color: var\(--warning\); \}/, 'body[data-theme="light"]   .st-timer-display.paused span { color: var(--text-muted); }');

fs.writeFileSync('style.css', c);
console.log('Fixed style.css colors');
