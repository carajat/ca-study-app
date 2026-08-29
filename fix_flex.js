const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /container\.innerHTML \+= `[\s\S]*?<\/div>\s*`\s*;\s*\n\s*\}/;

const rep = `container.innerHTML += \`
      <div class="schedule-slot glass-card slot-type-\${slot.type} \${hasSmartBadge ? 'slot-active' : ''}" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; flex-direction:column; flex:1;">
          <div class="slot-header" style="display:flex; align-items:center;">
            <span class="material-symbols-rounded slot-icon">\${(slot.icon || "").trim()}</span>
            \${!isEditMode ? \`<span class="slot-label">\${slot.label}</span>\` : \`<input type="text" class="inline-input" value="\${slot.label}" onchange="updateScheduleSlot('\${state.activeSchedule}', \${idx}, 'label', this.value)">\`}
          </div>
          \${hasSmartBadge ? (() => {
              const isThisStudy = slot.type === 'study';
              const isPaused = isTrk && typeof trackerState !== 'undefined' && trackerState.isPaused;
              const bg = isTrk ? (isPaused ? 'var(--warning-light, rgba(245, 158, 11, 0.15))' : 'var(--success-light, rgba(16, 185, 129, 0.15))') : (isThisStudy ? 'var(--red-light, rgba(239, 68, 68, 0.15))' : 'var(--bg-tertiary, #333333)');
              const col = isTrk ? (isPaused ? 'var(--warning, #F59E0B)' : 'var(--success, #10B981)') : (isThisStudy ? 'var(--red, #EF4444)' : 'var(--text-muted, #888888)');
              const txt = isTrk ? (isPaused ? 'Paused' : 'Studying') : (isThisStudy ? 'Not Studying' : 'Break Time');
              const icn = isTrk ? (isPaused ? 'pause_circle' : 'timer') : (isThisStudy ? 'timer_off' : 'free_breakfast');
              return \`<div style="margin-top:8px; margin-bottom:2px;"><span class="active-indicator realtime-time-badge" style="display:inline-flex; align-items:center; gap:4px; background:\${bg}; color:\${col}; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:14px; color:\${col};">\${icn}</span> \${txt} • \${String(now.getHours()).padStart(2,'0')}:\${String(now.getMinutes()).padStart(2,'0')}</span></div>\`;
            })() : ''}
          <div class="slot-details" style="\${isEditMode ? 'display:flex; flex-direction:column; gap:4px; margin-top:8px;' : 'margin-top:4px;'}">
            \${!isEditMode ? \`
            <span class="slot-range">Start between: \${slot.startRange}</span>
            <span class="slot-duration">Duration: \${durationStr}</span>
            \` : \`
            <input type="text" class="inline-input time-input" value="\${slot.startRange}" onchange="updateScheduleSlot('\${state.activeSchedule}', \${idx}, 'startRange', this.value)" placeholder="Start Time">
            <input type="number" class="inline-input num-input" value="\${slot.duration}" onchange="updateScheduleSlot('\${state.activeSchedule}', \${idx}, 'duration', parseInt(this.value))" placeholder="Duration (min)">
            \`}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; align-items:flex-end; justify-content:center; margin-left:10px; gap:8px;">
          \${(!isEditMode && slot.type === 'study' && slotResultsMap[slot.id]) ? (() => {
            const st = slotResultsMap[slot.id].status;
            if (st === 'done') return \`<div class="cons-slot-status cons-status-done">\${_svgCheck}<span style="color:var(--success);">\${_fmtMins(slotResultsMap[slot.id].actualMin)}</span></div>\`;
            if (st === 'partial') return \`<div class="cons-slot-status cons-status-partial">\${_svgPartial}<span>\${_fmtMins(slotResultsMap[slot.id].actualMin)}</span></div>\`;
            if (st === 'upcoming') return \`<div class="cons-slot-status cons-status-upcoming">\${_svgUpcoming}<span>Upcoming</span></div>\`;
            if (st === 'pending') return \`<div class="cons-slot-status cons-status-upcoming" style="color:var(--warning);"><span class="material-symbols-rounded icon-sm" style="font-size:16px;">pending_actions</span><span>Pending</span></div>\`;
            if (st === 'current') return ''; // Handled by badge
            return \`<div class="cons-slot-status cons-status-missed">\${_svgPartial}<span>Missed</span></div>\`;
          })() : ''}
          
          \${isEditMode ? \`
          <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
            <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
            <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, 1)" \${idx===DYNAMIC_DATA.schedules[state.activeSchedule].slots.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
            <button class="delete-btn" onclick="deleteScheduleSlot('\${state.activeSchedule}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
          </div>
          \` : ''}
        </div>
      </div>
    \`;
  }`;

if(regex.test(c)){
  c = c.replace(regex, rep);
  fs.writeFileSync('app.js', c);
  console.log('Success flex fix');
} else { console.log('Regex failed'); }
