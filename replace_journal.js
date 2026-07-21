const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// Replace old journal with new journal
const startMarker = '// ==========================================\r\n// DAILY JOURNAL FEATURE';
let startIdx = appJs.indexOf(startMarker);
if (startIdx === -1) startIdx = appJs.indexOf('// ==========================================\n// DAILY JOURNAL FEATURE');

const newJournalLogic = `
// ==========================================
// TODAY'S LOG FEATURE (Simplified Journal)
// ==========================================

function getTodayStr() {
  const dateObj = new Date();
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function renderTodaysLog() {
  const container = document.getElementById('tl-list');
  const totalEl = document.getElementById('tl-total-time');
  if (!container) return;
  
  const todayStr = getTodayStr();
  let entries = (DYNAMIC_DATA.journalEntries && DYNAMIC_DATA.journalEntries[todayStr] && DYNAMIC_DATA.journalEntries[todayStr].rows) || [];
  
  container.innerHTML = '';
  let totalMinutes = 0;
  
  if (entries.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">No logs today yet. Start studying!</div>';
    totalEl.textContent = 'Total: 0h 0m';
    return;
  }
  
  entries.forEach((row, idx) => {
    let durText = '';
    const h = parseInt(row.durHH) || 0;
    const m = parseInt(row.durMM) || 0;
    totalMinutes += (h * 60) + m;
    
    if (h > 0) durText += h + 'h ';
    if (m > 0 || h === 0) durText += m + 'm';
    
    const div = document.createElement('div');
    div.style.background = 'rgba(255,255,255,0.03)';
    div.style.border = '1px solid var(--border-color)';
    div.style.borderRadius = '8px';
    div.style.padding = '10px';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'flex-start';
    
    div.innerHTML = \`
      <div style="flex:1;">
        <div style="font-weight:600; font-size:14px; color:var(--text-primary);">\${row.subject}</div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">\${row.topic}</div>
        \${row.tasks ? \\\`<div style="font-size:12px; color:var(--text-muted); margin-top:4px;"><i>\${row.tasks}</i></div>\\\` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px; font-weight:600; color:var(--primary); background:rgba(10,132,255,0.1); padding:2px 6px; border-radius:6px; display:inline-block;">\${durText}</div>
        <div style="margin-top:6px;">
          <button class="icon-btn" style="padding:4px;" onclick="deleteTodaysLog(\${idx})" title="Delete Log"><span class="material-symbols-rounded" style="font-size:16px; color:#ff453a;">delete</span></button>
        </div>
      </div>
    \`;
    container.appendChild(div);
  });
  
  const totH = Math.floor(totalMinutes / 60);
  const totM = totalMinutes % 60;
  totalEl.textContent = \`Total: \${totH}h \${totM}m\`;
}

window.deleteTodaysLog = function(idx) {
  if(confirm('Are you sure you want to delete this log?')) {
    const todayStr = getTodayStr();
    DYNAMIC_DATA.journalEntries[todayStr].rows.splice(idx, 1);
    saveDynamicData();
    renderTodaysLog();
  }
};

window.openManualLogModal = function() {
  const body = document.getElementById('modal-body');
  document.getElementById('modal-title').textContent = 'Add Manual Log';
  
  let subjOptions = '<option value="">Select Subject</option>';
  if(APP_DATA[state.activeGroup]) {
    let subjectsArray = APP_DATA[state.activeGroup].syllabusSubjects || Object.values(APP_DATA[state.activeGroup].syllabus || {});
    subjectsArray.forEach(s => {
      subjOptions += \`<option value="\${s.name}">\${s.name}</option>\`;
    });
  }
  
  body.innerHTML = \`
    <div style="display:flex; flex-direction:column; gap:10px;">
      <select id="ml-subj" class="st-select" onchange="onManualLogSubjChange()">\${subjOptions}<option value="__custom__">Other...</option></select>
      <select id="ml-topic" class="st-select"><option value="">Select Topic</option></select>
      <input type="text" id="ml-task" class="st-input" placeholder="Task Description">
      <div style="display:flex; gap:10px;">
        <div style="flex:1"><label style="font-size:12px; color:var(--text-secondary);">Hours</label><input type="number" id="ml-hh" class="st-input" min="0" value="0" style="margin-bottom:0;"></div>
        <div style="flex:1"><label style="font-size:12px; color:var(--text-secondary);">Minutes</label><input type="number" id="ml-mm" class="st-input" min="0" max="59" value="0" style="margin-bottom:0;"></div>
      </div>
      <button class="btn-primary" style="margin-top:10px; border-radius:10px;" onclick="saveManualLog()">Save Log</button>
    </div>
  \`;
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('modal-overlay').classList.add('show'); // Make sure it animates correctly if using .show
};

window.onManualLogSubjChange = function() {
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
    const group = APP_DATA[state.activeGroup];
    if (group) {
      const subjects = group.syllabusSubjects || Object.values(group.syllabus || {});
      const sData = subjects.find(s => s.name === subj);
      if (sData && sData.chapters) {
        sData.chapters.forEach(ch => {
          const opt = document.createElement('option');
          opt.value = ch.name; opt.textContent = ch.name;
          topSel.appendChild(opt);
        });
      }
    }
  }
};

window.saveManualLog = function() {
  const subj = document.getElementById('ml-subj').value;
  const topic = document.getElementById('ml-topic').value;
  const task = document.getElementById('ml-task').value;
  const hh = parseInt(document.getElementById('ml-hh').value) || 0;
  const mm = parseInt(document.getElementById('ml-mm').value) || 0;
  
  if (!subj) { alert('Please select a subject'); return; }
  if (hh === 0 && mm === 0) { alert('Please enter duration'); return; }
  
  const todayStr = getTodayStr();
  if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
  if (!DYNAMIC_DATA.journalEntries[todayStr]) {
    DYNAMIC_DATA.journalEntries[todayStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
  }
  
  DYNAMIC_DATA.journalEntries[todayStr].rows.push({
    subject: subj,
    topic: topic,
    tasks: task,
    durHH: String(hh),
    durMM: String(mm),
    status: 'Done'
  });
  
  saveDynamicData();
  closeModal();
  renderTodaysLog();
};
`;

appJs = appJs.substring(0, startIdx) + newJournalLogic;

// Also add renderTodaysLog() to trackerStop
appJs = appJs.replace(
  "saveDynamicData();\r\n    document.getElementById('st-status').textContent = '✅ Saved ' + hh + 'h ' + mm + 'm to journal';",
  "saveDynamicData();\r\n    renderTodaysLog();\r\n    document.getElementById('st-status').textContent = '✅ Saved ' + hh + 'h ' + mm + 'm to journal';"
);
appJs = appJs.replace(
  "saveDynamicData();\n    document.getElementById('st-status').textContent = '✅ Saved ' + hh + 'h ' + mm + 'm to journal';",
  "saveDynamicData();\n    renderTodaysLog();\n    document.getElementById('st-status').textContent = '✅ Saved ' + hh + 'h ' + mm + 'm to journal';"
);

// Add renderTodaysLog() to renderDashboard
appJs = appJs.replace("restoreTrackerState();", "restoreTrackerState();\r\n  renderTodaysLog();");
appJs = appJs.replace("restoreTrackerState();", "restoreTrackerState();\n  renderTodaysLog();"); // in case \r wasn't matched above

fs.writeFileSync('app.js', appJs);
console.log("Updated app.js correctly.");

