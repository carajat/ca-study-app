const fs = require('fs');

// Patch index.html
let html = fs.readFileSync('index.html', 'utf8');

const oldBtn = `<button id="login-btn" class="btn-primary" onclick="loginToCloud()" style="width: 100%; margin-bottom: 15px;">Login / Sync</button>`;
const newBtn = `<div id="login-error" style="color: #ff453a; margin-bottom: 15px; font-size: 13px; font-weight: bold; min-height: 18px;"></div>\n      <button id="login-btn" class="btn-primary" onclick="loginToCloud()" style="width: 100%; margin-bottom: 15px;">Login / Sync</button>`;

if (html.includes(oldBtn)) {
  html = html.replace(oldBtn, newBtn);
  fs.writeFileSync('index.html', html);
}

// Patch sync.js
let syncJs = fs.readFileSync('sync.js', 'utf8');

const showErrorLogic = `
function showLoginError(msg) {
  const errDiv = document.getElementById('login-error');
  if (errDiv) errDiv.innerText = msg;
  else alert(msg);
}
`;

syncJs = showErrorLogic + '\n' + syncJs;
syncJs = syncJs.replace(/return alert\("Firebase not loaded.*?"\);/g, 'return showLoginError("Firebase not loaded. Check internet.");');
syncJs = syncJs.replace(/return alert\("Enter email and password"\);/g, 'return showLoginError("Please enter email and password.");');
syncJs = syncJs.replace(/alert\("Login failed: " \+ error\.message\);/g, 'showLoginError("Error: " + error.message);');

fs.writeFileSync('sync.js', syncJs);
console.log("Patched login errors to show in UI");
