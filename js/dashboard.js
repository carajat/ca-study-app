// ========================================
// dashboard.js — Home Tab
// ========================================

import { state, DYNAMIC_DATA } from './state.js';
import { daysUntil, dateKey } from './utils.js';
import { getPlannerTasks } from './state.js';

export function renderDashboard() {
  updateCountdown();
  updateDashboardStats();
  updateCurrentActivity();
  updateDashboardPlanner();
  updateQuote();
}

export function updateCountdown() {
  if (!DYNAMIC_DATA.exam || !DYNAMIC_DATA.exam.date) {
    document.getElementById('cd-days').textContent = '-';
    document.getElementById('cd-hours').textContent = '-';
    document.getElementById('cd-mins').textContent = '-';
    document.getElementById('cd-secs').textContent = '-';
    return;
  }
  const examDate = new Date(DYNAMIC_DATA.exam.date);
  const now = new Date();
  const diff = examDate - now;
  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '0';
    document.getElementById('cd-hours').textContent = '0';
    document.getElementById('cd-mins').textContent = '0';
    document.getElementById('cd-secs').textContent = '0';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  document.getElementById('cd-days').textContent = days;
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}

export function updateDashboardStats() {
  // Syllabus progress
  const pct = (typeof window.calculateOverallProgress === 'function') ? window.calculateOverallProgress() : 0;
  document.getElementById('dash-syllabus-pct').textContent = pct + '%';
  document.getElementById('dash-syllabus-bar').style.width = pct + '%';
  
  // Next mock
  const nextDT = (typeof window.getNextMockFor === 'function') ? window.getNextMockFor('DT') : null;
  const nextIDT = (typeof window.getNextMockFor === 'function') ? window.getNextMockFor('IDT') : null;
  
  const elValue = document.getElementById('dash-next-mock');
  const elLabel = document.getElementById('dash-next-mock-label');
  
  if (nextDT && nextIDT) {
    elValue.style.fontSize = '15px';
    elValue.style.lineHeight = '1.3';
    elValue.innerHTML = `DT: ${daysUntil(nextDT.date)}d<br>IDT: ${daysUntil(nextIDT.date)}d`;
    elLabel.textContent = 'Upcoming Mocks';
  } else if (nextDT || nextIDT) {
    const nextMock = nextDT || nextIDT;
    elValue.style.fontSize = '';
    elValue.style.lineHeight = '';
    elValue.textContent = daysUntil(nextMock.date) + ' days';
    elLabel.textContent = nextMock.subject;
  } else {
    elValue.style.fontSize = '';
    elValue.style.lineHeight = '';
    elValue.textContent = 'Done!';
    elLabel.textContent = 'All mocks completed';
  }
}

export function updateCurrentActivity() {
  const schedule = DYNAMIC_DATA.schedules[state.activeSchedule];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTime = currentHour * 60 + currentMin;
  
  let currentSlot = null;
  let nextSlot = null;
  
  for (let i = 0; i < schedule.slots.length; i++) {
    const slot = schedule.slots[i];
    const [startStr] = slot.startRange.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + slot.duration;
    
    if (currentTime >= startMin && currentTime < endMin) {
      currentSlot = slot;
      if (i + 1 < schedule.slots.length) nextSlot = schedule.slots[i + 1];
    }
  }
  
  if (currentSlot) {
    document.getElementById('ca-slot-name').innerHTML = '<span class="material-symbols-rounded" style="vertical-align:middle; margin-right:6px; font-size: 20px;">' + (currentSlot.icon || '').trim() + '</span> ' + currentSlot.label;
    document.getElementById('ca-slot-details').textContent = `Window: ${currentSlot.startRange} · Duration: ${currentSlot.duration >= 60 ? (currentSlot.duration/60) + ' hrs' : currentSlot.duration + ' min'}`;
    document.getElementById('ca-slot-name').className = 'ca-slot-name slot-' + currentSlot.type;
  } else {
    document.getElementById('ca-slot-name').innerHTML = '<span class="material-symbols-rounded icon-sm">bed</span> Rest Time';
    document.getElementById('ca-slot-details').textContent = 'No active session right now';
  }
  
  if (nextSlot) {
    document.getElementById('ca-next-slot').innerHTML = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">arrow_forward</span> Next: ' + '<span class="material-symbols-rounded" style="vertical-align:middle; font-size:14px; margin-right:4px;">' + (nextSlot.icon || '').trim() + '</span> ' + nextSlot.label;
  } else {
    document.getElementById('ca-next-slot').textContent = '';
  }
}

export function updateDashboardPlanner() {
  const tasks = getPlannerTasks();
  const todayTasks = tasks[dateKey(new Date())] || [];
  const done = todayTasks.filter(t => t.done).length;
  const total = todayTasks.length;
  document.getElementById('dash-planner-done').textContent = done;
  document.getElementById('dash-planner-total').textContent = total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('dash-planner-bar').style.width = pct + '%';
}

export function updateQuote() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const quoteIdx = dayOfYear % DYNAMIC_DATA.quotes.length;
  document.getElementById('daily-quote').textContent = '"' + DYNAMIC_DATA.quotes[quoteIdx] + '"';
}

// ─── Window Attachments ─────────────────
window.renderDashboard = renderDashboard;
window.updateCountdown = updateCountdown;
window.updateCurrentActivity = updateCurrentActivity;
window.updateDashboardPlanner = updateDashboardPlanner;
