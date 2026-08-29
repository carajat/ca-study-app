const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

// 1. Add refreshLiveUI and setInterval at the top (or bottom)
if (!c.includes('refreshLiveUI()')) {
  c += `\n// Auto-refresh UI for live time updates\nfunction refreshLiveUI() {
  if (typeof isEditMode !== 'undefined' && isEditMode) return;
  if (state.activeTab === 'schedule' && typeof renderSchedule === 'function') renderSchedule();
  if (state.activeTab === 'home' && typeof updateConsistencyWidget === 'function') updateConsistencyWidget();
}\nsetInterval(refreshLiveUI, 30000);\n`;
}

// 2. Call refreshLiveUI in tracker functions
c = c.replace(/updateTrackerUI\('running'\);/g, "updateTrackerUI('running'); refreshLiveUI();");
c = c.replace(/updateTrackerUI\('paused'\);/g, "updateTrackerUI('paused'); refreshLiveUI();");
c = c.replace(/updateTrackerUI\('stopped'\);/g, "updateTrackerUI('stopped'); refreshLiveUI();");

// 3. Update computeDayAdherence to support 'current'
const adherenceRegex = /if \(pct >= 0\.8\) status = 'done';\s*else if \(pct > 0\) status = 'partial';\s*else if \(dateStr === todayStr && typeof trackerState !== 'undefined' && \(trackerState\.isRunning \|\| trackerState\.isPaused\) && nowMin >= rangeStart && nowMin < \(rangeStart \+ \(slot\.duration \|\| 60\)\)\) status = 'studying';\s*else if \(dateStr === todayStr && nowMin < rangeStart\) status = 'upcoming';\s*else status = 'missed';/;

const adherenceRep = `const isCurrentSlot = dateStr === todayStr && nowMin >= rangeStart && nowMin < (rangeStart + (slot.duration || 60));
    if (pct >= 0.8) status = 'done';
    else if (pct > 0) status = 'partial';
    else if (isCurrentSlot) status = 'current';
    else if (dateStr === todayStr && nowMin < rangeStart) status = 'upcoming';
    else status = 'missed';`;

c = c.replace(adherenceRegex, adherenceRep);

// 4. Update renderSchedule badge
const badgeRegex = /\$\{isActive && !isEditMode \? `<span class="active-indicator" style="position:static; display:inline-flex; align-items:center; gap:3px; margin-left:10px; background:var\(--red-light, rgba\(239, 68, 68, 0\.15\)\); padding:2px 6px; border-radius:10px;"><span class="material-symbols-rounded icon-sm" style="font-size:10px;">circle<\/span> \$\{String\(now\.getHours\(\)\)\.padStart\(2,'0'\)\}:\$\{String\(now\.getMinutes\(\)\)\.padStart\(2,'0'\)\}<\/span>` : ''\}/;

const badgeRep = `\${isActive && !isEditMode ? (() => {
              const isTrk = typeof trackerState !== 'undefined' && (trackerState.isRunning || trackerState.isPaused);
              const bg = isTrk ? 'var(--success-light, rgba(16, 185, 129, 0.15))' : 'var(--red-light, rgba(239, 68, 68, 0.15))';
              const col = isTrk ? 'var(--success, #10B981)' : 'var(--red, #EF4444)';
              const txt = isTrk ? 'Studying' : 'Not Studying';
              const icn = isTrk ? 'timer' : 'timer_off';
              return \`<span class="active-indicator realtime-time-badge" style="position:static; display:inline-flex; align-items:center; gap:4px; margin-left:10px; background:\${bg}; color:\${col}; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:13px; color:\${col};">\${icn}</span> \${txt} • \${String(now.getHours()).padStart(2,'0')}:\${String(now.getMinutes()).padStart(2,'0')}</span>\`;
            })() : ''}`;

c = c.replace(badgeRegex, badgeRep);

// 5. Update renderSchedule right-side status
const statusRegex = /if \(st === 'studying'\) return `<div class="cons-slot-status" style="color:var\(--primary\); font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:16px;">timer<\/span><span>Studying...<\/span><\/div>`;\s*return `<div class="cons-slot-status cons-status-missed">\$\{_svgPartial\}<span>Missed<\/span><\/div>`;/;

const statusRep = `if (st === 'current') return ''; // Handled by badge
            return \`<div class="cons-slot-status cons-status-missed">\${_svgPartial}<span>Missed</span></div>\`;`;

c = c.replace(statusRegex, statusRep);

// 6. Update Adherence widget
const widgetRegex = /if \(cSlot\) \{\s*currentActivityStr = `<div style="font-size:11px; margin-top:4px; color:var\(--text-secondary\); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var\(--primary\);">\$\{\(cSlot\.icon \|\| 'schedule'\)\.trim\(\)\}<\/span> <span style="flex:1;">Current: <b style="color:var\(--text-primary\);">\$\{cSlot\.label\}<\/b><\/span> <span style="font-weight:700; color:var\(--primary-color\);">\$\{timeStr\}<\/span><\/div>`;\s*\} else \{\s*currentActivityStr = `<div style="font-size:11px; margin-top:4px; color:var\(--text-secondary\); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var\(--text-muted\);">bed<\/span> <span style="flex:1;">Current: <b style="color:var\(--text-muted\);">Rest Time<\/b><\/span> <span style="font-weight:700; color:var\(--text-muted\);">\$\{timeStr\}<\/span><\/div>`;\s*\}/;

const widgetRep = `const isTrk = typeof trackerState !== 'undefined' && (trackerState.isRunning || trackerState.isPaused);
        const trkCol = isTrk ? 'var(--success, #10B981)' : 'var(--red, #EF4444)';
        const trkTxt = isTrk ? 'Studying' : 'Not Studying';
        if (cSlot) {
          currentActivityStr = \`<div style="font-size:11px; margin-top:4px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var(--primary);">\${(cSlot.icon || 'schedule').trim()}</span> <span style="flex:1;">Current: <b style="color:var(--text-primary);">\${cSlot.label}</b></span> <span style="font-weight:700; color:\${trkCol}; display:flex; align-items:center; gap:3px;">\${trkTxt} • \${timeStr}</span></div>\`;
        } else {
          currentActivityStr = \`<div style="font-size:11px; margin-top:4px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;"><span class="material-symbols-rounded" style="font-size:14px; color:var(--text-muted);">bed</span> <span style="flex:1;">Current: <b style="color:var(--text-muted);">Rest Time</b></span> <span style="font-weight:700; color:\${trkCol}; display:flex; align-items:center; gap:3px;">\${trkTxt} • \${timeStr}</span></div>\`;
        }`;

c = c.replace(widgetRegex, widgetRep);

fs.writeFileSync('app.js', c);
console.log('Applied all 6 fixes successfully');
