const fs = require('fs');

// 1. Patch index.html
let html = fs.readFileSync('index.html', 'utf8');

const firebaseCDNs = `
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
`;

if (!html.includes('firebase-app-compat')) {
  html = html.replace('</head>', firebaseCDNs + '</head>');
}

const welcomeOverlay = `
  <!-- Welcome / Login Overlay -->
  <div id="welcome-overlay" class="modal-overlay" style="display:none; z-index:9999; flex-direction:column; justify-content:center; padding:20px; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);">
    <div class="glass-card" style="max-width: 400px; width: 100%; text-align: center; margin: 0 auto; padding: 30px 20px;">
      <span class="material-symbols-rounded" style="font-size: 48px; color: var(--primary); margin-bottom: 10px;">cloud_sync</span>
      <h2 style="margin-bottom: 10px; font-size: 22px;">Welcome to CA Tracker</h2>
      <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">Log in to sync your progress across devices, or continue offline.</p>
      
      <input type="email" id="login-email" class="st-input" placeholder="Email Address" style="margin-bottom: 10px;">
      <input type="password" id="login-pass" class="st-input" placeholder="Password" style="margin-bottom: 20px;">
      
      <button id="login-btn" class="btn-primary" onclick="loginToCloud()" style="width: 100%; margin-bottom: 15px;">Login / Sync</button>
      <button class="btn-secondary" onclick="continueOffline()" style="width: 100%; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary);">Continue without Login (Offline)</button>
    </div>
  </div>
`;

if (!html.includes('welcome-overlay')) {
  html = html.replace('<body>', '<body>\n' + welcomeOverlay);
}

if (!html.includes('sync.js')) {
  html = html.replace('<script src="app.js"></script>', '<script src="sync.js"></script>\n  <script src="app.js"></script>');
}

fs.writeFileSync('index.html', html);


// 2. Patch app.js
let appJs = fs.readFileSync('app.js', 'utf8');

const saveStateOriginal = `function saveState(updates = {}) {
  Object.assign(state, updates);
  localStorage.setItem('ca-study-data', JSON.stringify(DYNAMIC_DATA));
}`;
const saveStateOriginalCRLF = saveStateOriginal.replace(/\n/g, '\r\n');

const saveStateNew = `function saveState(updates = {}) {
  Object.assign(state, updates);
  localStorage.setItem('ca-study-data', JSON.stringify(DYNAMIC_DATA));
  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud(DYNAMIC_DATA);
  }
}`;

if (appJs.includes(saveStateOriginal)) {
  appJs = appJs.replace(saveStateOriginal, saveStateNew);
} else if (appJs.includes(saveStateOriginalCRLF)) {
  appJs = appJs.replace(saveStateOriginalCRLF, saveStateNew);
}

const reloadFunc = `
window.reloadAppFromCloud = function(cloudData) {
  const localHash = JSON.stringify(DYNAMIC_DATA);
  const cloudHash = JSON.stringify(cloudData);
  if (localHash !== cloudHash) {
    console.log("Cloud data differs from local data. Applying sync and reloading...");
    localStorage.setItem('ca-study-data', cloudHash);
    location.reload();
  } else {
    console.log("Cloud data is identical. No reload needed.");
  }
};
`;

if (!appJs.includes('reloadAppFromCloud')) {
  appJs += reloadFunc;
}

// Add Logout button to Menu
const menuSearch = '<button class="menu-btn" onclick="openThemeModal()">';
const logoutButton = `
    <button class="menu-btn" onclick="closeModal(); if(typeof logoutFromCloud === 'function') logoutFromCloud(); else alert('Login logic not loaded');">
      <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout (Cloud Sync)
    </button>`;

if (appJs.includes(menuSearch) && !appJs.includes('logoutFromCloud()')) {
  appJs = appJs.replace(menuSearch, logoutButton + '\n    ' + menuSearch);
}

fs.writeFileSync('app.js', appJs);
console.log('Firebase patched successfully.');
