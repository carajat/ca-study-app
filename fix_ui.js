const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /\$\{hasSmartBadge \? \(\(\) => \{\s*const isThisStudy = slot\.type === 'study';\s*const bg = isTrk \? 'var\(--success-light, rgba\(16, 185, 129, 0\.15\)\)' : \(isThisStudy \? 'var\(--red-light, rgba\(239, 68, 68, 0\.15\)\)' : 'var\(--bg-tertiary, #333333\)'\);\s*const col = isTrk \? 'var\(--success, #10B981\)' : \(isThisStudy \? 'var\(--red, #EF4444\)' : 'var\(--text-muted, #888888\)'\);\s*const txt = isTrk \? 'Studying' : \(isThisStudy \? 'Not Studying' : 'Break Time'\);\s*const icn = isTrk \? 'timer' : \(isThisStudy \? 'timer_off' : 'free_breakfast'\);\s*return `<span class="active-indicator realtime-time-badge" style="position:static; display:inline-flex; align-items:center; gap:4px; margin-left:10px; background:\$\{bg\}; color:\$\{col\}; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:13px; color:\$\{col\};">\$\{icn\}<\/span> \$\{txt\} • \$\{String\(now\.getHours\(\)\)\.padStart\(2,'0'\)\}:\$\{String\(now\.getMinutes\(\)\)\.padStart\(2,'0'\)\}<\/span>`;\s*\}\)\(\) : ''\}/;

const rep = ``; // Remove badge from the header's left side

c = c.replace(regex, rep);

const regex2 = /<\/div>\s*<div class="slot-details" style="\$\{isEditMode \? 'display:flex; flex-direction:column; gap:4px; margin-right:10px;' : ''\}">/;

const rep2 = `</div>
        \${hasSmartBadge ? (() => {
              const isThisStudy = slot.type === 'study';
              const isPaused = isTrk && typeof trackerState !== 'undefined' && trackerState.isPaused;
              const bg = isTrk ? (isPaused ? 'var(--warning-light, rgba(245, 158, 11, 0.15))' : 'var(--success-light, rgba(16, 185, 129, 0.15))') : (isThisStudy ? 'var(--red-light, rgba(239, 68, 68, 0.15))' : 'var(--bg-tertiary, #333333)');
              const col = isTrk ? (isPaused ? 'var(--warning, #F59E0B)' : 'var(--success, #10B981)') : (isThisStudy ? 'var(--red, #EF4444)' : 'var(--text-muted, #888888)');
              const txt = isTrk ? (isPaused ? 'Paused' : 'Studying') : (isThisStudy ? 'Not Studying' : 'Break Time');
              const icn = isTrk ? (isPaused ? 'pause_circle' : 'timer') : (isThisStudy ? 'timer_off' : 'free_breakfast');
              return \`<div style="margin-top:8px; margin-bottom:2px;"><span class="active-indicator realtime-time-badge" style="display:inline-flex; align-items:center; gap:4px; background:\${bg}; color:\${col}; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:14px; color:\${col};">\${icn}</span> \${txt} • \${String(now.getHours()).padStart(2,'0')}:\${String(now.getMinutes()).padStart(2,'0')}</span></div>\`;
            })() : ''}
        <div class="slot-details" style="\${isEditMode ? 'display:flex; flex-direction:column; gap:4px; margin-right:10px;' : ''}">`;

c = c.replace(regex2, rep2);

fs.writeFileSync('app.js', c);
console.log('Success UI');
