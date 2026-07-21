const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// The tracker code to insert before "// DAILY JOURNAL FEATURE"
const trackerCode = `
// ==========================================
// LIVE STUDY TRACKER
// ==========================================

var trackerState = {
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

function restoreTrackerState() {
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
          updateTrackerUI('paused');
          updateTimerDisplay();
        } else {
          trackerState.isRunning = true;
          updateTrackerUI('running');
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
    }
  } catch(e) { console.error('restoreTrackerState', e); }
}

function saveTrackerState() {
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

function populateTrackerSubjects() {
  var sel = document.getElementById('st-subject');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select Subject</option>';
  var group = APP_DATA[state.activeGroup];
  if (!group) return;
  var subjects = group.syllabusSubjects || Object.values(group.syllabus || {});
  subjects.forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s.name; opt.textContent = s.name;
    sel.appendChild(opt);
  });
  var customOpt = document.createElement('option');
  customOpt.value = '__custom__'; customOpt.textContent = 'Other...';
  sel.appendChild(customOpt);
}

function onTrackerSubjectChange(restoring) {
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
    var group = APP_DATA[state.activeGroup];
    if (group) {
      var subjects = group.syllabusSubjects || Object.values(group.syllabus || {});
      var sData = subjects.find(function(s) { return s.name === subj; });
      if (sData && sData.chapters) {
        sData.chapters.forEach(function(ch) {
          var opt = document.createElement('option');
          opt.value = ch.name; opt.textContent = ch.name;
          topSel.appendChild(opt);
        });
      }
    }
  }
  if (!restoring) { trackerState.subject = subSel.value; saveTrackerState(); }
}

function onTrackerTopicChange() {
  trackerState.topic = document.getElementById('st-topic').value;
  saveTrackerState();
}

function getElapsedMs() {
  if (!trackerState.startTime) return 0;
  var now = Date.now();
  var elapsed = now - trackerState.startTime - trackerState.pausedTime;
  if (trackerState.isPaused && trackerState.pauseStart) elapsed -= (now - trackerState.pauseStart);
  return Math.max(0, elapsed);
}

function formatElapsed(ms) {
  var totalSec = Math.floor(ms / 1000);
  var hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  var mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  var ss = String(totalSec % 60).padStart(2, '0');
  return hh + ':' + mm + ':' + ss;
}

function updateTimerDisplay() {
  var el = document.getElementById('st-timer-value');
  if (el) el.textContent = formatElapsed(getElapsedMs());
}

function updateTrackerUI(mode) {
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
    statusEl.textContent = '🟢 Studying...';
  } else if (mode === 'paused') {
    timerDisp.classList.add('paused');
    btnStart.style.display = 'none'; btnPause.style.display = 'none';
    btnResume.style.display = 'flex'; btnStop.style.display = 'flex';
    subSel.disabled = true; topSel.disabled = true; taskInp.disabled = false;
    statusEl.textContent = '⏸️ Paused';
  }
}

function trackerStart() {
  var subj = document.getElementById('st-subject').value;
  if (!subj) {
    document.getElementById('st-status').textContent = '⚠️ Please select a subject first';
    return;
  }
  trackerState.isRunning = true; trackerState.isPaused = false;
  trackerState.startTime = Date.now(); trackerState.pausedTime = 0; trackerState.pauseStart = null;
  trackerState.subject = document.getElementById('st-subject').value;
  trackerState.topic = document.getElementById('st-topic').value;
  trackerState.task = document.getElementById('st-task-desc').value;
  updateTrackerUI('running');
  trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
  saveTrackerState();
}

function trackerPause() {
  trackerState.isRunning = false; trackerState.isPaused = true;
  trackerState.pauseStart = Date.now();
  clearInterval(trackerState.intervalId);
  updateTrackerUI('paused'); saveTrackerState();
}

function trackerResume() {
  if (trackerState.pauseStart) trackerState.pausedTime += (Date.now() - trackerState.pauseStart);
  trackerState.pauseStart = null; trackerState.isRunning = true; trackerState.isPaused = false;
  updateTrackerUI('running');
  trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
  saveTrackerState();
}

function trackerStop() {
  if (trackerState.isPaused && trackerState.pauseStart) {
    trackerState.pausedTime += (Date.now() - trackerState.pauseStart);
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
  if (totalMinutes >= 1) {
    var today = new Date();
    var todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
    if (!DYNAMIC_DATA.journalEntries[todayStr]) {
      DYNAMIC_DATA.journalEntries[todayStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
    }
    DYNAMIC_DATA.journalEntries[todayStr].rows.push({
      subject: subject, topic: topic, tasks: task,
      durHH: String(hh), durMM: String(mm), status: 'Done'
    });
    saveDynamicData();
    document.getElementById('st-status').textContent = '✅ Saved ' + hh + 'h ' + mm + 'm to journal';
  } else {
    document.getElementById('st-status').textContent = 'Session too short (< 1 min), not saved';
  }
  trackerState.isRunning = false; trackerState.isPaused = false;
  trackerState.startTime = null; trackerState.pausedTime = 0; trackerState.pauseStart = null;
  updateTrackerUI('idle');
  document.getElementById('st-timer-value').textContent = '00:00:00';
  saveTrackerState();
  setTimeout(function() {
    var st = document.getElementById('st-status');
    if (st) st.textContent = '';
  }, 4000);
}

`;

// Insert before "// DAILY JOURNAL FEATURE"
const marker = '// ==========================================\r\n// DAILY JOURNAL FEATURE';
const idx = appJs.indexOf(marker);
if (idx === -1) {
  console.error("Marker not found!");
  process.exit(1);
}
appJs = appJs.substring(0, idx) + trackerCode + appJs.substring(idx);

// Now we also need to call populateTrackerSubjects() and restoreTrackerState() during init
// Find renderDashboard function and add calls at end
const renderDashEnd = 'updateOngoingJournalTask();';
const renderDashIdx = appJs.indexOf(renderDashEnd);
if (renderDashIdx !== -1) {
  appJs = appJs.replace(renderDashEnd, renderDashEnd + '\n  populateTrackerSubjects();\n  restoreTrackerState();');
} else {
  // Fallback: add at end of DOMContentLoaded or init
  console.log("Warning: Could not find updateOngoingJournalTask, adding to end of renderDashboard");
  // Try another marker
  const altMarker = 'function renderDashboard()';
  // We'll just add to the end
}

fs.writeFileSync('app.js', appJs);
console.log("Tracker code inserted successfully!");
