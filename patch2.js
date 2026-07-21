const fs = require('fs');

const appFile = 'C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/app.js';
let content = fs.readFileSync(appFile, 'utf8');

const newFunctions = `
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
};

function addJournalRow(data = {}) {
  const tbody = document.getElementById('journal-tbody');
  const tr = document.createElement('tr');
  
  let subjOptions = '<option value="">Select Subject</option>';
  if(APP_DATA[currentGroup]) {
    APP_DATA[currentGroup].subjects.forEach(s => {
      subjOptions += \`<option value="\${s.name}" \${data.subject === s.name ? 'selected' : ''}>\${s.name}</option>\`;
    });
  }
  subjOptions += \`<option value="Custom" \${data.subject === 'Custom' ? 'selected' : ''}>Custom...</option>\`;

  tr.innerHTML = \`
    <td>
      <select class="j-subject elegant-select" onchange="window.updateSubjectTopics(this)">
        \${subjOptions}
      </select>
      <input type="text" class="j-subject-custom elegant-input" placeholder="Custom subject" style="display:\${data.subject === 'Custom' ? 'block' : 'none'}; margin-top:4px;" value="\${data.subjectCustom || ''}" onchange="saveJournal()">
    </td>
    <td>
      <select class="j-topic elegant-select" onchange="window.checkCustomTopic(this)">
        <option value="\${data.topic || ''}">\${data.topic || 'Select Topic'}</option>
      </select>
      <input type="text" class="j-topic-custom elegant-input" placeholder="Custom topic" style="display:\${data.topic === 'Custom' ? 'block' : 'none'}; margin-top:4px;" value="\${data.topicCustom || ''}" onchange="saveJournal()">
    </td>
    <td><input type="text" class="j-tasks elegant-input" value="\${data.tasks || ''}" onchange="saveJournal()" placeholder="Tasks"></td>
    <td>
      <div style="display:flex; gap:4px; align-items:center;">
        <input type="number" class="j-duration-hh elegant-input" value="\${data.durHH || ''}" onchange="saveJournal()" min="0" placeholder="HH" style="width:45px; padding:6px; text-align:center;">
        <span style="font-weight:bold;">:</span>
        <input type="number" class="j-duration-mm elegant-input" value="\${data.durMM || ''}" onchange="saveJournal()" min="0" max="59" placeholder="MM" style="width:45px; padding:6px; text-align:center;">
      </div>
    </td>
    <td>
      <select class="j-status elegant-select" onchange="saveJournal()">
        <option value="Done" \${data.status==='Done'?'selected':''}>Done</option>
        <option value="Pending" \${data.status==='Pending'?'selected':''}>Pending</option>
        <option value="Skipped" \${data.status==='Skipped'?'selected':''}>Skipped</option>
      </select>
    </td>
    <td><button class="icon-btn" style="color:var(--danger);" onclick="removeJournalRow(this)"><span class="material-symbols-rounded">delete</span></button></td>
  \`;
  tbody.appendChild(tr);
  
  // Trigger population of topic dropdown if subject is already set
  const subjSel = tr.querySelector('.j-subject');
  if(data.subject && data.subject !== 'Custom') {
    window.updateSubjectTopics(subjSel);
    const topicSel = tr.querySelector('.j-topic');
    topicSel.value = data.topic || '';
    window.checkCustomTopic(topicSel);
  }
  
  calculateJournalStats();
}

function removeJournalRow(btn) {
  btn.closest('tr').remove();
  saveJournal();
}

function calculateJournalStats() {
  let totalMinutes = 0;
  Array.from(document.querySelectorAll('#journal-tbody tr')).forEach(tr => {
    const hh = parseInt(tr.querySelector('.j-duration-hh').value) || 0;
    const mm = parseInt(tr.querySelector('.j-duration-mm').value) || 0;
    totalMinutes += (hh * 60) + mm;
  });
  
  const totalStudy = totalMinutes / 60;
  document.getElementById('j-total-time').innerText = totalStudy.toFixed(2) + 'h';

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
  
  const rows = Array.from(document.querySelectorAll('#journal-tbody tr')).map(tr => {
    return {
      subject: tr.querySelector('.j-subject').value,
      subjectCustom: tr.querySelector('.j-subject-custom').value,
      topic: tr.querySelector('.j-topic').value,
      topicCustom: tr.querySelector('.j-topic-custom').value,
      tasks: tr.querySelector('.j-tasks').value,
      durHH: tr.querySelector('.j-duration-hh').value,
      durMM: tr.querySelector('.j-duration-mm').value,
      status: tr.querySelector('.j-status').value
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
`;

content = content.replace(/function addJournalRow[\s\S]*?async function generateJournalReport/, newFunctions + '\nasync function generateJournalReport');

fs.writeFileSync(appFile, content);
