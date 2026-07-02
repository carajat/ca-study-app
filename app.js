// ========================================
// CA Final Study Companion — App Logic
// ========================================

// ─── State ──────────────────────────────
let state = {
  activeTab: 'dashboard',
  activeSchedule: 'earlyMorning',
  plannerDate: new Date(),
  calendarMonth: new Date(),
  syllabusView: 'list', // 'list' or 'detail'
  activeSubject: null
};

// ─── Storage Helper ─────────────────────
const STORAGE_KEY = 'ca_final_tracker';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Load error:', e); }
  return {};
}

function saveState(data) {
  try {
    const existing = loadState();
    const merged = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) { console.error('Save error:', e); }
}

function getSyllabusProgress() {
  return loadState().syllabusProgress || {};
}

function saveSyllabusProgress(progress) {
  saveState({ syllabusProgress: progress });
}

function getMockScores() {
  return loadState().mockScores || {};
}

function saveMockScore(mockId, score, notes) {
  const scores = getMockScores();
  scores[mockId] = { score: parseInt(score), notes, date: new Date().toISOString() };
  saveState({ mockScores: scores });
}

function getPlannerTasks() {
  return loadState().plannerTasks || {};
}

function savePlannerTasks(tasks) {
  saveState({ plannerTasks: tasks });
}

// ─── Toast ──────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Modal ──────────────────────────────
function openModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('show');
}

// ─── Tab Navigation ─────────────────────
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelector(`.nav-item[data-tab="${tabName}"]`).classList.add('active');
  
  // Refresh content
  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'exams') renderExams();
  if (tabName === 'schedule') renderSchedule();
  if (tabName === 'planner') renderPlanner();
  if (tabName === 'syllabus') renderSyllabus();
  
  window.scrollTo(0, 0);
}

