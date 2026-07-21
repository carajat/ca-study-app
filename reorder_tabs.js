const fs = require('fs');

// 1. Reorder HTML Nav Items
let html = fs.readFileSync('index.html', 'utf8');

const navStart = '<nav class="bottom-nav">';
const navEnd = '</nav>';
const navStartIdx = html.indexOf(navStart);
const navEndIdx = html.indexOf(navEnd, navStartIdx);

if (navStartIdx !== -1 && navEndIdx !== -1) {
  const newNav = `<nav class="bottom-nav">
    <button class="nav-item active" data-tab="dashboard" onclick="switchTab('dashboard')">
      <span class="material-symbols-rounded nav-icon">home</span>
      <span class="nav-label">Home</span>
    </button>
    <button class="nav-item" data-tab="planner" onclick="switchTab('planner')">
      <span class="material-symbols-rounded nav-icon">calendar_month</span>
      <span class="nav-label">Planner</span>
    </button>
    <button class="nav-item" data-tab="syllabus" onclick="switchTab('syllabus')">
      <span class="material-symbols-rounded nav-icon">menu_book</span>
      <span class="nav-label">Syllabus</span>
    </button>
    <button class="nav-item" data-tab="schedule" onclick="switchTab('schedule')">
      <span class="material-symbols-rounded nav-icon">schedule</span>
      <span class="nav-label">Timetable</span>
    </button>
    <button class="nav-item" data-tab="exams" onclick="switchTab('exams')">
      <span class="material-symbols-rounded nav-icon">edit_document</span>
      <span class="nav-label">Exams</span>
    </button>`;
  
  html = html.substring(0, navStartIdx) + newNav + html.substring(navEndIdx);
  fs.writeFileSync('index.html', html);
  console.log("HTML Nav reordered.");
}

// 2. Reorder Tour Steps in app.js
let appJs = fs.readFileSync('app.js', 'utf8');

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
        element: '#menuBtn',
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
        element: '#tab-planner .planner-actions',
        popover: {
          title: 'Daily Planner',
          description: 'Add your goals for the day. You can even copy unfinished tasks to tomorrow!',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('planner');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
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
        element: '.bottom-nav',
        popover: {
          title: 'Navigation Tabs',
          description: 'Switch between Dashboard, Planner, Syllabus, Timetable, and Exams anytime. You are ready to crush your CA Finals!',
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
  console.log("App.js tour updated.");
} else {
  console.log("Could not find startTutorial.");
}
