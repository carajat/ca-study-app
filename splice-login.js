const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');
let lines = app.split('\n');

const replacementLines = [
  '    ${(window.isCloudLoggedIn) ',
  '      ? `<button class="menu-btn" onclick="closeModal(); if(typeof logoutFromCloud === \'function\') logoutFromCloud();">',
  '          <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout',
  '         </button>` ',
  '      : `<button class="menu-btn" onclick="closeModal(); document.getElementById(\'welcome-overlay\').style.display=\'flex\';">',
  '          <span class="material-symbols-rounded menu-btn-icon">login</span> Login',
  '         </button>`',
  '    }',
  '    ',
  '    <button id="editModeBtn" class="menu-btn" onclick="toggleEditMode(); closeModal()">',
  '      <span class="menu-btn-icon">${isEditMode ? \'<span class="material-symbols-rounded icon-sm">check_circle</span>\' : \'<span class="material-symbols-rounded icon-sm">edit</span>\'}</span> Edit Mode: <strong style="color: ${isEditMode ? \'var(--color-primary)\' : \'inherit\'}">${isEditMode ? \'ON\' : \'OFF\'}</strong>',
  '    </button>'
].map(line => line + (app.includes('\r\n') ? '\r' : ''));

// Find index of <button id="editModeBtn"
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<button id="editModeBtn" class="menu-btn" onclick="toggleEditMode(); closeModal()">')) {
    startIdx = i;
    break;
  }
}

if (startIdx !== -1) {
  lines.splice(startIdx, 12, ...replacementLines);
  fs.writeFileSync('app.js', lines.join('\n'));
  console.log('Successfully swapped lines.');
} else {
  console.log('Could not find start index.');
}

// Bump version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v159/g, 'v160');
fs.writeFileSync('sw.js', sw);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=159/g, 'v=160');
fs.writeFileSync('index.html', index);
