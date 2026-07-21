const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Add id="editModeBtn" to openMenuModal
const menuOld = '<button class="menu-btn" onclick="toggleEditMode(); closeModal()">';
const menuNew = '<button id="editModeBtn" class="menu-btn" onclick="toggleEditMode(); closeModal()">';
appJs = appJs.replace(menuOld, menuNew);


// 2. Update startTutorial
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
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#menuBtn',
        popover: {
          title: 'Settings & Tools',
          description: 'Access the Menu to change Theme colors, Export/Import backups, or turn on Edit Mode.',
          side: "bottom", align: 'end'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#editModeBtn',
        popover: {
          title: 'Edit Mode (Crucial!)',
          description: 'Turn this ON to edit your syllabus subjects, delete wrong logs, or customize planner tasks. Turn it OFF to prevent accidental clicks.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('dashboard'); 
          openMenuModal(); 
          return new Promise(resolve => setTimeout(resolve, 100)); 
        }
      },
      {
        element: '#study-tracker-card',
        popover: {
          title: 'Live Study Tracker',
          description: 'Select your subject & topic, then hit Start to track your study sessions live. You can also pick directly from today\\'s Planner tasks.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#tl-list',
        popover: {
          title: "Today's Log",
          description: 'Your saved sessions appear here. You can also add manual logs if you forgot to start the timer.',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#tab-planner .planner-actions',
        popover: {
          title: 'Daily Planner',
          description: 'Add your goals for the day. You can even copy unfinished tasks to tomorrow!',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
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
          closeModal();
          switchTab('syllabus');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-schedule .schedule-toggle',
        popover: {
          title: 'Master Schedule (Routines)',
          description: 'We have 2 schedules built-in: "Early Morning" for Early Birds, and "Late Night" for Night Owls. Switch between them here!',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('schedule');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-schedule .tab-header',
        popover: {
          title: 'Macro Timetable',
          description: 'Plan your long-term timeline, including your first pass, revisions, and mock periods down here.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
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
          closeModal();
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
          closeModal();
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
