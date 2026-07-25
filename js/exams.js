// ========================================
// exams.js — Exam Schedule & Mocks
// ========================================

import { state, DYNAMIC_DATA, isEditMode, saveDynamicData } from './state.js';
import { formatDate, formatDateFull, daysUntil, showToast } from './utils.js';
import { openModal, closeModal, openFormModal } from './modals.js';
import { getMockScores, saveMockScore, saveState } from './state.js';
import { reorderArray, confirmDelete } from './edit-mode.js';

export function renderExams() {
  const days = daysUntil(DYNAMIC_DATA.exam.date);
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
  
  DYNAMIC_DATA.mocks.forEach((series, seriesIdx) => {
    const seriesHtml = `
      <div class="mock-series glass-card">
        <h3 class="series-title" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          ${!isEditMode ? `<span>${series.name}</span>` : `
            <input type="text" class="inline-input" value="${series.name}" onchange="updateMockSeries(${seriesIdx}, this.value)" style="font-weight:bold; font-size:1.1em;">
            <div class="edit-mode-controls" style="display:inline-flex; opacity:1; transform:none; position:static; margin-left:10px;">
              <button class="delete-btn" onclick="deleteMockSeries(${seriesIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
            </div>
          `}
        </h3>
        <div class="mock-list">
          ${series.tests.map((mock, mockIdx) => {
            const score = scores[mock.id];
            const isPast = daysUntil(mock.date) < 0;
            const isUpcoming = daysUntil(mock.date) >= 0 && daysUntil(mock.date) <= 3;
            return `
              <div class="mock-item ${score ? 'scored' : ''} ${isUpcoming ? 'upcoming' : ''}"  ${!isEditMode ? `onclick="openMockScoreModal('${mock.id}', '${mock.subject}', '${series.name}', '${mock.date}')"` : ''}>
                ${isEditMode ? `
  
` : ''}
                ${!isEditMode ? `
                <div class="mock-subject" style="flex:1">${mock.subject}</div>
                <div class="mock-date">${formatDate(mock.date)}</div>
                <div class="mock-score">${score ? score.score + '/100' : (isPast ? '<span class="material-symbols-rounded icon-sm" style="color:var(--error-color);">warning</span>' : '<span class="material-symbols-rounded icon-sm">check_box_outline_blank</span>')}</div>
                ` : `
                <div class="mock-subject" style="flex:1; margin-right:10px;">
                  <input type="text" class="inline-input" value="${mock.subject}" onchange="updateMock('${series.id}', ${mockIdx}, 'subject', this.value)">
                </div>
                <div class="mock-date">
                  <input type="date" class="inline-input date-input" value="${mock.date}" onchange="updateMock('${series.id}', ${mockIdx}, 'date', this.value)">
                </div>
                <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
    <button class="move-btn" onclick="event.stopPropagation(); moveMock('${series.id}', ${mockIdx}, -1)" ${mockIdx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
    <button class="move-btn" onclick="event.stopPropagation(); moveMock('${series.id}', ${mockIdx}, 1)" ${mockIdx===series.tests.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
    <button class="delete-btn" onclick="event.stopPropagation(); deleteMock('${series.id}', ${mockIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
  </div>
                </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
        ${isEditMode ? `<button class="add-item-btn" onclick="addMock('${series.id}')">+ Add Mock</button>` : ''}
      </div>
    `;
    container.innerHTML += seriesHtml;
  });
  
  if (isEditMode) {
    container.innerHTML += `<button class="add-item-btn" style="margin-bottom: 20px" onclick="addMockSeries()">+ Add New Test Series</button>`;
  }

  
  // ─── Final Exam Datesheet ─────────────
  container.innerHTML += `
    <div class="mock-series glass-card final-datesheet">
      <h3 class="series-title"><span class="material-symbols-rounded icon-sm">school</span> CA Final — November 2026</h3>
      <div class="mock-list">
        ${DYNAMIC_DATA.finalExams.map((exam, examIdx) => {
          const days = daysUntil(exam.date);
          return `
            <div class="mock-item final-exam-item">
              ${isEditMode ? `
  
` : ''}
              ${!isEditMode ? `
              <div class="mock-subject" style="flex:1">${exam.subject}</div>
              <div class="mock-date">${formatDate(exam.date)} (${exam.day})<br><small>${exam.time}</small></div>
              <div class="mock-score final-days">${days} days</div>
              ` : `
              <div class="mock-subject" style="flex:1; display:flex; flex-direction:column; gap:4px; margin-right:10px;">
                <input type="text" class="inline-input" value="${exam.subject}" onchange="updateExam(${examIdx}, 'subject', this.value)">
                <input type="text" class="inline-input time-input" value="${exam.time}" onchange="updateExam(${examIdx}, 'time', this.value)" placeholder="Time">
              </div>
              <div class="mock-date" style="display:flex; flex-direction:column; gap:4px; margin-right:10px;">
                <input type="date" class="inline-input date-input" value="${exam.date}" onchange="updateExam(${examIdx}, 'date', this.value)">
                <input type="text" class="inline-input time-input" value="${exam.day}" onchange="updateExam(${examIdx}, 'day', this.value)" placeholder="Day">
              </div>
              <div class="edit-mode-controls">
                <button class="delete-btn" onclick="deleteExam(${examIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
              </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
      ${isEditMode ? `<button class="add-item-btn" onclick="addExam()">+ Add Exam</button>` : ''}
    </div>
  `;
  
  renderScoreChart();
}

export function getNextMock() {
  const allMocks = DYNAMIC_DATA.mocks.flatMap(s => s.tests);
  const upcoming = allMocks.filter(m => daysUntil(m.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcoming[0] || null;
}

export function getNextMockFor(subj) {
  const allMocks = DYNAMIC_DATA.mocks.flatMap(s => s.tests);
  const upcoming = allMocks.filter(m => m.subject === subj && daysUntil(m.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcoming[0] || null;
}

export function openMockScoreModal(mockId, subject, series, date) {
  const scores = getMockScores();
  const existing = scores[mockId] || {};
  
  openModal(`${subject} — Series ${series}`, `
    <div class="mock-modal">
      <p class="mock-modal-date"><span class="material-symbols-rounded icon-sm">event</span> ${formatDate(date)}</p>
      <div class="form-group">
        <label>Score (out of 100)</label>
        <input type="number" id="mock-score-input" min="0" max="100" value="${existing.score || ''}" placeholder="Enter marks">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea id="mock-notes-input" rows="3" placeholder="Weak areas, what to revise...">${existing.notes || ''}</textarea>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-primary" onclick="saveMockScoreFromModal('${mockId}')"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">save</span> Save Score</button>
        ${existing.score ? `<button class="btn-secondary" onclick="clearMockScoreFromModal('${mockId}')" style="flex: 0.5;"><span class="material-symbols-rounded icon-sm">delete</span> Clear</button>` : ''}
      </div>
    </div>
  `);
}

export function saveMockScoreFromModal(mockId) {
  const score = document.getElementById('mock-score-input').value;
  const notes = document.getElementById('mock-notes-input').value;
  if (!score) { showToast('Please enter a score! <span class="material-symbols-rounded icon-sm" style="color:var(--error-color);">warning</span>'); return; }
  saveMockScore(mockId, score, notes);
  closeModal();
  renderExams();
  showToast('Score saved! <span class="material-symbols-rounded icon-sm" style="color:var(--success-color);">check_circle</span>');
}

export function clearMockScoreFromModal(mockId) {
  const scores = getMockScores();
  delete scores[mockId];
  saveState({ mockScores: scores });
  closeModal();
  renderExams();
  showToast('Score cleared! <span class="material-symbols-rounded icon-sm" style="color:var(--error-color);">delete</span>');
}


export function renderScoreChart() {
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
  DYNAMIC_DATA.mocks.forEach((series, i) => {
    const label = 'S' + (i + 1);
    ctx.fillText(label, 100 + i * 120, 195);
  });
  
  // Draw lines for each subject
  subjects.forEach(subj => {
    const points = [];
    DYNAMIC_DATA.mocks.forEach((series, sIdx) => {
      const mock = series.tests.find(m => m.subject === subj);
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

// ─── EXAMS EDIT HANDLERS ───────────────
export function reorderMock(from, to, seriesKey) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  if (series) reorderArray(series.tests, from, to);
}
export function updateMock(seriesKey, idx, field, value) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  if (!series) return;
  const mock = series.tests[idx];
  mock[field] = value;
  saveDynamicData();
}
export function deleteMock(seriesKey, idx) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  confirmDelete(series.tests[idx].subject, () => {
    series.tests.splice(idx, 1);
    saveDynamicData();
    renderExams();
  });
}
export function addMock(seriesKey) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  openFormModal('Add Mock', [
    { label: 'Subject', type: 'text', placeholder: 'e.g., DT Full Syllabus' },
    { label: 'Date', type: 'date', value: '2026-08-01' }
  ], (subj, date) => {
    if (!subj || !date) return;
    series.tests.push({ id: 'm-new-' + Date.now(), subject: subj, date: date, series: series.name });
    saveDynamicData();
    renderExams();
  });
}

export function reorderExam(from, to) {
  reorderArray(DYNAMIC_DATA.finalExams, from, to);
}
export function updateExam(idx, field, value) {
  const exam = DYNAMIC_DATA.finalExams[idx];
  if (!exam) return;
  exam[field] = value;
  // Keep the main countdown in sync with the first exam date
  if (idx === 0 && field === 'date') {
    DYNAMIC_DATA.exam.date = value + 'T14:00:00+05:30';
    if (window.updateCountdown) window.updateCountdown();
  }
  saveDynamicData();
}
export function deleteExam(idx) {
  confirmDelete(DYNAMIC_DATA.finalExams[idx].subject, () => {
    DYNAMIC_DATA.finalExams.splice(idx, 1);
    saveDynamicData();
    renderExams();
  });
}
export function addExam() {
  openFormModal('Add Final Exam', [
    { label: 'Subject', type: 'text', placeholder: 'e.g., Paper 6: IBS' },
    { label: 'Date', type: 'date', value: '2026-11-01' },
    { label: 'Day', type: 'text', placeholder: 'e.g., Monday' },
    { label: 'Time', type: 'text', placeholder: 'e.g., 2:00 PM - 6:00 PM' }
  ], (subj, date, day, time) => {
    if (!subj || !date) return;
    DYNAMIC_DATA.finalExams.push({ id: 'final-new-' + Date.now(), subject: subj, date, day, time });
    saveDynamicData();
    renderExams();
  });
}

// ─── Test Series Managers ─────────────────────
export function addMockSeries() {
  openFormModal('Add Test Series', [
    { label: 'Series Name', type: 'text', placeholder: 'e.g., ICAI MTPs' }
  ], (name) => {
    if (!name) return;
    const id = 'series_' + Date.now();
    DYNAMIC_DATA.mocks.push({ id, name, tests: [] });
    saveDynamicData();
    renderExams();
  });
}

export function updateMockSeries(idx, name) {
  if (!name) return;
  DYNAMIC_DATA.mocks[idx].name = name;
  saveDynamicData();
}

export function deleteMockSeries(idx) {
  if (confirm(`Delete series "${DYNAMIC_DATA.mocks[idx].name}" and all its mocks?`)) {
    DYNAMIC_DATA.mocks.splice(idx, 1);
    saveDynamicData();
    renderExams();
  }
}

export function moveMock(seriesId, idx, dir) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesId);
  if (series && series.tests) {
    if (idx + dir < 0 || idx + dir >= series.tests.length) return;
    reorderArray(series.tests, idx, idx + dir);
    saveDynamicData();
    renderExams();
  }
}

// ─── Window Attachments ─────────────────
window.renderExams = renderExams;
window.getNextMock = getNextMock;
window.getNextMockFor = getNextMockFor;
window.openMockScoreModal = openMockScoreModal;
window.saveMockScoreFromModal = saveMockScoreFromModal;
window.clearMockScoreFromModal = clearMockScoreFromModal;
window.renderScoreChart = renderScoreChart;
window.reorderMock = reorderMock;
window.updateMock = updateMock;
window.deleteMock = deleteMock;
window.addMock = addMock;
window.reorderExam = reorderExam;
window.updateExam = updateExam;
window.deleteExam = deleteExam;
window.addExam = addExam;
window.addMockSeries = addMockSeries;
window.updateMockSeries = updateMockSeries;
window.deleteMockSeries = deleteMockSeries;
window.moveMock = moveMock;
