const fs = require('fs');

// Patch sync.js to expose login state globally
let syncJs = fs.readFileSync('sync.js', 'utf8');
if (!syncJs.includes('window.isCloudLoggedIn')) {
  syncJs = syncJs.replace('currentUser = user;', 'currentUser = user;\n    window.isCloudLoggedIn = !!user;');
  fs.writeFileSync('sync.js', syncJs);
}

// Patch app.js openMenuModal
let appJs = fs.readFileSync('app.js', 'utf8');

const targetLogoutStr = `    <button class="menu-btn" onclick="closeModal(); if(typeof logoutFromCloud === 'function') logoutFromCloud(); else alert('Login logic not loaded');">
      <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout (Cloud Sync)
    </button>`;

const replacementStr = `    \${(window.isCloudLoggedIn) 
      ? \`<button class="menu-btn" onclick="closeModal(); if(typeof logoutFromCloud === 'function') logoutFromCloud();">
          <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout (Cloud Sync)
         </button>\` 
      : \`<button class="menu-btn" onclick="closeModal(); document.getElementById('welcome-overlay').style.display='flex';">
          <span class="material-symbols-rounded menu-btn-icon">cloud_sync</span> Login (Cloud Sync)
         </button>\`
    }`;

if (appJs.includes(targetLogoutStr)) {
  appJs = appJs.replace(targetLogoutStr, replacementStr);
  fs.writeFileSync('app.js', appJs);
}

console.log("Menu UI fixed based on login state.");
