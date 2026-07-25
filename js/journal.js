// ========================================
// journal.js — Daily Study Log & History
// ========================================

import { state, DYNAMIC_DATA, saveDynamicData } from './state.js';
import { getTodayStr, formatDate, formatDateFull, showToast } from './utils.js';
import { openModal, closeModal } from './modals.js';

export function renderTodaysLog() {
  const todayStr = getTodayStr();
  const entry = DYNAMIC_DATA.journalEntries ? DYNAMIC_DATA.journalEntries[todayStr] : null;
  const container = document.getElementById('todays-log-content');
  if (!container) return;
  
  if (!entry || !entry.rows || entry.rows.length === 0) {
    container.innerHTML = `
      <div class="empty-log glass-card">
        <span class="material-symbols-rounded" style="font-size:40px; color:var(--text-secondary);">edit_note</span>
        <p>No study entries yet for today.</p>
        <p style="font-size:12px; color:var(--text-secondary);">Start the timer or add a manual log to begin.</p>
      </div>
    `;
    return;
  }
  
  let totalMin = 0;
  let html = '<div class="log-entries">';
  entry.rows.forEach((row, idx) => {
    const mins = (parseInt(row.durHH) || 0) * 60 + (parseInt(row.durMM) || 0);
    totalMin += mins;
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    
    html += `
      <div class="log-entry glass-card">
        <div class="le-header">
          <span class="le-subject">${row.subject || 'Unknown'}</span>
          <span class="le-duration">${hh}h ${mm}m</span>
          <button class="task-delete" onclick="deleteTodaysLog(${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>
        ${row.topic ? `<div class="le-topic">${row.topic}</div>` : ''}
        ${row.tasks ? `<div class="le-tasks">${row.tasks}</div>` : ''}
      </div>
    `;
  });
  html += '</div>';
  
  const totalHH = Math.floor(totalMin / 60);
  const totalMM = totalMin % 60;
  html = `<div class="log-summary glass-card"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">schedule</span> Today: <strong>${totalHH}h ${totalMM}m</strong> studied (${entry.rows.length} sessions)</div>` + html;
  
  container.innerHTML = html;
}

export function deleteTodaysLog(idx) {
  const todayStr = getTodayStr();
  if (!DYNAMIC_DATA.journalEntries || !DYNAMIC_DATA.journalEntries[todayStr]) return;
  DYNAMIC_DATA.journalEntries[todayStr].rows.splice(idx, 1);
  saveDynamicData();
  renderTodaysLog();
  showToast('Entry deleted! <span class="material-symbols-rounded icon-sm">delete</span>');
}

export function openManualLogModal() {
  const subjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    subjects.push(s);
    if (s.type === 'folder' && s.children) subjects.push(...s.children);
  });
  
  openModal('<span class="material-symbols-rounded icon-sm">edit_note</span> Add Manual Study Log  <div style="display:flex; gap:8px; margin-top:8px;"><button class="btn-secondary" style="font-size:11px;padding:4px 10px;" onclick="openMockPickerModal(\'manual\')"><span class="material-symbols-rounded icon-sm" style="font-size:14px;">track_changes</span> From Mocks</button><button class="btn-secondary" style="font-size:11px;padding:4px 10px;" onclick="openPlannerPickerModal(\'manual\')"><span class="material-symbols-rounded icon-sm" style="font-size:14px;">event_note</span> From Planner</button></div>', `
    <div class="form-group">
      <label>Subject</label>
      <select id="ml-subj" onchange="onManualLogSubjChange()">
        <option value="">Select Subject</option>
        ${subjects.filter(s => s.type !== 'folder').map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
        <option value="__custom__">Other...</option>
      </select>
    </div>
    <div class="form-group">
      <label>Topic / Chapter</label>
      <select id="ml-topic">
        <option value="">Select Topic</option>
      </select>
    </div>
    <div class="form-group">
      <label>What you studied / Tasks</label>
      <input type="text" id="ml-task" placeholder="e.g., Completed Chapter 5 questions">
    </div>
    <div style="display:flex; gap:10px;">
      <div class="form-group" style="flex:1">
        <label>Hours</label>
        <input type="number" id="ml-hh" min="0" max="23" value="1" placeholder="Hours">
      </div>
      <div class="form-group" style="flex:1">
        <label>Minutes</label>
        <input type="number" id="ml-mm" min="0" max="59" value="0" placeholder="Minutes">
      </div>
    </div>
    <button class="btn-primary" onclick="saveManualLog()"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">save</span> Save Entry</button>
  `);
}

