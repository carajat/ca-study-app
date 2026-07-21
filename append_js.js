const fs = require('fs');

const jsCode = `
// ==========================================
// DAILY JOURNAL FEATURE
// ==========================================

let currentJournalDate = new Date();

function getJournalDateString(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return \`\${y}-\${m}-\${d}\`;
}

function openJournal() {
  document.getElementById('journal-modal').style.display = 'flex';
  const dateStr = getJournalDateString(currentJournalDate);
  document.getElementById('journal-date-picker').value = dateStr;
  loadJournal(dateStr);
}

function closeJournal() {
  document.getElementById('journal-modal').style.display = 'none';
}

function changeJournalDate(delta) {
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

function addJournalRow(data = {}) {
  const tbody = document.getElementById('journal-tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = \`
    <td><input type="text" class="j-subject" value="\${data.subject || ''}" onchange="saveJournal()" placeholder="Subject"></td>
    <td><input type="text" class="j-topic" value="\${data.topic || ''}" onchange="saveJournal()" placeholder="Topic"></td>
    <td><input type="text" class="j-tasks" value="\${data.tasks || ''}" onchange="saveJournal()" placeholder="Tasks"></td>
    <td><input type="number" class="j-duration" value="\${data.duration || ''}" onchange="saveJournal()" step="0.5" placeholder="Hrs"></td>
    <td>
      <select class="j-status" onchange="saveJournal()">
        <option value="Done" \${data.status==='Done'?'selected':''}>Done</option>
        <option value="Pending" \${data.status==='Pending'?'selected':''}>Pending</option>
        <option value="Skipped" \${data.status==='Skipped'?'selected':''}>Skipped</option>
      </select>
    </td>
    <td><input type="text" class="j-remarks" value="\${data.remarks || ''}" onchange="saveJournal()" placeholder="Remarks"></td>
    <td><button class="icon-btn" style="color:var(--danger-color)" onclick="removeJournalRow(this)"><span class="material-symbols-rounded">delete</span></button></td>
  \`;
  tbody.appendChild(tr);
  calculateJournalStats();
}

function removeJournalRow(btn) {
  btn.closest('tr').remove();
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
  
  const rows = Array.from(document.querySelectorAll('#journal-tbody tr')).map(tr => {
    return {
      subject: tr.querySelector('.j-subject').value,
      topic: tr.querySelector('.j-topic').value,
      tasks: tr.querySelector('.j-tasks').value,
      duration: tr.querySelector('.j-duration').value,
      status: tr.querySelector('.j-status').value,
      remarks: tr.querySelector('.j-remarks').value
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
  saveData(); // saves DYNAMIC_DATA to localStorage
}

async function generateJournalReport() {
  const dateStr = document.getElementById('journal-date-picker').value;
  const opt = {
    margin:       0.5,
    filename:     \`Daily_Journal_\${dateStr}.pdf\`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
  };
  
  // Clone the modal content for PDF generation
  const element = document.getElementById('journal-content-area').cloneNode(true);
  
  // Clean up UI for print
  const inputs = element.querySelectorAll('input, select');
  const originals = document.getElementById('journal-content-area').querySelectorAll('input, select');
  
  for(let i=0; i<inputs.length; i++) {
    const val = originals[i].value;
    const span = document.createElement('span');
    span.innerText = val;
    span.style.padding = '6px';
    span.style.display = 'inline-block';
    if(originals[i].tagName === 'SELECT') {
      span.style.fontWeight = 'bold';
    }
    inputs[i].parentNode.replaceChild(span, inputs[i]);
  }
  
  const addBtn = element.querySelector('button');
  if(addBtn) addBtn.remove();
  const deleteBtns = element.querySelectorAll('.icon-btn');
  deleteBtns.forEach(b => b.remove());
  
  element.style.background = '#ffffff';
  element.style.color = '#000000';
  element.style.padding = '20px';
  
  const headers = element.querySelectorAll('h2, h3, label, th, td, div');
  headers.forEach(h => {
    h.style.color = '#000000';
    if(h.tagName === 'TH' || h.tagName === 'TD') {
       h.style.border = '1px solid #000';
    }
  });

  const headerTitle = document.createElement('h2');
  headerTitle.innerText = \`Daily Journal - \${dateStr}\`;
  headerTitle.style.textAlign = 'center';
  headerTitle.style.marginBottom = '20px';
  element.insertBefore(headerTitle, element.firstChild);

  showToast('Generating PDF...');
  html2pdf().set(opt).from(element).save().then(() => {
    showToast('PDF downloaded successfully!');
  });
}
`;

fs.appendFileSync('C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/app.js', jsCode);
