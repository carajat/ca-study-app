const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

const newCode = `
window.openPlannerPickerModal = function() {
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
    // Escape quotes for inline onclick
    const subj = (t.subject || '').replace(/'/g, "\\'");
    let topic = (t.chapterId || '').replace(/'/g, "\\'");
    // Actually we need the real chapter name from chapterId, but often chapterId is the name or close to it.
    // Let's just use what we have, if topic doesn't match a dropdown option, we might need to add it as custom.
    const name = (t.name || '').replace(/'/g, "\\'");
    
    html += \`
      <div class="glass-card" style="padding:10px; cursor:pointer; border:1px solid rgba(10,132,255,0.2);" onclick="pickPlannerTask('\${subj}', '\${topic}', '\${name}')">
        <div style="font-weight:600; font-size:14px;">\${t.name}</div>
        <div style="font-size:12px; color:var(--text-secondary);">\${t.subject || 'No Subject'}</div>
      </div>
    \`;
  });
  html += '</div>';
  
  openModal('Select a Task', html);
};

window.pickPlannerTask = function(subj, topic, taskName) {
  closeModal();
  
  // Set Subject
  const subSel = document.getElementById('st-subject');
  if (subj && subSel.querySelector(\`option[value="\${subj}"]\`)) {
    subSel.value = subj;
  } else if (subj) {
    // Add as custom if not found
    const opt = document.createElement('option');
    opt.value = subj;
    opt.textContent = subj;
    subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
    subSel.value = subj;
  }
  
  // Populate Topics for Subject
  onTrackerSubjectChange(true);
  
  // Set Topic
  const topSel = document.getElementById('st-topic');
  if (topic && topSel.querySelector(\`option[value="\${topic}"]\`)) {
    topSel.value = topic;
  } else if (topic) {
    const opt = document.createElement('option');
    opt.value = topic;
    opt.textContent = topic;
    topSel.appendChild(opt);
    topSel.value = topic;
  }
  
  // Set Task Name
  document.getElementById('st-task-desc').value = taskName;
  
  // Update state
  trackerState.subject = subSel.value;
  trackerState.topic = topSel.value;
  trackerState.task = taskName;
  saveTrackerState();
};
`;

// Insert the code somewhere safe, for example right before "// TODAY'S LOG FEATURE"
const marker = "// TODAY'S LOG FEATURE";
const idx = appJs.indexOf(marker);
if (idx !== -1) {
  appJs = appJs.substring(0, idx) + newCode + '\n// ==========================================\n' + appJs.substring(idx);
  fs.writeFileSync('app.js', appJs);
  console.log("Picker logic added");
} else {
  console.log("Marker not found!");
}
