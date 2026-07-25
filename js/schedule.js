// ========================================
// schedule.js — Daily Timetable
// ========================================

import { state, DYNAMIC_DATA, isEditMode, saveDynamicData, saveState } from './state.js';
import { openFormModal } from './modals.js';
import { showToast } from './utils.js';
import { reorderArray, confirmDelete } from './edit-mode.js';

export function renderSchedule() {
  const schedule = DYNAMIC_DATA.schedules[state.activeSchedule];
  
  const container = document.getElementById('schedule-slots-container');
  container.innerHTML = '';
  
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  
  schedule.slots.forEach((slot, idx) => {
    const [startStr] = slot.startRange.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + slot.duration;
    const isActive = currentMin >= startMin && currentMin < endMin;
    const durationStr = slot.duration >= 60 ? (slot.duration / 60) + ' hrs' : slot.duration + ' min';
    
    container.innerHTML += `
      <div class="schedule-slot glass-card slot-type-${slot.type} ${isActive ? 'slot-active' : ''}">
        
        ${isActive && !isEditMode ? '<div class="active-indicator"><span class="material-symbols-rounded icon-sm">circle</span> NOW</div>' : ''}
        <div class="slot-header" style="flex:1">
          <span class="material-symbols-rounded slot-icon">${(slot.icon || "").trim()}</span>
          ${!isEditMode ? `<span class="slot-label">${slot.label}</span>` : `<input type="text" class="inline-input" value="${slot.label}" onchange="updateScheduleSlot('${state.activeSchedule}', ${idx}, 'label', this.value)">`}
        </div>
        <div class="slot-details" style="${isEditMode ? 'display:flex; flex-direction:column; gap:4px; margin-right:10px;' : ''}">
          ${!isEditMode ? `
          <span class="slot-range">Start between: ${slot.startRange}</span>
          <span class="slot-duration">Duration: ${durationStr}</span>
          ` : `
          <input type="text" class="inline-input time-input" value="${slot.startRange}" onchange="updateScheduleSlot('${state.activeSchedule}', ${idx}, 'startRange', this.value)" placeholder="Start Time">
          <input type="number" class="inline-input num-input" value="${slot.duration}" onchange="updateScheduleSlot('${state.activeSchedule}', ${idx}, 'duration', parseInt(this.value))" placeholder="Duration (min)">
          `}
        </div>
        ${isEditMode ? `
        <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('${state.activeSchedule}', ${idx}, -1)" ${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('${state.activeSchedule}', ${idx}, 1)" ${idx===DYNAMIC_DATA.schedules[state.activeSchedule].slots.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
    <button class="delete-btn" onclick="deleteScheduleSlot('${state.activeSchedule}', ${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
  </div>
` : ''}
      </div>
    `;
  });
  if (isEditMode) {
    container.innerHTML += `<button class="add-item-btn" onclick="addScheduleSlot('${state.activeSchedule}')">+ Add Slot</button>`;
  }
  
  // Study rules
  const rulesList = document.getElementById('study-rules-list');
  rulesList.innerHTML = DYNAMIC_DATA.schedules.rules.map(r => `<li>${r}</li>`).join('');
}

export function switchSchedule(type) {
  state.activeSchedule = type;
  document.getElementById('btn-early').classList.toggle('active', type === 'earlyMorning');
  document.getElementById('btn-late').classList.toggle('active', type === 'lateNight');
  saveState({ activeSchedule: type });
  renderSchedule();
}

// ─── SCHEDULE EDIT HANDLERS ─────────────
export function reorderScheduleSlot(from, to, scheduleKey) {
  reorderArray(DYNAMIC_DATA.schedules[scheduleKey].slots, from, to);
}
export function updateScheduleSlot(scheduleKey, idx, field, value) {
  const slot = DYNAMIC_DATA.schedules[scheduleKey].slots[idx];
  if (!slot) return;
  slot[field] = value;
  saveDynamicData();
}
export function deleteScheduleSlot(scheduleKey, idx) {
  confirmDelete(DYNAMIC_DATA.schedules[scheduleKey].slots[idx].label, () => {
    DYNAMIC_DATA.schedules[scheduleKey].slots.splice(idx, 1);
    saveDynamicData();
    renderSchedule();
  });
}
export function addScheduleSlot(scheduleKey) {
  openFormModal('Add Schedule Slot', [
    { label: 'Label', type: 'text', placeholder: 'e.g., Break / Revision' },
    { label: 'Start - End Time', type: 'text', placeholder: 'e.g., 14:00-15:00' },
    { label: 'Duration (minutes)', type: 'number', value: 60 }
  ], (label, range, dur) => {
    if (!label) return;
    DYNAMIC_DATA.schedules[scheduleKey].slots.push({ id: 's-new-' + Date.now(), label, startRange: range, duration: parseInt(dur) || 60, type: 'study', icon: '<span class="material-symbols-rounded icon-sm">edit_document</span>' });
    saveDynamicData();
    renderSchedule();
  });
}

export function moveScheduleSlot(scheduleKey, idx, dir) {
  const slots = DYNAMIC_DATA.schedules[scheduleKey].slots;
  if (idx + dir < 0 || idx + dir >= slots.length) return;
  reorderArray(slots, idx, idx + dir);
  saveDynamicData();
  renderSchedule();
}

// ─── Window Attachments ─────────────────
window.renderSchedule = renderSchedule;
window.switchSchedule = switchSchedule;
window.reorderScheduleSlot = reorderScheduleSlot;
window.updateScheduleSlot = updateScheduleSlot;
window.deleteScheduleSlot = deleteScheduleSlot;
window.addScheduleSlot = addScheduleSlot;
window.moveScheduleSlot = moveScheduleSlot;
