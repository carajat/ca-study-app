// ========================================
// tracker.js — Live Study Timer
// ========================================

import { state, DYNAMIC_DATA, saveDynamicData } from './state.js';
import { getTodayStr, showToast } from './utils.js';
import { openModal, closeModal } from './modals.js';
import { getPlannerTasks } from './state.js';

export var trackerState = {
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedTime: 0,
  pauseStart: null,
  intervalId: null,
  subject: '',
  topic: '',
  task: ''
};

export function restoreTrackerState() {
  try {
    var saved = localStorage.getItem('ca_study_tracker_state');
    if (saved) {
      var s = JSON.parse(saved);
      if (s.isRunning || s.isPaused) {
        trackerState.startTime = s.startTime;
        trackerState.pausedTime = s.pausedTime || 0;
        trackerState.subject = s.subject || '';
        trackerState.topic = s.topic || '';
        trackerState.task = s.task || '';
        if (s.isPaused) {
          trackerState.isPaused = true;
          trackerState.pauseStart = s.pauseStart;
          if (trackerState.intervalId) { clearInterval(trackerState.intervalId); trackerState.intervalId = null; }
          updateTrackerUI('paused');
          updateTimerDisplay();
        } else {
          trackerState.isRunning = true;
          updateTrackerUI('running');
          if (trackerState.intervalId) clearInterval(trackerState.intervalId);
          trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
        }
        var subSel = document.getElementById('st-subject');
        if (subSel) subSel.value = trackerState.subject;
        onTrackerSubjectChange(true);
        var topSel = document.getElementById('st-topic');
        if (topSel) topSel.value = trackerState.topic;
        var taskInp = document.getElementById('st-task-desc');
        if (taskInp) taskInp.value = trackerState.task;
      }
    } else {
      trackerState.isRunning = false;
      trackerState.isPaused = false;
      trackerState.startTime = null;
      trackerState.pausedTime = 0;
      trackerState.pauseStart = null;
      if (trackerState.intervalId) { clearInterval(trackerState.intervalId); trackerState.intervalId = null; }
      updateTrackerUI('idle');
      var el = document.getElementById('st-timer-value');
      if (el) el.textContent = '00:00:00';
    }
  } catch(e) { console.error('restoreTrackerState', e); }
}

export function saveTrackerState() {
  try {
    if (trackerState.isRunning || trackerState.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify({
        isRunning: trackerState.isRunning, isPaused: trackerState.isPaused,
        startTime: trackerState.startTime, pausedTime: trackerState.pausedTime,
        pauseStart: trackerState.pauseStart, subject: trackerState.subject,
        topic: trackerState.topic, task: trackerState.task
      }));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
  } catch(e) {}
}

export function populateTrackerSubjects() {
  var sel = document.getElementById('st-subject');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select Subject</option>';
  var subjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    subjects.push(s);
    if (s.type === 'folder' && s.children) subjects = subjects.concat(s.children);
  });
  subjects.forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s.name; opt.textContent = s.name;
    sel.appendChild(opt);
  });
  var customOpt = document.createElement('option');
  customOpt.value = '__custom__'; customOpt.textContent = 'Other...';
  sel.appendChild(customOpt);
}

export function onTrackerSubjectChange(restoring) {
  var subSel = document.getElementById('st-subject');
  var topSel = document.getElementById('st-topic');
  if (!subSel || !topSel) return;
  var subj = subSel.value;
  topSel.innerHTML = '<option value="">Select Topic</option>';
  if (subj === '__custom__') {
    var name = prompt('Enter subject name:');
    if (name) {
      var opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
      subSel.value = name;
    } else { subSel.value = ''; return; }
  }
  if (subj && subj !== '__custom__') {
    var subjects = [];
    (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
      subjects.push(s);
    if (s.type === 'folder' && s.children) subjects = subjects.concat(s.children);
    });
    var sData = subjects.find(function(s) { return s.name === subj; });
    if (sData) {
      let arr = sData.chapters || sData.children || [];
      arr.forEach(function(ch) {
        var opt = document.createElement('option');
        opt.value = ch.name; opt.textContent = ch.name;
        topSel.appendChild(opt);
      });
    }
  }
  if (!restoring) { trackerState.subject = subSel.value; saveTrackerState(); }
}

export function onTrackerTopicChange() {
  trackerState.topic = document.getElementById('st-topic').value;
  saveTrackerState();
}

