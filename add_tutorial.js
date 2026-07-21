const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const tutorialLogic = `
// ==========================================
// ONBOARDING TUTORIAL
// ==========================================
window.startTutorial = function() {
  if (typeof driver === 'undefined' || !window.driver) {
    console.error("Driver.js is not loaded.");
    return;
  }
  
  const driverObj = window.driver.js.driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    steps: [
      {
        element: '#group-selector',
        popover: {
          title: 'Select CA Final Group',
          description: 'Tap here to switch between CA Final Group 1 and Group 2. Your syllabus, planner, and schedule will update automatically.',
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '#study-tracker-card',
        popover: {
          title: 'Live Study Tracker',
          description: 'This is where the magic happens! Select your subject and topic, then hit Start to track your study sessions live.',
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '#study-tracker-card .st-selectors > div:first-child button',
        popover: {
          title: 'Pick from Planner',
          description: 'Use this handy shortcut to instantly load tasks you have set in today\\'s Planner into the Tracker.',
          side: "left",
          align: 'start'
        }
      },
      {
        element: '#tl-list',
        popover: {
          title: "Today's Log",
          description: 'Once you save a session in the tracker, it appears here. You can see your total hours for the day at a glance.',
          side: "top",
          align: 'start'
        }
      },
      {
        popover: {
          title: 'Manual Entry',
          description: 'Missed tracking a session live? Tap the "Planner Task" icon next to "Add Manual Log" (below) to manually enter study hours.',
        }
      },
      {
        element: '.bottom-nav',
        popover: {
          title: 'Navigation Tabs',
          description: 'Switch between Dashboard, Syllabus (to track chapter completion), Exams (mock scores), Schedule, and Planner. You are ready to crush your CA Finals!',
          side: "top",
          align: 'center'
        }
      }
    ]
  });
  
  driverObj.drive();
};
`;

if (!appJs.includes('startTutorial')) {
  fs.appendFileSync('app.js', '\n' + tutorialLogic);
  console.log("Tutorial logic appended to app.js");
} else {
  console.log("Tutorial logic already exists");
}
