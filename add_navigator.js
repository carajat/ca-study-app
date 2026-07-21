const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Add "App Navigator" button to openMenuModal
const menuButtonTarget = '<button class="menu-btn" onclick="toggleEditMode(); closeModal()">';
const navigatorButton = `
    <button class="menu-btn" onclick="openAppNavigator()" style="background: rgba(10,132,255,0.1); color: var(--primary);">
      <span class="material-symbols-rounded menu-btn-icon">explore</span> App Navigator
    </button>`;

if (appJs.includes(menuButtonTarget) && !appJs.includes('openAppNavigator()')) {
  appJs = appJs.replace(menuButtonTarget, navigatorButton + '\n    ' + menuButtonTarget);
}

// 2. Add the openAppNavigator function definition
const newFunction = `
window.openAppNavigator = function() {
  const html = \`
    <div style="display:flex; flex-direction:column; gap:8px;">
      <p style="text-align:center; color:var(--text-secondary); margin-bottom:10px; font-size:13px;">Jump to any feature instantly</p>
      
      <div class="glass-card" style="padding:12px; cursor:pointer;" onclick="switchTab('dashboard'); closeModal();">
        <div style="font-weight:600; color:var(--primary); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">home</span> Dashboard (Home)
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Live tracker, Today's logs, and quick actions</div>
      </div>
      
      <div class="glass-card" style="padding:12px; cursor:pointer;" onclick="switchTab('syllabus'); closeModal();">
        <div style="font-weight:600; color:var(--primary); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">menu_book</span> Syllabus Tracker
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Track chapter-wise completion (Concepts, Q-Bank, Revision)</div>
      </div>
      
      <div class="glass-card" style="padding:12px; cursor:pointer;" onclick="switchTab('planner'); closeModal();">
        <div style="font-weight:600; color:var(--primary); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">fact_check</span> Daily Planner
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Set and track goals for specific days</div>
      </div>

      <div class="glass-card" style="padding:12px; cursor:pointer;" onclick="switchTab('exams'); closeModal();">
        <div style="font-weight:600; color:var(--primary); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">analytics</span> Mock Exams
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Log your mock test scores and analyze performance</div>
      </div>

      <div class="glass-card" style="padding:12px; cursor:pointer;" onclick="switchTab('schedule'); closeModal();">
        <div style="font-weight:600; color:var(--primary); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">calendar_month</span> Master Schedule
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Long-term timeline (First pass, Revisions, Mocks)</div>
      </div>
      
      <div class="glass-card" style="padding:12px; cursor:pointer;" onclick="closeModal(); startTutorial();">
        <div style="font-weight:600; color:var(--primary); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">help</span> App Tour
        </div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Restart the interactive walkthrough of the app</div>
      </div>
      
      <button class="btn-primary" style="margin-top:10px;" onclick="openMenuModal()">Back to Settings</button>
    </div>
  \`;
  openModal('App Navigator', html);
};
`;

if (!appJs.includes('openAppNavigator = function()')) {
  appJs += newFunction;
  fs.writeFileSync('app.js', appJs);
  console.log("Navigator added successfully.");
} else {
  console.log("Navigator already exists.");
}
