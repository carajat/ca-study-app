const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /schedule\.slots\.forEach\(\(slot, idx\) => \{\s*const \[startStr\] = slot\.startRange\.split\('-'\);\s*const \[sh, sm\] = startStr\.split\(':'\)\.map\(Number\);\s*const startMin = sh \* 60 \+ sm;\s*const endMin = startMin \+ slot\.duration;\s*const isActive = currentMin >= startMin && currentMin < endMin;\s*const durationStr = slot\.duration >= 60 \? \(slot\.duration \/ 60\) \+ ' hrs' : slot\.duration \+ ' min';\s*container\.innerHTML \+= `\s*<div class="schedule-slot glass-card slot-type-\$\{slot\.type\} \$\{isActive \? 'slot-active' : ''\}">/g;

const rep = `  const isTrk = typeof trackerState !== 'undefined' && (trackerState.isRunning || trackerState.isPaused);
  let smartActiveIdx = -1;
  let chronoActiveIdx = schedule.slots.findIndex((s) => {
    const [sh, sm] = s.startRange.split('-')[0].split(':').map(Number);
    const startMin = sh * 60 + sm;
    return currentMin >= startMin && currentMin < startMin + s.duration;
  });

  if (isTrk) {
    if (chronoActiveIdx !== -1 && schedule.slots[chronoActiveIdx].type === 'study') {
       smartActiveIdx = chronoActiveIdx;
    } else {
       let bestIdx = -1;
       for (let i = 0; i < schedule.slots.length; i++) {
         const s = schedule.slots[i];
         const [sh, sm] = s.startRange.split('-')[0].split(':').map(Number);
         if (sh * 60 + sm <= currentMin && s.type === 'study') {
           const sr = slotResultsMap[s.id];
           if (sr && sr.status !== 'done') {
             if (bestIdx === -1) bestIdx = i;
           }
         }
       }
       if (bestIdx !== -1) smartActiveIdx = bestIdx;
       else {
         for (let i = schedule.slots.length - 1; i >= 0; i--) {
           if (schedule.slots[i].type === 'study') { smartActiveIdx = i; break; }
         }
       }
    }
  } else {
    smartActiveIdx = chronoActiveIdx;
  }

  schedule.slots.forEach((slot, idx) => {
    const [startStr] = slot.startRange.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + slot.duration;
    const isChronoActive = currentMin >= startMin && currentMin < endMin;
    const hasSmartBadge = !isEditMode && (idx === smartActiveIdx);
    const durationStr = slot.duration >= 60 ? (slot.duration / 60) + ' hrs' : slot.duration + ' min';
    
    container.innerHTML += \`
      <div class="schedule-slot glass-card slot-type-\${slot.type} \${hasSmartBadge ? 'slot-active' : ''}">`;

c = c.replace(regex, rep);

const regex2 = /\$\{isActive && !isEditMode \? \(\(\) => \{\s*const isTrk = typeof trackerState !== 'undefined' && \(trackerState\.isRunning \|\| trackerState\.isPaused\);\s*const bg = isTrk \? 'var\(--success-light, rgba\(16, 185, 129, 0\.15\)\)' : 'var\(--red-light, rgba\(239, 68, 68, 0\.15\)\)';\s*const col = isTrk \? 'var\(--success, #10B981\)' : 'var\(--red, #EF4444\)';\s*const txt = isTrk \? 'Studying' : 'Not Studying';\s*const icn = isTrk \? 'timer' : 'timer_off';\s*return `<span class="active-indicator realtime-time-badge" style="position:static; display:inline-flex; align-items:center; gap:4px; margin-left:10px; background:\$\{bg\}; color:\$\{col\}; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:13px; color:\$\{col\};">\$\{icn\}<\/span> \$\{txt\} • \$\{String\(now\.getHours\(\)\)\.padStart\(2,'0'\)\}:\$\{String\(now\.getMinutes\(\)\)\.padStart\(2,'0'\)\}<\/span>`;\s*\}\)\(\) : ''\}/g;

const rep2 = `\${hasSmartBadge ? (() => {
              const isThisStudy = slot.type === 'study';
              const bg = isTrk ? 'var(--success-light, rgba(16, 185, 129, 0.15))' : (isThisStudy ? 'var(--red-light, rgba(239, 68, 68, 0.15))' : 'var(--bg-tertiary, #333333)');
              const col = isTrk ? 'var(--success, #10B981)' : (isThisStudy ? 'var(--red, #EF4444)' : 'var(--text-muted, #888888)');
              const txt = isTrk ? 'Studying' : (isThisStudy ? 'Not Studying' : 'Break Time');
              const icn = isTrk ? 'timer' : (isThisStudy ? 'timer_off' : 'free_breakfast');
              return \`<span class="active-indicator realtime-time-badge" style="position:static; display:inline-flex; align-items:center; gap:4px; margin-left:10px; background:\${bg}; color:\${col}; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:13px; color:\${col};">\${icn}</span> \${txt} • \${String(now.getHours()).padStart(2,'0')}:\${String(now.getMinutes()).padStart(2,'0')}</span>\`;
            })() : ''}`;

c = c.replace(regex2, rep2);
fs.writeFileSync('app.js', c);
console.log('Success Smart Badge');
