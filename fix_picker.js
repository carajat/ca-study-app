const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix HTML button style
html = html.replace(
  '<span class="material-symbols-rounded" style="font-size:14px; margin-right:4px; vertical-align:middle;">assignment</span>Pick from Planner',
  '<span class="material-symbols-rounded" style="font-size:16px; margin-right:4px; vertical-align:middle;">assignment</span>Planner Task'
);
html = html.replace('onclick="openPlannerPickerModal()"', 'onclick="openPlannerPickerModal(\'tracker\')"');

fs.writeFileSync('index.html', html);

// 2. Fix JS logic for picker
const oldPickerStart = 'window.openPlannerPickerModal = function() {';
const oldPickerEnd = 'saveTrackerState();\r\n};';
const oldPickerEndLF = 'saveTrackerState();\n};';

let startIdx = appJs.indexOf(oldPickerStart);
let endIdx = appJs.indexOf(oldPickerEnd);
let len = oldPickerEnd.length;
if (endIdx === -1) {
  endIdx = appJs.indexOf(oldPickerEndLF);
  len = oldPickerEndLF.length;
}

if (startIdx !== -1 && endIdx !== -1) {
  const newPickerLogic = `window.openPlannerPickerModal = function(target = 'tracker') {
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
    
    const sObj = findSubj(t.subject);
    if (sObj) {
      subjName = sObj.name;
      if (t.chapterId && sObj.chapters) {
        const cObj = sObj.chapters.find(c => c.id === t.chapterId);
        if (cObj) topicName = cObj.name;
      }
    }
    
    const subj = subjName.replace(/'/g, "\\\\'");
    const topic = topicName.replace(/'/g, "\\\\'");
    const name = (t.name || '').replace(/'/g, "\\\\'");
    
    html += \`
      <div class="glass-card" style="padding:10px; cursor:pointer; border:1px solid rgba(10,132,255,0.2);" onclick="pickPlannerTask('\${subj}', '\${topic}', '\${name}', '\${target}')">
        <div style="font-weight:600; font-size:14px;">\${t.name}</div>
        <div style="font-size:12px; color:var(--text-secondary);">\${subjName || 'No Subject'} \${topicName ? '— ' + topicName : ''}</div>
      </div>
    \`;
  });
  html += '</div>';
  
  openModal('Select a Task', html);
};

window.pickPlannerTask = function(subj, topic, taskName, target) {
  closeModal();
  
  const isManual = (target === 'manual');
  const subjId = isManual ? 'ml-subj' : 'st-subject';
  const topicId = isManual ? 'ml-topic' : 'st-topic';
  const taskId = isManual ? 'ml-task' : 'st-task-desc';
  
  if (isManual) {
    openManualLogModal();
    setTimeout(() => populateFields(), 50);
  } else {
    populateFields();
  }
  
  function populateFields() {
    const subSel = document.getElementById(subjId);
    if (subj && subSel.querySelector(\`option[value="\${subj}"]\`)) {
      subSel.value = subj;
    } else if (subj) {
      const opt = document.createElement('option');
      opt.value = subj; opt.textContent = subj;
      subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
      subSel.value = subj;
    }
    
    if (isManual) onManualLogSubjChange();
    else onTrackerSubjectChange(true);
    
    const topSel = document.getElementById(topicId);
    if (topic && topSel.querySelector(\`option[value="\${topic}"]\`)) {
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
};`;

  appJs = appJs.substring(0, startIdx) + newPickerLogic + appJs.substring(endIdx + len);
  
  // Also add the button to openManualLogModal
  const manualLogMarker = "document.getElementById('modal-title').textContent = 'Add Manual Log';";
  appJs = appJs.replace(manualLogMarker, manualLogMarker + "\n  document.getElementById('modal-title').innerHTML = 'Add Manual Log <button class=\"icon-btn\" style=\"font-size: 11px; padding: 2px 6px; border-radius: 6px; background: rgba(10,132,255,0.1); color: var(--primary); margin-left: 10px; vertical-align: middle;\" onclick=\"openPlannerPickerModal(\\'manual\\')\"><span class=\"material-symbols-rounded\" style=\"font-size:14px; margin-right:4px; vertical-align:middle;\">assignment</span>Planner Task</button>';");
  
  fs.writeFileSync('app.js', appJs);
  console.log("Updated picker logic in app.js");
} else {
  console.log("Could not find picker logic to replace");
}