export function onManualLogSubjChange() {
  const subSel = document.getElementById('ml-subj');
  const topSel = document.getElementById('ml-topic');
  if (!subSel || !topSel) return;
  
  const subj = subSel.value;
  topSel.innerHTML = '<option value="">Select Topic</option>';
  
  if (subj === '__custom__') {
    const name = prompt('Enter subject name:');
    if (name) {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
      subSel.value = name;
    } else { subSel.value = ''; return; }
  }
  
  if (subj && subj !== '__custom__') {
    const subjects = [];
    (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
      subjects.push(s);
      if (s.type === 'folder' && s.children) subjects.push(...s.children);
    });
    const sData = subjects.find(s => s.name === subj);
    if (sData) {
      const arr = sData.chapters || sData.children || [];
      arr.forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch.name; opt.textContent = ch.name;
        topSel.appendChild(opt);
      });
    }
  }
}

export function saveManualLog() {
  const subject = document.getElementById('ml-subj').value;
  const topic = document.getElementById('ml-topic').value;
  const task = document.getElementById('ml-task').value;
  const hh = document.getElementById('ml-hh').value;
  const mm = document.getElementById('ml-mm').value;
  
  if (!subject) { showToast('Please select a subject! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
  if (!hh && !mm) { showToast('Please enter duration! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
  
  const todayStr = getTodayStr();
  if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
  if (!DYNAMIC_DATA.journalEntries[todayStr]) {
    DYNAMIC_DATA.journalEntries[todayStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
  }
  if (!DYNAMIC_DATA.journalEntries[todayStr].rows) DYNAMIC_DATA.journalEntries[todayStr].rows = [];
  
  DYNAMIC_DATA.journalEntries[todayStr].rows.push({
    subject, topic, tasks: task, durHH: String(hh || 0), durMM: String(mm || 0), status: 'Done'
  });
  
  saveDynamicData();
  closeModal();
  renderTodaysLog();
  showToast('Study log saved! <span class="material-symbols-rounded icon-sm" style="color:var(--success-color);">check_circle</span>');
}


// ─── Mock Picker Modal ─────────────────

export function openMockPickerModal(target) {
  if (target === undefined) target = 'tracker';
  const allMocks = DYNAMIC_DATA.mocks.flatMap(s => s.tests);
  
  let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
  allMocks.forEach(m => {
    const subj = (m.subject || '').replace(/'/g, "\\'");
    html += `
      <div class="glass-card" style="padding:10px; cursor:pointer; border:1px solid rgba(10,132,255,0.2);" onclick="pickMockTask('${subj}', '${target}')">
        <div style="font-weight:600; font-size:14px;">${m.subject}</div>
        <div style="font-size:12px; color:var(--text-secondary);">${formatDate(m.date)}</div>
      </div>
    `;
  });
  html += '</div>';
  
  openModal('Select a Mock', html);
}

export function pickMockTask(subject, target) {
  closeModal();
  
  if (target === 'manual') {
    openManualLogModal();
    setTimeout(() => {
      const subSel = document.getElementById('ml-subj');
      if (subSel) {
        // Try to find a matching subject option
        let found = false;
        for (let opt of subSel.options) {
          if (opt.value === subject) { subSel.value = subject; found = true; break; }
        }
        if (!found) {
          const opt = document.createElement('option');
          opt.value = subject; opt.textContent = subject;
          subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
          subSel.value = subject;
        }
        onManualLogSubjChange();
      }
      const taskInp = document.getElementById('ml-task');
      if (taskInp) taskInp.value = subject + ' — Mock Prep';
    }, 100);
  } else {
    // Fill tracker fields
    const subSel = document.getElementById('st-subject');
    if (subSel) {
      let found = false;
      for (let opt of subSel.options) {
        if (opt.value === subject) { subSel.value = subject; found = true; break; }
      }
      if (!found) {
        const opt = document.createElement('option');
        opt.value = subject; opt.textContent = subject;
        subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
        subSel.value = subject;
      }
      if (typeof window.onTrackerSubjectChange === 'function') window.onTrackerSubjectChange(true);
    }
    const taskInp = document.getElementById('st-task-desc');
    if (taskInp) taskInp.value = subject + ' — Mock Prep';
    
    if (typeof window.saveTrackerState === 'function') {
      window.trackerState.subject = subject;
      window.trackerState.task = subject + ' — Mock Prep';
      window.saveTrackerState();
    }
  }
}

// ─── Log History Modal ──────────────────

export function switchLogModalTab(tab) {
  document.querySelectorAll('.log-modal-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.log-modal-panel').forEach(el => el.classList.remove('active'));
  document.querySelector(`.log-modal-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`log-panel-${tab}`).classList.add('active');
}

export function renderHistoryForDate(dateStr) {
  const entry = DYNAMIC_DATA.journalEntries ? DYNAMIC_DATA.journalEntries[dateStr] : null;
  const container = document.getElementById('history-day-detail');
  if (!container) return;
  
  if (!entry || !entry.rows || entry.rows.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:20px;">No study log for this date.</p>';
    return;
  }
  
  let totalMin = 0;
  let html = `<h4 style="margin-bottom:10px;">${formatDateFull(dateStr)}</h4>`;
  
  entry.rows.forEach(row => {
    const mins = (parseInt(row.durHH) || 0) * 60 + (parseInt(row.durMM) || 0);
    totalMin += mins;
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    html += `
      <div class="log-entry glass-card" style="margin-bottom:8px;">
        <div class="le-header">
          <span class="le-subject">${row.subject || 'Unknown'}</span>
          <span class="le-duration">${hh}h ${mm}m</span>
        </div>
        ${row.topic ? `<div class="le-topic">${row.topic}</div>` : ''}
        ${row.tasks ? `<div class="le-tasks">${row.tasks}</div>` : ''}
      </div>
    `;
  });
  
  const totalHH = Math.floor(totalMin / 60);
  const totalMM = totalMin % 60;
  html = `<div class="log-summary glass-card" style="margin-bottom:10px;"><span class="material-symbols-rounded icon-sm">schedule</span> Total: <strong>${totalHH}h ${totalMM}m</strong> (${entry.rows.length} sessions)</div>` + html;
  
  container.innerHTML = html;
}

export function openLogHistoryModal() {
  const entries = DYNAMIC_DATA.journalEntries || {};
  const dates = Object.keys(entries).sort().reverse();
  
  // Calculate weekly stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  let weekMinutes = 0;
  let weekSessions = 0;
  let weekDays = 0;
  
  dates.forEach(d => {
    const date = new Date(d);
    if (date >= weekAgo) {
      const entry = entries[d];
      if (entry.rows && entry.rows.length > 0) {
        weekDays++;
        weekSessions += entry.rows.length;
        entry.rows.forEach(r => {
          weekMinutes += (parseInt(r.durHH) || 0) * 60 + (parseInt(r.durMM) || 0);
        });
      }
    }
  });
  
  const weekHours = Math.floor(weekMinutes / 60);
  const weekMins = weekMinutes % 60;
  const avgPerDay = weekDays > 0 ? Math.round(weekMinutes / weekDays) : 0;
  const avgHH = Math.floor(avgPerDay / 60);
  const avgMM = avgPerDay % 60;
  
  // Build heatmap for last 30 days
  let heatmapHtml = '<div class="log-heatmap">';
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const entry = entries[ds];
    let totalMin = 0;
    if (entry && entry.rows) {
      entry.rows.forEach(r => { totalMin += (parseInt(r.durHH) || 0) * 60 + (parseInt(r.durMM) || 0); });
    }
    let level = 'l0';
    if (totalMin > 0 && totalMin < 120) level = 'l1';
    else if (totalMin >= 120 && totalMin < 300) level = 'l2';
    else if (totalMin >= 300 && totalMin < 480) level = 'l3';
    else if (totalMin >= 480) level = 'l4';
    
    const dayLabel = d.getDate();
    heatmapHtml += `<div class="hm-cell ${level}" title="${formatDate(ds)}: ${Math.floor(totalMin/60)}h ${totalMin%60}m" onclick="renderHistoryForDate('${ds}')">${dayLabel}</div>`;
  }
  heatmapHtml += '</div>';
  
  // Build the date list
  let dateListHtml = '';
  dates.forEach(d => {
    const entry = entries[d];
    let totalMin = 0;
    if (entry.rows) entry.rows.forEach(r => { totalMin += (parseInt(r.durHH) || 0) * 60 + (parseInt(r.durMM) || 0); });
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    dateListHtml += `
      <div class="history-date-item glass-card" onclick="renderHistoryForDate('${d}')" style="cursor:pointer; padding:10px; margin-bottom:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:600;">${formatDate(d)}</span>
          <span style="color:var(--primary); font-weight:600;">${hh}h ${mm}m</span>
        </div>
        <div style="font-size:12px; color:var(--text-secondary);">${(entry.rows || []).length} sessions</div>
      </div>
    `;
  });
  
  if (!dateListHtml) dateListHtml = '<p style="text-align:center; color:var(--text-secondary); padding:20px;">No study history yet.</p>';
  
  openModal('<span class="material-symbols-rounded icon-sm">history</span> Study History', `
    <div class="log-modal-tabs">
      <button class="log-modal-tab active" data-tab="overview" onclick="switchLogModalTab('overview')">Overview</button>
      <button class="log-modal-tab" data-tab="dates" onclick="switchLogModalTab('dates')">By Date</button>
      <button class="log-modal-tab" data-tab="detail" onclick="switchLogModalTab('detail')">Day Detail</button>
    </div>
    
    <div id="log-panel-overview" class="log-modal-panel active">
      <div class="weekly-stats glass-card" style="margin-bottom:15px;">
        <h4 style="margin-bottom:10px;"><span class="material-symbols-rounded icon-sm">insights</span> Last 7 Days</h4>
        <div style="display:flex; gap:20px; flex-wrap:wrap;">
          <div><span style="font-size:22px; font-weight:bold; color:var(--primary);">${weekHours}h ${weekMins}m</span><br><small>Total</small></div>
          <div><span style="font-size:22px; font-weight:bold; color:var(--primary);">${weekSessions}</span><br><small>Sessions</small></div>
          <div><span style="font-size:22px; font-weight:bold; color:var(--primary);">${avgHH}h ${avgMM}m</span><br><small>Avg/Day</small></div>
          <div><span style="font-size:22px; font-weight:bold; color:var(--primary);">${weekDays}</span><br><small>Days Active</small></div>
        </div>
      </div>
      <h4 style="margin-bottom:8px;"><span class="material-symbols-rounded icon-sm">calendar_month</span> Last 30 Days</h4>
      ${heatmapHtml}
      <div class="heatmap-legend" style="display:flex; gap:6px; align-items:center; margin-top:8px; font-size:11px; color:var(--text-secondary);">
        <span>Less</span>
        <div class="hm-cell l0" style="width:14px;height:14px;"></div>
        <div class="hm-cell l1" style="width:14px;height:14px;"></div>
        <div class="hm-cell l2" style="width:14px;height:14px;"></div>
        <div class="hm-cell l3" style="width:14px;height:14px;"></div>
        <div class="hm-cell l4" style="width:14px;height:14px;"></div>
        <span>More</span>
      </div>
    </div>
    
    <div id="log-panel-dates" class="log-modal-panel">
      ${dateListHtml}
    </div>
    
    <div id="log-panel-detail" class="log-modal-panel">
      <div id="history-day-detail">
        <p style="color:var(--text-secondary); text-align:center; padding:20px;">Select a date from the heatmap or "By Date" tab to view details.</p>
      </div>
    </div>
  `);
}


// ─── Window Attachments ─────────────────
window.renderTodaysLog = renderTodaysLog;
window.deleteTodaysLog = deleteTodaysLog;
window.openManualLogModal = openManualLogModal;
window.onManualLogSubjChange = onManualLogSubjChange;
window.saveManualLog = saveManualLog;
window.openMockPickerModal = openMockPickerModal;
window.pickMockTask = pickMockTask;
window.switchLogModalTab = switchLogModalTab;
window.renderHistoryForDate = renderHistoryForDate;
window.openLogHistoryModal = openLogHistoryModal;
