const fs = require('fs');

const appFile = 'C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/app.js';
let content = fs.readFileSync(appFile, 'utf8');

const replacement = `
function switchJournalTab(tab) {
  document.getElementById('j-tab-editor').classList.remove('active');
  document.getElementById('j-tab-history').classList.remove('active');
  
  if(tab === 'editor') {
    document.getElementById('j-tab-editor').classList.add('active');
    document.getElementById('journal-content-area').style.display = 'flex';
    document.getElementById('journal-history-area').style.display = 'none';
  } else {
    document.getElementById('j-tab-history').classList.add('active');
    document.getElementById('journal-content-area').style.display = 'none';
    document.getElementById('journal-history-area').style.display = 'block';
    loadJournalHistory();
  }
}

function loadJournalHistory() {
  const container = document.getElementById('journal-history-list');
  container.innerHTML = '';
  
  if(!DYNAMIC_DATA.journalEntries || Object.keys(DYNAMIC_DATA.journalEntries).length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No history found.</p>';
    return;
  }
  
  // Sort by date descending
  const dates = Object.keys(DYNAMIC_DATA.journalEntries).sort((a,b) => new Date(b) - new Date(a));
  
  dates.forEach(d => {
    const entry = DYNAMIC_DATA.journalEntries[d];
    let totalDur = 0;
    if(entry.rows) {
      entry.rows.forEach(r => totalDur += parseFloat(r.duration || 0));
    }
    
    const card = document.createElement('div');
    card.className = 'history-card';
    card.onclick = () => {
      document.getElementById('journal-date-picker').value = d;
      loadJournal(d);
      switchJournalTab('editor');
    };
    
    card.innerHTML = \`
      <div>
        <div class="hc-date">\${d}</div>
        <div class="hc-stats">Study: \${totalDur}h | Sleep: \${entry.sleep || 0}h</div>
      </div>
      <div>
         <span style="color:var(--primary); font-weight:600;">\${entry.feeling || 'Logged'}</span>
         <span class="material-symbols-rounded" style="vertical-align:middle; font-size:20px; color:var(--text-muted);">arrow_forward_ios</span>
      </div>
    \`;
    container.appendChild(card);
  });
}

function addJournalRow(data = {}) {
  const tbody = document.getElementById('journal-tbody');
  const div = document.createElement('div');
  div.className = 'task-card';
  div.innerHTML = \`
    <div class="task-row">
      <input type="text" class="j-subject elegant-input" value="\${data.subject || ''}" onchange="saveJournal()" placeholder="Subject">
      <input type="text" class="j-topic elegant-input" value="\${data.topic || ''}" onchange="saveJournal()" placeholder="Topic Covered">
    </div>
    <div class="task-row">
      <input type="text" class="j-tasks elegant-input" value="\${data.tasks || ''}" onchange="saveJournal()" placeholder="Tasks Done">
    </div>
    <div class="task-row">
      <input type="number" class="j-duration elegant-input" value="\${data.duration || ''}" onchange="saveJournal()" step="0.5" placeholder="Duration (Hrs)">
      <select class="j-status elegant-select" onchange="saveJournal()">
        <option value="Done" \${data.status==='Done'?'selected':''}>Done</option>
        <option value="Pending" \${data.status==='Pending'?'selected':''}>Pending</option>
        <option value="Skipped" \${data.status==='Skipped'?'selected':''}>Skipped</option>
      </select>
    </div>
    <div class="task-row">
      <input type="text" class="j-remarks elegant-input" value="\${data.remarks || ''}" onchange="saveJournal()" placeholder="Remarks">
      <button class="icon-btn" style="color:var(--danger); padding:10px;" onclick="removeJournalRow(this)"><span class="material-symbols-rounded">delete</span></button>
    </div>
  \`;
  tbody.appendChild(div);
  calculateJournalStats();
}

function removeJournalRow(btn) {
  btn.closest('.task-card').remove();
  saveJournal();
}

function calculateJournalStats() {
  const durations = Array.from(document.querySelectorAll('.j-duration')).map(inp => parseFloat(inp.value) || 0);
  const totalStudy = durations.reduce((a, b) => a + b, 0);
  document.getElementById('j-total-time').innerText = totalStudy + 'h';

  const sleep = parseFloat(document.getElementById('j-sleep').value) || 0;
  const breaks = parseFloat(document.getElementById('j-breaks').value) || 0;
  const wasted = parseFloat(document.getElementById('j-wasted').value) || 0;
  
  const hoursLeft = 24 - sleep - breaks - wasted - totalStudy;
  document.getElementById('j-hours-left').innerText = hoursLeft.toFixed(1) + 'h';
}

function saveJournal() {
  const dateStr = document.getElementById('journal-date-picker').value;
  if (!dateStr) return;

  if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
  
  const rows = Array.from(document.querySelectorAll('#journal-tbody .task-card')).map(card => {
    return {
      subject: card.querySelector('.j-subject').value,
      topic: card.querySelector('.j-topic').value,
      tasks: card.querySelector('.j-tasks').value,
      duration: card.querySelector('.j-duration').value,
      status: card.querySelector('.j-status').value,
      remarks: card.querySelector('.j-remarks').value
    };
  });

  DYNAMIC_DATA.journalEntries[dateStr] = {
    sleep: document.getElementById('j-sleep').value,
    breaks: document.getElementById('j-breaks').value,
    wasted: document.getElementById('j-wasted').value,
    feeling: document.getElementById('j-feeling').value,
    rows: rows
  };

  calculateJournalStats();
  saveData();
}

async function generateJournalReport() {
`;

content = content.replace(/function addJournalRow[\s\S]*?async function generateJournalReport\(\) \{/, replacement);

fs.writeFileSync(appFile, content);

