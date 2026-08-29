const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /\$\{isActive && !isEditMode \? '<div class="active-indicator"><span class="material-symbols-rounded icon-sm">circle<\/span> NOW<\/div>' : ''\}\s*<div class="slot-header" style="flex:1; display:flex; justify-content:space-between; align-items:center;">\s*<div>\s*<span class="material-symbols-rounded slot-icon">\$\{\(slot\.icon \|\| ""\)\.trim\(\)\}<\/span>\s*\$\{!isEditMode \? `<span class="slot-label">\$\{slot\.label\}<\/span>` : `<input type="text" class="inline-input" value="\$\{slot\.label\}" onchange="updateScheduleSlot\('\$\{state\.activeSchedule\}', \$\{idx\}, 'label', this\.value\)">`\}\s*<\/div>/;

const replacement = `<div class="slot-header" style="flex:1; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center;">
            <span class="material-symbols-rounded slot-icon">\${(slot.icon || "").trim()}</span>
            \${!isEditMode ? \`<span class="slot-label">\${slot.label}</span>\` : \`<input type="text" class="inline-input" value="\${slot.label}" onchange="updateScheduleSlot('\${state.activeSchedule}', \${idx}, 'label', this.value)">\`}
            \${isActive && !isEditMode ? \`<span class="active-indicator" style="position:static; display:inline-flex; align-items:center; gap:3px; margin-left:10px; background:var(--red-light, rgba(239, 68, 68, 0.15)); padding:2px 6px; border-radius:10px;"><span class="material-symbols-rounded icon-sm" style="font-size:10px;">circle</span> \${String(now.getHours()).padStart(2,'0')}:\${String(now.getMinutes()).padStart(2,'0')}</span>\` : ''}
          </div>`;

if (regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('app.js', c);
  console.log('Replaced successfully');
} else {
  console.log('Target not found');
}
