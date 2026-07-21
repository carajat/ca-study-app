const fs = require('fs');
const appFile = 'C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/app.js';
let content = fs.readFileSync(appFile, 'utf8');

// The multi_replace_file_content tool just messed up loadJournalHistory. Let's rebuild it completely.
const fixedLoadHistory = `function loadJournalHistory() {
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
      entry.rows.forEach(r => {
        if(r.duration !== undefined) {
          totalDur += parseFloat(r.duration || 0);
        } else {
          let hh = parseInt(r.durHH) || 0;
          let mm = parseInt(r.durMM) || 0;
          totalDur += (hh + mm/60);
        }
      });
    }
    totalDur = totalDur.toFixed(2);
    
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
}`;

// I'll replace the broken loadJournalHistory function which starts around function loadJournalHistory()
content = content.replace(/function loadJournalHistory\(\)[\s\S]*?function loadJournal\(/, fixedLoadHistory + '\n\nfunction loadJournal(');
fs.writeFileSync(appFile, content);
