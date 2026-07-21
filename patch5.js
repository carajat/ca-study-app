const fs = require('fs');
const appFile = 'C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/app.js';
let content = fs.readFileSync(appFile, 'utf8');

// Append the new function
const newFunc = `
window.updateOngoingJournalTask = function() {
  const ojtWidget = document.getElementById('ongoing-journal-task');
  if(!ojtWidget) return;
  
  const todayStr = getJournalDateString(new Date());
  if(!DYNAMIC_DATA.journalEntries || !DYNAMIC_DATA.journalEntries[todayStr]) {
    ojtWidget.style.display = 'none';
    return;
  }
  
  const entry = DYNAMIC_DATA.journalEntries[todayStr];
  if(!entry.rows || entry.rows.length === 0) {
    ojtWidget.style.display = 'none';
    return;
  }
  
  let ongoingRow = entry.rows.find(r => r.status === 'Pending');
  if(!ongoingRow) {
    ongoingRow = entry.rows[entry.rows.length - 1];
  }
  
  if(!ongoingRow || (!ongoingRow.subject && !ongoingRow.topic && !ongoingRow.tasks)) {
    ojtWidget.style.display = 'none';
    return;
  }
  
  ojtWidget.style.display = 'block';
  
  let subjText = ongoingRow.subject === 'Custom' ? ongoingRow.subjectCustom : ongoingRow.subject;
  let topicText = ongoingRow.topic === 'Custom' ? ongoingRow.topicCustom : ongoingRow.topic;
  
  document.getElementById('ojt-subject').textContent = subjText || 'No Subject';
  document.getElementById('ojt-topic').textContent = topicText || 'No Topic';
  document.getElementById('ojt-task').textContent = ongoingRow.tasks || 'No specific task details';
  
  let timeStr = '--:--';
  if(ongoingRow.durHH || ongoingRow.durMM) {
     timeStr = (ongoingRow.durHH || '00').padStart(2, '0') + ':' + (ongoingRow.durMM || '00').padStart(2, '0');
  }
  document.getElementById('ojt-time').textContent = timeStr + ' logged';
};

// Also trigger on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { if(window.updateOngoingJournalTask) window.updateOngoingJournalTask(); }, 1000);
});
`;

if (!content.includes('window.updateOngoingJournalTask = function')) {
  content += '\n' + newFunc;
}

// update switchTab
content = content.replace(
  "    renderDashboard();",
  "    renderDashboard();\n    if(window.updateOngoingJournalTask) window.updateOngoingJournalTask();"
);

// update saveJournal
content = content.replace(
  "  saveData();\n}",
  "  saveData();\n  if(window.updateOngoingJournalTask) window.updateOngoingJournalTask();\n}"
);

fs.writeFileSync(appFile, content);
