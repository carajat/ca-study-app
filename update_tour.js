const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Revert openMenuModal
const menuOld = `function openMenuModal() {
  openModal('☰ Settings & Tools', \`
    
    <button class="menu-btn" onclick="openAppNavigator()" style="background: rgba(10,132,255,0.1); color: var(--primary);">
      <span class="material-symbols-rounded menu-btn-icon">explore</span> App Navigator
    </button>
    <button class="menu-btn" onclick="toggleEditMode(); closeModal()">
      <span class="menu-btn-icon">\${isEditMode ? '<span class="material-symbols-rounded icon-sm">check_circle</span>' : '<span class="material-symbols-rounded icon-sm">edit</span>'}</span> Edit Mode: <strong style="color: \${isEditMode ? 'var(--color-primary)' : 'inherit'}">\${isEditMode ? 'ON' : 'OFF'}</strong>
    </button>`;

const menuNew = `function openMenuModal() {
  openModal('☰ Settings & Tools', \`
    <button class="menu-btn" onclick="toggleEditMode(); closeModal()">
      <span class="menu-btn-icon">\${isEditMode ? '<span class="material-symbols-rounded icon-sm">check_circle</span>' : '<span class="material-symbols-rounded icon-sm">edit</span>'}</span> Edit Mode: <strong style="color: \${isEditMode ? 'var(--color-primary)' : 'inherit'}">\${isEditMode ? 'ON' : 'OFF'}</strong>
    </button>`;

appJs = appJs.replace(menuOld, menuNew);

// 2. Remove openAppNavigator completely
const navStart = 'window.openAppNavigator = function() {';
const navIdx = appJs.indexOf(navStart);
if (navIdx !== -1) {
  const navEndStr = '  openModal(\'App Navigator\', html);\n};\n';
  const navEndStrCRLF = '  openModal(\'App Navigator\', html);\r\n};\r\n';
  let navEndIdx = appJs.indexOf(navEndStr, navIdx);
  let len = navEndStr.length;
  if (navEndIdx === -1) {
    navEndIdx = appJs.indexOf(navEndStrCRLF, navIdx);
    len = navEndStrCRLF.length;
  }
  
  if (navEndIdx !== -1) {
    appJs = appJs.substring(0, navIdx) + appJs.substring(navEndIdx + len);
  }
}

// 3. Update startTutorial
const tutStart = 'window.startTutorial = function() {';
const tutEnd = '  driverObj.drive();\n};';
const tutEndCRLF = '  driverObj.drive();\r\n};';

let tStartIdx = appJs.indexOf(tutStart);
let tEndIdx = appJs.indexOf(tutEnd, tStartIdx);
let tLen = tutEnd.length;
if (tEndIdx === -1) {
  tEndIdx = appJs.indexOf(tutEndCRLF, tStartIdx);
  tLen = tutEndCRLF.length;
}

if (tStartIdx !== -1 && tEndIdx !== -1) {
  const newTutorial = `window.startTutorial = function() {
  if (typeof driver === 'undefined' || !window.driver) {
    console.error("Driver.js is not loaded.");
    return;
  }
  
  const driverObj = window.driver.js.driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    steps: [
      {
        element: '.app-header h1',
        popover: {
          title: 'Select CA Final Group',
          description: 'Tap on the title to switch between CA Final Group 1 and Group 2. Your syllabus, planner, and schedule will update automatically.',
          side: "bottom", align: 'start'
        },
        onHighlightStarted: () => { switchTab('dashboard'); }
      },
      {
        element: '.app-header .material-symbols-rounded:contains("menu")', // this will fallback gracefully if not precise
        popover: {
          title: 'Settings & Tools',
          description: 'Access the Menu (top right) to change Theme colors, toggle Dark/Light Mode, enable Edit Mode, or Export/Import your data backups.',
          side: "bottom", align: 'end'
        },
        onHighlightStarted: () => { switchTab('dashboard'); }
      },
      {
        element: '#study-tracker-card',
        popover: {
          title: 'Live Study Tracker',
          description: 'Select your subject & topic, then hit Start to track your study sessions live. You can also pick directly from today\\'s Planner tasks.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { switchTab('dashboard'); }
      },
      {
        element: '#tl-list',
        popover: {
          title: "Today's Log",
          description: 'Your saved sessions appear here. You can also add manual logs if you forgot to start the timer.',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { switchTab('dashboard'); }
      },
      {
        element: '#tab-syllabus .tab-header',
        popover: {
          title: 'Track Syllabus',
          description: 'Mark chapters as done when you finish Concepts, Q-Bank, or Revision Videos.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('syllabus');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-exams .tab-header',
        popover: {
          title: 'Mock Exams',
          description: 'Log your mock test scores and analyze your performance across different attempts.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('exams');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-schedule .tab-header',
        popover: {
          title: 'Master Schedule',
          description: 'Plan your long-term timeline, including your first pass, revisions, and mock periods.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('schedule');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-planner .planner-actions',
        popover: {
          title: 'Daily Planner',
          description: 'Add your goals for the day. You can even copy unfinished tasks to tomorrow!',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('planner');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '.bottom-nav',
        popover: {
          title: 'Navigation Tabs',
          description: 'Switch between Dashboard, Syllabus, Exams, Schedule, and Planner anytime. You are ready to crush your CA Finals!',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('dashboard');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    ]
  });
  
  driverObj.drive();
};`;

  appJs = appJs.substring(0, tStartIdx) + newTutorial + appJs.substring(tEndIdx + tLen);
  fs.writeFileSync('app.js', appJs);
  console.log("Updated everything.");
} else {
  console.log("Could not find startTutorial.");
}