export function getElapsedMs() {
  if (!trackerState.startTime) return 0;
  var now = (typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  var elapsed = now - trackerState.startTime - trackerState.pausedTime;
  if (trackerState.isPaused && trackerState.pauseStart) elapsed -= (now - trackerState.pauseStart);
  return Math.max(0, elapsed);
}

export function formatElapsed(ms) {
  var totalSec = Math.floor(ms / 1000);
  var hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  var mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  var ss = String(totalSec % 60).padStart(2, '0');
  return hh + ':' + mm + ':' + ss;
}

export function updateTimerDisplay() {
  var el = document.getElementById('st-timer-value');
  if (el) el.textContent = formatElapsed(getElapsedMs());
}

export function updateTrackerUI(mode) {
  var timerDisp = document.getElementById('st-timer-display');
  var btnStart = document.getElementById('st-btn-start');
  var btnPause = document.getElementById('st-btn-pause');
  var btnResume = document.getElementById('st-btn-resume');
  var btnStop = document.getElementById('st-btn-stop');
  var statusEl = document.getElementById('st-status');
  var subSel = document.getElementById('st-subject');
  var topSel = document.getElementById('st-topic');
  var taskInp = document.getElementById('st-task-desc');
  if (!timerDisp) return;
  timerDisp.className = 'st-timer-display';
  if (mode === 'idle') {
    btnStart.style.display = 'flex'; btnPause.style.display = 'none';
    btnResume.style.display = 'none'; btnStop.style.display = 'none';
    subSel.disabled = false; topSel.disabled = false; taskInp.disabled = false;
    statusEl.textContent = '';
  } else if (mode === 'running') {
    timerDisp.classList.add('running');
    btnStart.style.display = 'none'; btnPause.style.display = 'flex';
    btnResume.style.display = 'none'; btnStop.style.display = 'flex';
    subSel.disabled = true; topSel.disabled = true; taskInp.disabled = false;
    statusEl.innerHTML = '<span class="material-symbols-rounded icon-sm" style="color:var(--success-color); vertical-align:middle; font-size:16px;">radio_button_checked</span> Studying...';
  } else if (mode === 'paused') {
    timerDisp.classList.add('paused');
    btnStart.style.display = 'none'; btnPause.style.display = 'none';
    btnResume.style.display = 'flex'; btnStop.style.display = 'flex';
    subSel.disabled = true; topSel.disabled = true; taskInp.disabled = false;
    statusEl.textContent = '⏸️ Paused';
  }
}

export function trackerStart() {
  var subj = document.getElementById('st-subject').value;
  if (!subj) {
    document.getElementById('st-status').innerHTML = '<span class="material-symbols-rounded icon-sm" style="color:var(--accent); vertical-align:middle; font-size:16px;">warning</span> Please select a subject first';
    return;
  }
  trackerState.isRunning = true; trackerState.isPaused = false;
  trackerState.startTime = (typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now()); trackerState.pausedTime = 0; trackerState.pauseStart = null;
  trackerState.subject = document.getElementById('st-subject').value;
  trackerState.topic = document.getElementById('st-topic').value;
  trackerState.task = document.getElementById('st-task-desc').value;
  updateTrackerUI('running');
  trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
  saveTrackerState();
}

export function trackerPause() {
  trackerState.isRunning = false; trackerState.isPaused = true;
  trackerState.pauseStart = (typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  clearInterval(trackerState.intervalId);
  updateTrackerUI('paused'); saveTrackerState();
}

export function trackerResume() {
  if (trackerState.pauseStart) trackerState.pausedTime += ((typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now()) - trackerState.pauseStart);
  trackerState.pauseStart = null; trackerState.isRunning = true; trackerState.isPaused = false;
  updateTrackerUI('running');
  trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
  saveTrackerState();
}

export function trackerStop() {
  if (trackerState.isPaused && trackerState.pauseStart) {
    trackerState.pausedTime += ((typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now()) - trackerState.pauseStart);
    trackerState.pauseStart = null;
  }
  var elapsedMs = getElapsedMs();
  var totalMinutes = Math.round(elapsedMs / 60000);
  var hh = Math.floor(totalMinutes / 60);
  var mm = totalMinutes % 60;
  clearInterval(trackerState.intervalId);
  var subject = trackerState.subject || document.getElementById('st-subject').value;
  var topic = trackerState.topic || document.getElementById('st-topic').value;
  var task = document.getElementById('st-task-desc').value;
  
  // Reset tracker state BEFORE saving to prevent Firebase triggering an active tracker
  trackerState.isRunning = false; trackerState.isPaused = false;
  trackerState.startTime = null; trackerState.pausedTime = 0; trackerState.pauseStart = null;
  updateTrackerUI('idle');
  document.getElementById('st-timer-value').textContent = '00:00:00';
  saveTrackerState();

  if (totalMinutes >= 1) {
    var today = new Date();
    var todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
    if (!DYNAMIC_DATA.journalEntries[todayStr]) {
      DYNAMIC_DATA.journalEntries[todayStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
    }
    if (!DYNAMIC_DATA.journalEntries[todayStr].rows) { DYNAMIC_DATA.journalEntries[todayStr].rows = []; }
    DYNAMIC_DATA.journalEntries[todayStr].rows.push({
      subject: subject, topic: topic, tasks: task,
      durHH: String(hh), durMM: String(mm), status: 'Done'
    });
    saveDynamicData();
    if (typeof window.renderTodaysLog === 'function') window.renderTodaysLog();
    document.getElementById('st-status').innerHTML = '<span class="material-symbols-rounded icon-sm" style="color:var(--success-color); vertical-align:middle; font-size:16px;">check_circle</span> Saved ' + hh + 'h ' + mm + 'm to journal';
  } else {
    document.getElementById('st-status').textContent = 'Session too short (< 1 min), not saved';
  }
  
  setTimeout(function() {
    var st = document.getElementById('st-status');
    if (st) st.textContent = '';
  }, 4000);
}


// ==========================================

export function openPlannerPickerModal(target) {
  if (target === undefined) target = 'tracker';
  const dateStr = getTodayStr();
  const tasksObj = getPlannerTasks();
  const todayTasks = tasksObj[dateStr] || [];
  
  const pending = todayTasks.filter(t => !t.done);
  if (pending.length === 0) {
    alert("No pending tasks in today's planner!");
    return;
  }
  
  let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
  pending.forEach((t, idx) => {
    let subjName = t.subject || '';
    let topicName = t.chapterId || '';
    
    const sObj = (typeof window.findSubj === 'function') ? window.findSubj(t.subject) : null;
    if (sObj) {
      subjName = sObj.name;
      if (t.chapterId && sObj.chapters) {
        const cObj = sObj.chapters.find(c => c.id === t.chapterId);
        if (cObj) topicName = cObj.name;
      }
    }
    
    const subj = subjName.replace(/'/g, "\\'");
    const topic = topicName.replace(/'/g, "\\'");
    const name = (t.name || '').replace(/'/g, "\\'");
    
    html += `
      <div class="glass-card" style="padding:10px; cursor:pointer; border:1px solid rgba(10,132,255,0.2);" onclick="pickPlannerTask('${subj}', '${topic}', '${name}', '${target}')">
        <div style="font-weight:600; font-size:14px;">${t.name}</div>
        <div style="font-size:12px; color:var(--text-secondary);">${subjName || 'No Subject'} ${topicName ? '— ' + topicName : ''}</div>
      </div>
    `;
  });
  html += '</div>';
  
  openModal('Select a Task', html);
}

export function pickPlannerTask(subj, topic, taskName, target) {
  closeModal();
  
  const isManual = (target === 'manual');
  const subjId = isManual ? 'ml-subj' : 'st-subject';
  const topicId = isManual ? 'ml-topic' : 'st-topic';
  const taskId = isManual ? 'ml-task' : 'st-task-desc';
  
  if (isManual) {
    if (typeof window.openManualLogModal === 'function') window.openManualLogModal();
    setTimeout(() => populateFields(), 50);
  } else {
    populateFields();
  }
  
  function populateFields() {
    const subSel = document.getElementById(subjId);
    if (subj && subSel.querySelector(`option[value="${subj}"]`)) {
      subSel.value = subj;
    } else if (subj) {
      const opt = document.createElement('option');
      opt.value = subj; opt.textContent = subj;
      subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
      subSel.value = subj;
    }
    
    if (isManual) { if (typeof window.onManualLogSubjChange === 'function') window.onManualLogSubjChange(); }
    else onTrackerSubjectChange(true);
    
    const topSel = document.getElementById(topicId);
    if (topic && topSel.querySelector(`option[value="${topic}"]`)) {
      topSel.value = topic;
    } else if (topic) {
      const opt = document.createElement('option');
      opt.value = topic; opt.textContent = topic;
      topSel.appendChild(opt);
      topSel.value = topic;
    }
    
    document.getElementById(taskId).value = taskName;
    
    if (!isManual) {
      trackerState.subject = subSel.value;
      trackerState.topic = topSel.value;
      trackerState.task = taskName;
      saveTrackerState();
    }
  }
}

// ─── Window Attachments ─────────────────
window.trackerState = trackerState;
window.trackerStart = trackerStart;
window.trackerPause = trackerPause;
window.trackerResume = trackerResume;
window.trackerStop = trackerStop;
window.restoreTrackerState = restoreTrackerState;
window.populateTrackerSubjects = populateTrackerSubjects;
window.onTrackerSubjectChange = onTrackerSubjectChange;
window.onTrackerTopicChange = onTrackerTopicChange;
window.openPlannerPickerModal = openPlannerPickerModal;
window.pickPlannerTask = pickPlannerTask;
window.saveTrackerState = saveTrackerState;
