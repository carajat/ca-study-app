const fs = require('fs');

const appFile = 'C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/app.js';
let content = fs.readFileSync(appFile, 'utf8');

const replacement = `async function generateJournalReport() {
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
  
  // Inject explicit print styles so it ignores dark mode CSS variables
  const printStyle = document.createElement('style');
  printStyle.innerHTML = \`
    * { 
      color: #000000 !important; 
      background: transparent !important; 
      box-shadow: none !important; 
    }
    .task-card { 
      border: 1px solid #000000 !important; 
      padding: 10px !important; 
      margin-bottom: 10px !important; 
    }
    .journal-top-stats, .journal-footer-stats {
      border: 1px solid #000000 !important; 
    }
    span { border-bottom: 1px dashed #ccc !important; min-width: 50px; }
  \`;
  element.appendChild(printStyle);
  
  element.style.background = '#ffffff';
  element.style.padding = '20px';
  
  const headerTitle = document.createElement('h2');
  headerTitle.innerText = \`Daily Journal - \${dateStr}\`;
  headerTitle.style.textAlign = 'center';
  headerTitle.style.marginBottom = '20px';
  headerTitle.style.color = '#000000';
  element.insertBefore(headerTitle, element.firstChild);

  showToast('Generating PDF...');
  html2pdf().set(opt).from(element).save().then(() => {
    showToast('PDF downloaded successfully!');
  });
}
`;

content = content.replace(/async function generateJournalReport\(\) \{[\s\S]*\}\s*$/, replacement);

fs.writeFileSync(appFile, content);

