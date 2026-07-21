const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

const oldCodeStart = 'window.startTutorial = function() {';
const oldCodeEnd = 'driverObj.drive();\r\n};';
const oldCodeEndLF = 'driverObj.drive();\n};';

let startIdx = appJs.indexOf(oldCodeStart);
let endIdx = appJs.indexOf(oldCodeEnd);
let len = oldCodeEnd.length;
if (endIdx === -1) {
  endIdx = appJs.indexOf(oldCodeEndLF);
  len = oldCodeEndLF.length;
}

if (startIdx !== -1 && endIdx !== -1) {
  const newCode = `window.startTutorial = function() {
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
        element: '.app-header h1', // targeting the header text instead of invisible select
        popover: {
          title: 'Select CA Final Group',
          description: 'Tap on the title to switch between CA Final Group 1 and Group 2. Your syllabus, planner, and schedule will update automatically.',
          side: "bottom", align: 'start'
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
          // small delay for transition
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
          description: 'Switch between Dashboard, Syllabus, Exams (Mock scores), Schedule, and Planner anytime!',
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

  appJs = appJs.substring(0, startIdx) + newCode + appJs.substring(endIdx + len);
  fs.writeFileSync('app.js', appJs);
  console.log("Updated startTutorial logic.");
} else {
  console.log("Could not find startTutorial function bounds");
}
