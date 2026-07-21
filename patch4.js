const fs = require('fs');
const appFile = 'C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/app.js';
let content = fs.readFileSync(appFile, 'utf8');

// The exact correct code block to insert:
const correctCode = `function changeJournalDate(delta) {
  currentJournalDate.setDate(currentJournalDate.getDate() + delta);
  const dateStr = getJournalDateString(currentJournalDate);
  document.getElementById('journal-date-picker').value = dateStr;
  loadJournal(dateStr);
}

function loadJournal(dateStr) {
  if (!dateStr) return;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    currentJournalDate = new Date(parts[0], parts[1]-1, parts[2]);
  }
  
  if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
  const entry = DYNAMIC_DATA.journalEntries[dateStr] || {
    sleep: '', breaks: '', wasted: '', feeling: '', rows: []
  };

  document.getElementById('j-sleep').value = entry.sleep || '';
  document.getElementById('j-breaks').value = entry.breaks || '';
  document.getElementById('j-wasted').value = entry.wasted || '';
  document.getElementById('j-feeling').value = entry.feeling || '';

  const tbody = document.getElementById('journal-tbody');
  tbody.innerHTML = '';
  if (entry.rows && entry.rows.length > 0) {
    entry.rows.forEach(r => addJournalRow(r));
  } else {
    addJournalRow(); // add at least one empty row
  }

  // Calculate Days Left for the currently selected group
  let targetDateStr = APP_DATA[currentGroup].exam.date;
  let targetDate = new Date(targetDateStr);
  let timeDiff = targetDate.getTime() - currentJournalDate.getTime();
  let daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  document.getElementById('j-days-left').innerText = daysLeft > 0 ? daysLeft : 0;

  calculateJournalStats();
}

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
}

window.updateSubjectTopics = function(sel) {
  const tr = sel.closest('tr');
  const subjCustom = tr.querySelector('.j-subject-custom');
  if(sel.value === 'Custom') {
    subjCustom.style.display = 'block';
  } else {
    subjCustom.style.display = 'none';
  }

  const topicSel = tr.querySelector('.j-topic');
  const subj = sel.value;
  topicSel.innerHTML = '<option value="">Select Topic</option>';
  
  if (subj && subj !== 'Custom' && APP_DATA[currentGroup]) {
    const sData = APP_DATA[currentGroup].subjects.find(s => s.name === subj);
    if (sData && sData.chapters) {
      sData.chapters.forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch.name;
        opt.innerText = ch.name;
        topicSel.appendChild(opt);
      });
    }
  }
  const customOpt = document.createElement('option');
  customOpt.value = 'Custom';
  customOpt.innerText = 'Custom...';
  topicSel.appendChild(customOpt);
  
  window.checkCustomTopic(topicSel);
  saveJournal();
};

window.checkCustomTopic = function(topicSel) {
  const tr = topicSel.closest('tr');
  let customInput = tr.querySelector('.j-topic-custom');
  if(topicSel.value === 'Custom') {
    customInput.style.display = 'block';
  } else {
    customInput.style.display = 'none';
  }
  saveJournal();
};`;

// we will slice everything from the start of function changeJournalDate to the start of function addJournalRow
content = content.replace(/function changeJournalDate\([\s\S]*?function addJournalRow\(/, correctCode + '\n\nfunction addJournalRow(');

// Also remove any stray extra `}` that might have been left over if they were outside the replaced regex
fs.writeFileSync(appFile, content);
