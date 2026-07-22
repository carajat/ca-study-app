const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const target = `    <button id="editModeBtn" class="menu-btn" onclick="toggleEditMode(); closeModal()">
      <span class="menu-btn-icon">\${isEditMode ? '<span class="material-symbols-rounded icon-sm">check_circle</span>' : '<span class="material-symbols-rounded icon-sm">edit</span>'}</span> Edit Mode: <strong style="color: \${isEditMode ? 'var(--color-primary)' : 'inherit'}">\${isEditMode ? 'ON' : 'OFF'}</strong>
    </button>
    
    \${(window.isCloudLoggedIn) 
      ? \`<button class="menu-btn" onclick="closeModal(); if(typeof logoutFromCloud === 'function') logoutFromCloud();">
          <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout (Cloud Sync)
         </button>\` 
      : \`<button class="menu-btn" onclick="closeModal(); document.getElementById('welcome-overlay').style.display='flex';">
          <span class="material-symbols-rounded menu-btn-icon">cloud_sync</span> Login (Cloud Sync)
         </button>\`
    }`;

const replacement = `    \${(window.isCloudLoggedIn) 
      ? \`<button class="menu-btn" onclick="closeModal(); if(typeof logoutFromCloud === 'function') logoutFromCloud();">
          <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout
         </button>\` 
      : \`<button class="menu-btn" onclick="closeModal(); document.getElementById('welcome-overlay').style.display='flex';">
          <span class="material-symbols-rounded menu-btn-icon">login</span> Login
         </button>\`
    }

    <button id="editModeBtn" class="menu-btn" onclick="toggleEditMode(); closeModal()">
      <span class="menu-btn-icon">\${isEditMode ? '<span class="material-symbols-rounded icon-sm">check_circle</span>' : '<span class="material-symbols-rounded icon-sm">edit</span>'}</span> Edit Mode: <strong style="color: \${isEditMode ? 'var(--color-primary)' : 'inherit'}">\${isEditMode ? 'ON' : 'OFF'}</strong>
    </button>`;

if (app.includes(target)) {
    app = app.replace(target, replacement);
    fs.writeFileSync('app.js', app);
    console.log('Replaced successfully');
} else {
    console.log('Target not found');
}

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v158/g, 'v159');
fs.writeFileSync('sw.js', sw);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=158/g, 'v=159');
fs.writeFileSync('index.html', index);