// ─── Date Helpers ───────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDateFull(date) {
  const d = new Date(date);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  const now = new Date();
  now.setHours(0,0,0,0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

// ═══════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════
function renderDashboard() {
  updateCountdown();
  updateDashboardStats();
  updateCurrentActivity();
  updateDashboardPlanner();
  updateQuote();
}

function updateCountdown() {
  const examDate = new Date(APP_DATA.exam.date);
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

function updateDashboardStats() {
  // Syllabus progress
  const pct = calculateOverallProgress();
  document.getElementById('dash-syllabus-pct').textContent = pct + '%';
  document.getElementById('dash-syllabus-bar').style.width = pct + '%';
  
  // Next mock
  const nextDT = getNextMockFor('DT');
  const nextIDT = getNextMockFor('IDT');
  
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

function updateCurrentActivity() {
  const schedule = APP_DATA.schedules[state.activeSchedule];
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
    document.getElementById('ca-slot-name').textContent = currentSlot.icon + ' ' + currentSlot.label;
    document.getElementById('ca-slot-details').textContent = `Window: ${currentSlot.startRange} · Duration: ${currentSlot.duration >= 60 ? (currentSlot.duration/60) + ' hrs' : currentSlot.duration + ' min'}`;
    document.getElementById('ca-slot-name').className = 'ca-slot-name slot-' + currentSlot.type;
  } else {
    document.getElementById('ca-slot-name').textContent = '😴 Rest Time';
    document.getElementById('ca-slot-details').textContent = 'No active session right now';
  }
  
  if (nextSlot) {
    document.getElementById('ca-next-slot').textContent = '⏭️ Next: ' + nextSlot.icon + ' ' + nextSlot.label;
  } else {
    document.getElementById('ca-next-slot').textContent = '';
  }
}

function updateDashboardPlanner() {
  const tasks = getPlannerTasks();
  const todayTasks = tasks[dateKey(new Date())] || [];
  const done = todayTasks.filter(t => t.done).length;
  const total = todayTasks.length;
  document.getElementById('dash-planner-done').textContent = done;
  document.getElementById('dash-planner-total').textContent = total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('dash-planner-bar').style.width = pct + '%';
}

function updateQuote() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const quoteIdx = dayOfYear % APP_DATA.quotes.length;
  document.getElementById('daily-quote').textContent = '"' + APP_DATA.quotes[quoteIdx] + '"';
}

// ═══════════════════════════════════════════
//  EXAM SCHEDULE
// ═══════════════════════════════════════════
function renderExams() {
  const days = daysUntil(APP_DATA.exam.date);
  document.getElementById('exam-days-left').textContent = days + ' days left';
  
  // Next mock
  const nextMock = getNextMock();
  if (nextMock) {
    const mockDays = daysUntil(nextMock.date);
    document.getElementById('nmc-subject').textContent = nextMock.subject;
    document.getElementById('nmc-date').textContent = formatDate(nextMock.date);
    document.getElementById('nmc-countdown').textContent = mockDays <= 0 ? 'TODAY!' : mockDays + ' days remaining';
    document.getElementById('next-mock-card').className = 'next-mock-card glass-card' + (mockDays <= 3 ? ' urgent' : '');
  }
  
  // Render series
  const container = document.getElementById('mock-series-container');
  container.innerHTML = '';
  const scores = getMockScores();
  
  ['series1', 'series2', 'series3'].forEach((seriesKey, idx) => {
    const series = APP_DATA.mocks[seriesKey];
    const seriesHtml = `
      <div class="mock-series glass-card">
        <h3 class="series-title">Series ${idx + 1}</h3>
        <div class="mock-list">
          ${series.map(mock => {
            const score = scores[mock.id];
            const isPast = daysUntil(mock.date) < 0;
            const isUpcoming = daysUntil(mock.date) >= 0 && daysUntil(mock.date) <= 3;
            return `
              <div class="mock-item ${score ? 'scored' : ''} ${isUpcoming ? 'upcoming' : ''}" onclick="openMockScoreModal('${mock.id}', '${mock.subject}', ${mock.series}, '${mock.date}')">
                <div class="mock-subject">${mock.subject}</div>
                <div class="mock-date">${formatDate(mock.date)}</div>
                <div class="mock-score">${score ? score.score + '/100' : (isPast ? '⚠️' : '⬜')}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    container.innerHTML += seriesHtml;
  });
  
  // ─── Final Exam Datesheet ─────────────
  container.innerHTML += `
    <div class="mock-series glass-card final-datesheet">
      <h3 class="series-title">🎓 CA Final — November 2026</h3>
      <div class="mock-list">
        ${APP_DATA.finalExams.map(exam => {
          const days = daysUntil(exam.date);
          return `
            <div class="mock-item final-exam-item">
              <div class="mock-subject">${exam.subject}</div>
              <div class="mock-date">${formatDate(exam.date)} (${exam.day})<br><small>${exam.time}</small></div>
              <div class="mock-score final-days">${days} days</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  renderScoreChart();
}

function getNextMock() {
  const allMocks = [...APP_DATA.mocks.series1, ...APP_DATA.mocks.series2, ...APP_DATA.mocks.series3];
  const upcoming = allMocks.filter(m => daysUntil(m.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcoming[0] || null;
}

function getNextMockFor(subj) {
  const allMocks = [...APP_DATA.mocks.series1, ...APP_DATA.mocks.series2, ...APP_DATA.mocks.series3];
  const upcoming = allMocks.filter(m => m.subject === subj && daysUntil(m.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcoming[0] || null;
}

function openMockScoreModal(mockId, subject, series, date) {
  const scores = getMockScores();
  const existing = scores[mockId] || {};
  
  openModal(`${subject} — Series ${series}`, `
    <div class="mock-modal">
      <p class="mock-modal-date">📅 ${formatDate(date)}</p>
      <div class="form-group">
        <label>Score (out of 100)</label>
        <input type="number" id="mock-score-input" min="0" max="100" value="${existing.score || ''}" placeholder="Enter marks">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea id="mock-notes-input" rows="3" placeholder="Weak areas, what to revise...">${existing.notes || ''}</textarea>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-primary" onclick="saveMockScoreFromModal('${mockId}')">💾 Save Score</button>
        ${existing.score ? `<button class="btn-secondary" onclick="clearMockScoreFromModal('${mockId}')" style="flex: 0.5;">🗑️ Clear</button>` : ''}
      </div>
    </div>
  `);
}

function saveMockScoreFromModal(mockId) {
  const score = document.getElementById('mock-score-input').value;
  const notes = document.getElementById('mock-notes-input').value;
  if (!score) { showToast('Please enter a score! ⚠️'); return; }
  saveMockScore(mockId, score, notes);
  closeModal();
  renderExams();
  showToast('Score saved! ✅');
}

function clearMockScoreFromModal(mockId) {
  const scores = getMockScores();
  delete scores[mockId];
  saveState({ mockScores: scores });
  closeModal();
  renderExams();
  showToast('Score cleared! 🗑️');
}


function renderScoreChart() {
  const canvas = document.getElementById('score-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scores = getMockScores();
  const subjects = ['DT', 'IDT', 'IBS'];
  const colors = { DT: '#6C3CE1', IDT: '#3B82F6', IBS: '#10B981' };
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  const styles = getComputedStyle(document.documentElement);
  ctx.strokeStyle = styles.getPropertyValue('--chart-grid').trim() || '#2a2e3a';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 20 + (i * 40);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(380, y);
    ctx.stroke();
    ctx.fillStyle = styles.getPropertyValue('--chart-label').trim() || '#666';
    ctx.font = '10px Inter';
    ctx.fillText((100 - i * 25), 10, y + 4);
  }
  
  // Labels
  ctx.fillStyle = styles.getPropertyValue('--chart-label').trim() || '#888';
  ctx.font = '11px Inter';
  ['S1', 'S2', 'S3'].forEach((label, i) => {
    ctx.fillText(label, 100 + i * 120, 195);
  });
  
  // Draw lines for each subject
  subjects.forEach(subj => {
    const points = [];
    ['series1', 'series2', 'series3'].forEach((series, sIdx) => {
      const mock = APP_DATA.mocks[series].find(m => m.subject === subj);
      if (mock && scores[mock.id]) {
        points.push({ x: 100 + sIdx * 120, y: 180 - (scores[mock.id].score / 100 * 160) });
      }
    });
    
    if (points.length > 1) {
      ctx.strokeStyle = colors[subj];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
    
    points.forEach(p => {
      ctx.fillStyle = colors[subj];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  
  // Legend
  let legendX = 60;
  subjects.forEach(subj => {
    ctx.fillStyle = colors[subj];
    ctx.fillRect(legendX, 5, 12, 12);
    ctx.fillStyle = styles.getPropertyValue('--chart-legend').trim() || '#ccc';
    ctx.font = '10px Inter';
    ctx.fillText(subj, legendX + 16, 15);
    legendX += 70;
  });
}

// ═══════════════════════════════════════════
//  TIMETABLE
// ═══════════════════════════════════════════
function renderSchedule() {
  const schedule = APP_DATA.schedules[state.activeSchedule];
  
  const container = document.getElementById('schedule-slots-container');
  container.innerHTML = '';
  
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  
  schedule.slots.forEach(slot => {
    const [startStr] = slot.startRange.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + slot.duration;
    const isActive = currentMin >= startMin && currentMin < endMin;
    const durationStr = slot.duration >= 60 ? (slot.duration / 60) + ' hrs' : slot.duration + ' min';
    
    container.innerHTML += `
      <div class="schedule-slot glass-card slot-type-${slot.type} ${isActive ? 'slot-active' : ''}">
        ${isActive ? '<div class="active-indicator">🔴 NOW</div>' : ''}
        <div class="slot-header">
          <span class="slot-icon">${slot.icon}</span>
          <span class="slot-label">${slot.label}</span>
        </div>
        <div class="slot-details">
          <span class="slot-range">Start between: ${slot.startRange}</span>
          <span class="slot-duration">Duration: ${durationStr}</span>
        </div>
      </div>
    `;
  });
  
  // Study rules
  const rulesList = document.getElementById('study-rules-list');
  rulesList.innerHTML = APP_DATA.schedules.rules.map(r => `<li>${r}</li>`).join('');
}

function switchSchedule(type) {
  state.activeSchedule = type;
  document.getElementById('btn-early').classList.toggle('active', type === 'earlyMorning');
  document.getElementById('btn-late').classList.toggle('active', type === 'lateNight');
  saveState({ activeSchedule: type });
  renderSchedule();
}

// ═══════════════════════════════════════════
//  CALENDAR PLANNER
// ═══════════════════════════════════════════
function renderPlanner() {
  renderPlannerMockReminder();
  renderMiniCalendar();
  renderPlannerDay();
}

function renderPlannerMockReminder() {
  const nextMock = getNextMock();
  const el = document.getElementById('planner-mock-reminder');
  if (nextMock) {
    const days = daysUntil(nextMock.date);
    el.innerHTML = `<span class="pmr-icon">🎯</span> Next mock: <strong>${nextMock.subject}</strong> in <strong>${days} days</strong> (${formatDate(nextMock.date)})`;
    el.className = 'planner-mock-reminder glass-card' + (days <= 3 ? ' urgent' : '');
  } else {
    el.innerHTML = '✅ All mock tests done!';
  }
}

function renderMiniCalendar() {
  const date = state.calendarMonth;
  const year = date.getFullYear();
  const month = date.getMonth();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  document.getElementById('cal-month-label').textContent = months[month] + ' ' + year;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  
  const tasks = getPlannerTasks();
  let html = '';
  
  for (let i = 0; i < startDay; i++) {
    html += '<span class="cal-day empty"></span>';
  }
  
  // Build set of important dates for highlighting
  const mockDates = new Set();
  const examDates = new Set();
  [...APP_DATA.mocks.series1, ...APP_DATA.mocks.series2, ...APP_DATA.mocks.series3].forEach(m => mockDates.add(m.date));
  APP_DATA.finalExams.forEach(e => examDates.add(e.date));
  
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayTasks = tasks[key] || [];
    const done = dayTasks.filter(t => t.done).length;
    const total = dayTasks.length;
    let dotClass = '';
    if (total > 0) {
      dotClass = done === total ? 'day-green' : (done > 0 ? 'day-yellow' : 'day-grey');
    }
    // Highlight mock test and exam dates
    const isMockDay = mockDates.has(key);
    const isExamDay = examDates.has(key);
    const mockClass = isMockDay ? 'day-mock' : '';
    const examClass = isExamDay ? 'day-exam' : '';
    const todayClass = isToday(new Date(year, month, d)) ? 'today' : '';
    const selectedClass = dateKey(state.plannerDate) === key ? 'selected' : '';
    
    // Get tooltip for special days
    let tooltip = '';
    if (isMockDay) {
      const mock = [...APP_DATA.mocks.series1, ...APP_DATA.mocks.series2, ...APP_DATA.mocks.series3].find(m => m.date === key);
      tooltip = `Mock: ${mock.subject}`;
    }
    if (isExamDay) {
      const exam = APP_DATA.finalExams.find(e => e.date === key);
      tooltip = `EXAM: ${exam.subject}`;
    }
    
    html += `<span class="cal-day ${dotClass} ${mockClass} ${examClass} ${todayClass} ${selectedClass}" onclick="selectPlannerDay(${year}, ${month}, ${d})" title="${tooltip}">${d}</span>`;
  }
  
  document.getElementById('cal-days').innerHTML = html;
}

function changeMonth(delta) {
  state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + delta, 1);
  renderMiniCalendar();
}

function selectPlannerDay(year, month, day) {
  state.plannerDate = new Date(year, month, day);
  renderPlanner();
}

function changePlannerDay(delta) {
  state.plannerDate = new Date(state.plannerDate.getTime() + delta * 24 * 60 * 60 * 1000);
  state.calendarMonth = new Date(state.plannerDate);
  renderPlanner();
}

function renderPlannerDay() {
  const date = state.plannerDate;
  const label = isToday(date) ? 'Today — ' + formatDateFull(date) : formatDateFull(date);
  document.getElementById('planner-day-label').textContent = label;
  
  const tasks = getPlannerTasks();
  const key = dateKey(date);
  const dayTasks = tasks[key] || [];
  
  const primary = dayTasks.filter(t => t.category === 'primary');
  const secondary = dayTasks.filter(t => t.category === 'secondary');
  const quick = dayTasks.filter(t => t.category === 'quick');
  
  document.getElementById('planner-primary-tasks').innerHTML = renderPlannerTaskList(primary, key);
  document.getElementById('planner-secondary-tasks').innerHTML = renderPlannerTaskList(secondary, key);
  document.getElementById('planner-quick-tasks').innerHTML = renderPlannerTaskList(quick, key);
}

function renderPlannerTaskList(tasks, dayKey) {
  if (tasks.length === 0) return '<div class="empty-tasks">No tasks yet — tap "+ Add Task"</div>';
  
  return tasks.map((task, idx) => `
    <div class="planner-task ${task.done ? 'task-done' : ''}" onclick="togglePlannerTask('${dayKey}', ${task.originalIndex})">
      <span class="task-check">${task.done ? '☑️' : '☐'}</span>
      <div class="task-info">
        <div class="task-name">${task.name}</div>
        ${task.subject ? '<div class="task-subject">' + task.subject + '</div>' : ''}
      </div>
      <button class="task-delete" onclick="event.stopPropagation(); deletePlannerTask('${dayKey}', ${task.originalIndex})">🗑️</button>
    </div>
  `).join('');
}

function togglePlannerTask(dayKey, taskIndex) {
  const tasks = getPlannerTasks();
  if (tasks[dayKey] && tasks[dayKey][taskIndex]) {
    const task = tasks[dayKey][taskIndex];
    task.done = !task.done;
    
    // Auto-sync to syllabus
    if (task.chapterId && task.activityType) {
      const progress = getSyllabusProgress();
      if (!progress[task.chapterId]) progress[task.chapterId] = {};
      progress[task.chapterId][task.activityType] = task.done;
      saveSyllabusProgress(progress);
    }
    
    savePlannerTasks(tasks);
    renderPlanner();
  }
}

function deletePlannerTask(dayKey, taskIndex) {
  const tasks = getPlannerTasks();
  if (tasks[dayKey]) {
    tasks[dayKey].splice(taskIndex, 1);
    // Re-index
    tasks[dayKey].forEach((t, i) => t.originalIndex = i);
    savePlannerTasks(tasks);
    renderPlanner();
    showToast('Task deleted! 🗑️');
  }
}

function openAddTaskModal() {
  const subjects = [
    { value: 'DT', label: 'DT (Direct Tax)' },
    { value: 'IDT', label: 'IDT (Indirect Tax)' },
    { value: 'IBS-DT', label: 'IBS — DT' },
    { value: 'IBS-IDT', label: 'IBS — IDT' },
    { value: 'IBS-AFM', label: 'IBS — AFM' },
    { value: 'IBS-FR', label: 'IBS — FR' },
    { value: 'IBS-Audit', label: 'IBS — Audit' },
    { value: 'IBS-Law', label: 'IBS — Law' },
    { value: 'IBS-SCPM', label: 'IBS — SC&PM' }
  ];
  
  openModal('➕ Add Task', `
    <div class="form-group">
      <label>Category</label>
      <select id="task-category">
        <option value="primary">📚 Primary Subject</option>
        <option value="secondary">📖 Secondary Subject</option>
        <option value="quick">📝 Quick Task</option>
      </select>
    </div>
    <div class="form-group">
      <label>Subject</label>
      <select id="task-subject" onchange="onTaskSubjectChange()">
        <option value="">— Select —</option>
        ${subjects.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
      </select>
    </div>
    <div class="form-group" id="task-chapter-group" style="display: none;">
      <label>Chapter (Optional)</label>
      <select id="task-chapter" onchange="onTaskChapterChange()">
      </select>
    </div>
    <div class="form-group" id="task-activity-group" style="display: none;">
      <label>Activity (Optional)</label>
      <select id="task-activity" onchange="onTaskChapterChange()">
        <option value="">— Select —</option>
        <option value="conceptBook">📖 Book (Concepts)</option>
        <option value="questionBank">❓ Question Bank</option>
        <option value="revisionVideo">🎥 Revision Video</option>
      </select>
    </div>
    <div class="form-group">
      <label>Task Description</label>
      <input type="text" id="task-name" placeholder="e.g. Ch 24 Transfer Pricing — ALP methods">
    </div>
    <button class="btn-primary" onclick="addPlannerTask()">Add Task ✅</button>
  `);
}

function onTaskSubjectChange() {
  const subj = document.getElementById('task-subject').value;
  const chapterGroup = document.getElementById('task-chapter-group');
  const activityGroup = document.getElementById('task-activity-group');
  const chapterSelect = document.getElementById('task-chapter');
  
  if (!subj) {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
    return;
  }
  
  let chapters = [];
  let isMain = false;
  
  if (subj === 'DT' || subj === 'IBS-DT') { chapters = APP_DATA.dtChapters; isMain = (subj === 'DT'); }
  else if (subj === 'IDT' || subj === 'IBS-IDT') { chapters = APP_DATA.idtChapters; isMain = (subj === 'IDT'); }
  else if (subj.startsWith('IBS-')) {
    const key = subj.replace('IBS-', '').toLowerCase();
    if (APP_DATA.ibsSubjects[key]) {
      chapters = APP_DATA.ibsSubjects[key].chapters;
    }
  }
  
  if (chapters.length > 0) {
    chapterGroup.style.display = 'block';
    chapterSelect.innerHTML = '<option value="">— Select Chapter —</option>' + 
      chapters.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      
    if (isMain) {
      activityGroup.style.display = 'block';
    } else {
      activityGroup.style.display = 'none';
      document.getElementById('task-activity').value = '';
    }
  } else {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
  }
}

function onTaskChapterChange() {
  const chapterSelect = document.getElementById('task-chapter');
  const chapterId = chapterSelect.value;
  const chapterName = chapterSelect.options[chapterSelect.selectedIndex]?.text;
  
  const activitySelect = document.getElementById('task-activity');
  const activity = activitySelect.value;
  const activityName = activitySelect.options[activitySelect.selectedIndex]?.text;
  
  const taskName = document.getElementById('task-name');
  
  if (chapterId) {
    // Strip emojis for cleaner task name
    const cleanActivity = activityName ? activityName.replace(/[^a-zA-Z\\s\\(\\)]/g, '').trim() : '';
    taskName.value = chapterName + (cleanActivity ? ` — ${cleanActivity}` : '');
  }
}

function addPlannerTask() {
  const name = document.getElementById('task-name').value.trim();
  const category = document.getElementById('task-category').value;
  const subject = document.getElementById('task-subject').value;
  
  const chapterId = document.getElementById('task-chapter') ? document.getElementById('task-chapter').value : '';
  let activityType = document.getElementById('task-activity') ? document.getElementById('task-activity').value : '';
  
  // For IBS subjects (no activity dropdown), implicitly set activity to 'done'
  if (subject && subject.startsWith('IBS-') && chapterId) {
    activityType = 'done';
  }
  
  if (!name) { showToast('Please enter a task name! ⚠️'); return; }
  
  const tasks = getPlannerTasks();
  const key = dateKey(state.plannerDate);
  if (!tasks[key]) tasks[key] = [];
  
  tasks[key].push({
    name,
    category,
    subject,
    chapterId,
    activityType,
    done: false,
    originalIndex: tasks[key].length
  });
  
  savePlannerTasks(tasks);
  closeModal();
  renderPlanner();
  showToast('Task added! ✅');
}

function copyToTomorrow() {
  const tasks = getPlannerTasks();
  const todayKey = dateKey(state.plannerDate);
  const tomorrowDate = new Date(state.plannerDate.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowKey = dateKey(tomorrowDate);
  
  const todayTasks = tasks[todayKey] || [];
  if (todayTasks.length === 0) { showToast('No tasks to copy! Add tasks first.'); return; }
  
  tasks[tomorrowKey] = todayTasks.map((t, i) => ({ ...t, done: false, originalIndex: i }));
  savePlannerTasks(tasks);
  showToast('Copied to tomorrow! 📋');
}

// ═══════════════════════════════════════════
//  SYLLABUS TRACKER
// ═══════════════════════════════════════════
function renderSyllabus() {
  if (state.syllabusView === 'detail' && state.activeSubject) {
    renderSyllabusDetail(state.activeSubject);
  } else {
    showSubjectsList();
  }
}

function showSubjectsList() {
  state.syllabusView = 'list';
  document.getElementById('syllabus-detail').style.display = 'none';
  
  // Overall progress
  const pct = calculateOverallProgress();
  document.getElementById('overall-pct').textContent = pct + '%';
  document.getElementById('overall-bar').style.width = pct + '%';
  
  const container = document.getElementById('syllabus-subjects-list');
  container.style.display = 'block';
  
  const subjects = [
    { key: 'dt', name: '📘 Paper 4: DT & International Tax', source: 'CA Aarish Khan · 46 chapters', type: 'main', chapters: APP_DATA.dtChapters },
    { key: 'idt', name: '📗 Paper 5: IDT (GST + Customs)', source: 'VB Sir · 31 chapters', type: 'main', chapters: APP_DATA.idtChapters },
    { key: 'ibs-afm', name: '📊 IBS — AFM', source: '12 chapters', type: 'ibs', chapters: APP_DATA.ibsSubjects.afm.chapters },
    { key: 'ibs-fr', name: '📋 IBS — FR', source: '31 chapters', type: 'ibs', chapters: APP_DATA.ibsSubjects.fr.chapters },
    { key: 'ibs-audit', name: '🔍 IBS — Audit', source: '19 chapters', type: 'ibs', chapters: APP_DATA.ibsSubjects.audit.chapters },
    { key: 'ibs-law', name: '⚖️ IBS — Law (SPOM A)', source: '14 chapters', type: 'ibs', chapters: APP_DATA.ibsSubjects.law.chapters },
    { key: 'ibs-scpm', name: '💰 IBS — SC&PM (SPOM B)', source: '14 chapters', type: 'ibs', chapters: APP_DATA.ibsSubjects.scpm.chapters }
  ];
  
  container.innerHTML = subjects.map(subj => {
    const pct = calculateSubjectProgress(subj.key, subj.type);
    return `
      <div class="subject-card glass-card" onclick="openSubjectDetail('${subj.key}', '${subj.type}')">
        <div class="subj-info">
          <div class="subj-name">${subj.name}</div>
          <div class="subj-source">${subj.source}</div>
        </div>
        <div class="subj-progress">
          <span class="subj-pct">${pct}%</span>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
        </div>
        <span class="subj-arrow">▶</span>
      </div>
    `;
  }).join('');
}

function openSubjectDetail(key, type) {
  state.syllabusView = 'detail';
  state.activeSubject = { key, type };
  document.getElementById('syllabus-subjects-list').style.display = 'none';
  document.getElementById('syllabus-detail').style.display = 'block';
  renderSyllabusDetail({ key, type });
}

function renderSyllabusDetail(subject) {
  const { key, type } = subject;
  const progress = getSyllabusProgress();
  
  let chapters, title;
  if (key === 'dt') {
    chapters = APP_DATA.dtChapters;
    title = '📘 DT & International Tax';
  } else if (key === 'idt') {
    chapters = APP_DATA.idtChapters;
    title = '📗 IDT (GST + Customs)';
  } else {
    const ibsKey = key.replace('ibs-', '');
    chapters = APP_DATA.ibsSubjects[ibsKey].chapters;
    title = APP_DATA.ibsSubjects[ibsKey].name;
  }
  
  const pct = calculateSubjectProgress(key, type);
  
  const headerEl = document.getElementById('syllabus-detail-header');
  headerEl.innerHTML = `
    <h3>${title}</h3>
    <div class="detail-progress">
      <span>${pct}% complete</span>
      <div class="stat-bar stat-bar-lg"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
    </div>
  `;
  
  const contentEl = document.getElementById('syllabus-detail-content');
  
  if (type === 'main') {
    // DT/IDT: Columnar with 3 checkboxes
    contentEl.innerHTML = `
      <div class="syllabus-table">
        <div class="st-header">
          <span class="st-num">#</span>
          <span class="st-name">Chapter</span>
          <span class="st-check">📖</span>
          <span class="st-check">❓</span>
          <span class="st-check">🎥</span>
        </div>
        <div class="st-header-labels">
          <span class="st-num"></span>
          <span class="st-name"></span>
          <span class="st-check-label">Book</span>
          <span class="st-check-label">Q.Bank</span>
          <span class="st-check-label">Video</span>
        </div>
        ${chapters.map((ch, idx) => {
          const chProgress = progress[ch.id] || {};
          return `
            <div class="st-row">
              <span class="st-num">${idx + 1}</span>
              <span class="st-name">${ch.name}</span>
              <span class="st-check"><input type="checkbox" ${chProgress.conceptBook ? 'checked' : ''} onchange="toggleSyllabusCheck('${ch.id}', 'conceptBook', this.checked)"></span>
              <span class="st-check"><input type="checkbox" ${chProgress.questionBank ? 'checked' : ''} onchange="toggleSyllabusCheck('${ch.id}', 'questionBank', this.checked)"></span>
              <span class="st-check"><input type="checkbox" ${chProgress.revisionVideo ? 'checked' : ''} onchange="toggleSyllabusCheck('${ch.id}', 'revisionVideo', this.checked)"></span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    // IBS: Simple checkbox
    contentEl.innerHTML = `
      <div class="syllabus-simple">
        ${chapters.map((ch, idx) => {
          const isDone = progress[ch.id]?.done || false;
          return `
            <div class="ss-row ${isDone ? 'done' : ''}" onclick="toggleIbsCheck('${ch.id}')">
              <span class="ss-check">${isDone ? '☑️' : '☐'}</span>
              <span class="ss-num">${idx + 1}.</span>
              <span class="ss-name">${ch.name}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

function toggleSyllabusCheck(chapterId, field, checked) {
  const progress = getSyllabusProgress();
  if (!progress[chapterId]) progress[chapterId] = {};
  progress[chapterId][field] = checked;
  saveSyllabusProgress(progress);
  
  // Update progress display without full re-render
  const pct = calculateSubjectProgress(state.activeSubject.key, state.activeSubject.type);
  const headerEl = document.getElementById('syllabus-detail-header');
  const barEl = headerEl.querySelector('.stat-bar-fill');
  const pctEl = headerEl.querySelector('span');
  if (barEl) barEl.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '% complete';
}

function toggleIbsCheck(chapterId) {
  const progress = getSyllabusProgress();
  if (!progress[chapterId]) progress[chapterId] = {};
  progress[chapterId].done = !progress[chapterId].done;
  saveSyllabusProgress(progress);
  renderSyllabusDetail(state.activeSubject);
}

// ─── Progress Calculation ───────────────
function calculateSubjectProgress(key, type) {
  const progress = getSyllabusProgress();
  let total = 0, done = 0;
  
  if (key === 'dt') {
    total = APP_DATA.dtChapters.length * 3;
    APP_DATA.dtChapters.forEach(ch => {
      const p = progress[ch.id] || {};
      if (p.conceptBook) done++;
      if (p.questionBank) done++;
      if (p.revisionVideo) done++;
    });
  } else if (key === 'idt') {
    total = APP_DATA.idtChapters.length * 3;
    APP_DATA.idtChapters.forEach(ch => {
      const p = progress[ch.id] || {};
      if (p.conceptBook) done++;
      if (p.questionBank) done++;
      if (p.revisionVideo) done++;
    });
  } else {
    const ibsKey = key.replace('ibs-', '');
    const chapters = APP_DATA.ibsSubjects[ibsKey].chapters;
    total = chapters.length;
    chapters.forEach(ch => {
      if (progress[ch.id]?.done) done++;
    });
  }
  
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function calculateOverallProgress() {
  const subjects = [
    { key: 'dt', type: 'main', weight: 3 },
    { key: 'idt', type: 'main', weight: 3 },
    { key: 'ibs-afm', type: 'ibs', weight: 1 },
    { key: 'ibs-fr', type: 'ibs', weight: 1 },
    { key: 'ibs-audit', type: 'ibs', weight: 1 },
    { key: 'ibs-law', type: 'ibs', weight: 1 },
    { key: 'ibs-scpm', type: 'ibs', weight: 1 }
  ];
  
  let totalWeight = 0, weightedSum = 0;
  subjects.forEach(s => {
    const pct = calculateSubjectProgress(s.key, s.type);
    weightedSum += pct * s.weight;
    totalWeight += s.weight;
  });
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ═══════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════
function init() {
  // Initialize Themes
  initTheme();
  
  // Load saved schedule preference
  const saved = loadState();
  if (saved.activeSchedule) state.activeSchedule = saved.activeSchedule;
  
  // Render initial dashboard
  renderDashboard();
  
  // Start countdown timer
  setInterval(updateCountdown, 1000);
  
  // Update current activity every minute
  setInterval(updateCurrentActivity, 60000);
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init);

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
}

// ═══════════════════════════════════════════
//  THEMES
// ═══════════════════════════════════════════
function openThemeModal() {
  const currentTheme = localStorage.getItem('ca-theme') || 'default';
  openModal('🎨 Select Theme', `
    <p style="text-align:center; color:var(--text-secondary); margin-bottom: 20px;">Personalize your app colors</p>
    <div class="theme-picker">
      <div class="theme-circle tc-default ${currentTheme === 'default' ? 'active' : ''}" onclick="setTheme('default', this)"></div>
      <div class="theme-circle tc-ocean ${currentTheme === 'ocean' ? 'active' : ''}" onclick="setTheme('ocean', this)"></div>
      <div class="theme-circle tc-forest ${currentTheme === 'forest' ? 'active' : ''}" onclick="setTheme('forest', this)"></div>
      <div class="theme-circle tc-sunset ${currentTheme === 'sunset' ? 'active' : ''}" onclick="setTheme('sunset', this)"></div>
      <div class="theme-circle tc-rose ${currentTheme === 'rose' ? 'active' : ''}" onclick="setTheme('rose', this)"></div>
    </div>
  `);
}

function setTheme(themeName, element) {
  // Remove all theme classes
  document.body.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset', 'theme-rose');
  
  if (themeName !== 'default') {
    document.body.classList.add('theme-' + themeName);
  }
  localStorage.setItem('ca-theme', themeName);
  
  // Update UI
  if (element) {
    document.querySelectorAll('.theme-circle').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
  }
  
  // Re-render chart if on Exams tab to update chart color
  if (state.activeTab === 'exams') {
    renderScoreChart();
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('ca-theme') || 'default';
  setTheme(savedTheme);
}

