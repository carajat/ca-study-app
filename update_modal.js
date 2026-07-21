const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const targetFunctionStart = "function openThemeModal() {";
const targetFunctionEnd = "  `);\n}";
const targetFunctionEndCRLF = "  `);\r\n}";

let startIdx = appJs.indexOf(targetFunctionStart);
let endIdx = appJs.indexOf(targetFunctionEnd, startIdx);
let len = targetFunctionEnd.length;

if (endIdx === -1) {
  endIdx = appJs.indexOf(targetFunctionEndCRLF, startIdx);
  len = targetFunctionEndCRLF.length;
}

if (startIdx !== -1 && endIdx !== -1) {
  const newFunction = `function openThemeModal() {
  const currentTheme = localStorage.getItem('ca-theme') || 'default';
  const mode = document.body.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const modeIcon = mode === 'light' ? 'dark_mode' : 'light_mode';
  const modeText = mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  
  openModal('Select Theme', \`
    <button class="menu-btn" style="margin-bottom: 20px; text-align: center; justify-content: center; background: rgba(10,132,255,0.1); color: var(--primary);" onclick="toggleTheme(); openThemeModal();">
      <span class="material-symbols-rounded menu-btn-icon" style="margin-right: 8px;">\${modeIcon}</span> \${modeText}
    </button>
    <p style="text-align:center; color:var(--text-secondary); margin-bottom: 20px;">Personalize your app colors</p>
    <div class="theme-picker">
      <div class="theme-circle tc-default \${currentTheme === 'default' ? 'active' : ''}" onclick="setTheme('default', this)"></div>
      <div class="theme-circle tc-ocean \${currentTheme === 'ocean' ? 'active' : ''}" onclick="setTheme('ocean', this)"></div>
      <div class="theme-circle tc-forest \${currentTheme === 'forest' ? 'active' : ''}" onclick="setTheme('forest', this)"></div>
      <div class="theme-circle tc-sunset \${currentTheme === 'sunset' ? 'active' : ''}" onclick="setTheme('sunset', this)"></div>
      <div class="theme-circle tc-rose \${currentTheme === 'rose' ? 'active' : ''}" onclick="setTheme('rose', this)"></div>
    </div>
    <button class="btn-primary" style="margin-top:20px" onclick="openMenuModal()">Back to Menu</button>
  \`);
}`;

  appJs = appJs.substring(0, startIdx) + newFunction + appJs.substring(endIdx + len);
  fs.writeFileSync('app.js', appJs);
  console.log("Updated openThemeModal successfully.");
} else {
  console.log("Could not find openThemeModal bounds.");
}
