const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /if \(cSlot\) \{\s*currentActivityStr = `<div style="font-size:11px; margin-top:4px; color:var\(--text-secondary\); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var\(--primary\);">\$\{\(cSlot\.icon \|\| 'schedule'\)\.trim\(\)\}<\/span> <span>Current: <b style="color:var\(--text-primary\);">\$\{cSlot\.label\}<\/b><\/span><\/div>`;\s*\} else \{\s*currentActivityStr = `<div style="font-size:11px; margin-top:4px; color:var\(--text-secondary\); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var\(--text-muted\);">bed<\/span> <span>Current: <b style="color:var\(--text-muted\);">Rest Time<\/b><\/span><\/div>`;\s*\}/g;

const replacement = `if (cSlot) {
          currentActivityStr = \`<div style="font-size:11px; margin-top:4px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var(--primary);">\${(cSlot.icon || 'schedule').trim()}</span> <span style="flex:1;">Current: <b style="color:var(--text-primary);">\${cSlot.label}</b></span> <span style="font-weight:700; color:var(--primary-color);">\${timeStr}</span></div>\`;
        } else {
          currentActivityStr = \`<div style="font-size:11px; margin-top:4px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var(--text-muted);">bed</span> <span style="flex:1;">Current: <b style="color:var(--text-muted);">Rest Time</b></span> <span style="font-weight:700; color:var(--text-muted);">\${timeStr}</span></div>\`;
        }`;

if (regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('app.js', c);
  console.log('Replaced adherence current activity successfully');
} else {
  console.log('Target not found for adherence');
}
