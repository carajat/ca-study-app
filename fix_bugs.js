const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<button class="theme-btn" onclick="openMenuModal()" style="position: relative; z-index: 10;">',
  '<button class="theme-btn" id="menuBtn" onclick="openMenuModal()" style="position: relative; z-index: 10;">'
);
fs.writeFileSync('index.html', html);

// 2. Update app.js
let appJs = fs.readFileSync('app.js', 'utf8');

// Fix startTutorial selector
appJs = appJs.replace(
  'element: \'.app-header .material-symbols-rounded:contains("menu")\', // this will fallback gracefully if not precise',
  'element: \'#menuBtn\','
);

// Remove App Navigator from openMenuModal
const oldMenuStart = `function openMenuModal() {
  openModal('☰ Settings & Tools', \`
    
    <button class="menu-btn" onclick="openAppNavigator()" style="background: rgba(10,132,255,0.1); color: var(--primary);">
      <span class="material-symbols-rounded menu-btn-icon">explore</span> App Navigator
    </button>`;

const oldMenuStartCRLF = `function openMenuModal() {
  openModal('☰ Settings & Tools', \`
    
    <button class="menu-btn" onclick="openAppNavigator()" style="background: rgba(10,132,255,0.1); color: var(--primary);">
      <span class="material-symbols-rounded menu-btn-icon">explore</span> App Navigator
    </button>`.replace(/\n/g, '\r\n');

const newMenuStart = `function openMenuModal() {
  openModal('☰ Settings & Tools', \``;

if (appJs.includes(oldMenuStart)) {
  appJs = appJs.replace(oldMenuStart, newMenuStart);
} else if (appJs.includes(oldMenuStartCRLF)) {
  appJs = appJs.replace(oldMenuStartCRLF, newMenuStart);
} else {
  // Try regex removal if exact match fails
  appJs = appJs.replace(/<button class="menu-btn" onclick="openAppNavigator\(\)".*?<\/button>/s, '');
}

fs.writeFileSync('app.js', appJs);
console.log("Bugs fixed successfully.");
