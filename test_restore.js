const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `
<!DOCTYPE html>
<html>
<body>
  <div id="st-timer-value">00:00:00</div>
  <button id="st-btn-start">Start</button>
  <button id="st-btn-pause">Pause</button>
  <button id="st-btn-resume">Resume</button>
  <button id="st-btn-stop">Stop</button>
  <div id="st-status"></div>
  <select id="st-subject"><option value="sub">sub</option></select>
  <select id="st-topic"><option value="top">top</option></select>
  <input id="st-task-desc" value="desc">
  <div id="st-timer-display"></div>
</body>
</html>
`;

const dom = new JSDOM(html);
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, val) { this.data[key] = val.toString(); },
  removeItem(key) { delete this.data[key]; }
};

global.JSON = JSON;
global.console = console;
global.Date = Date;
global.Math = Math;
global.String = String;
global.setInterval = setInterval;
global.clearInterval = clearInterval;
global.setTimeout = setTimeout;

// Mock dependencies
global.DYNAMIC_DATA = {};
global.getDynamicDataKey = () => 'test_dyn';
global.getStorageKey = () => 'test_state';
global.loadState = () => ({});
global.saveDynamicData = () => {};

let appJsCode = fs.readFileSync('app.js', 'utf8');

// Wrap in a function to evaluate
eval(appJsCode);

// Mock getGlobalTime
window.getGlobalTime = () => Date.now();

// Set up the local storage to simulate receiving cloud data
const incomingTracker = {
  isRunning: true,
  isPaused: false,
  startTime: Date.now() - 5000, // 5 seconds ago
  pausedTime: 0,
  pauseStart: null,
  subject: 'sub',
  topic: 'top',
  task: 'desc'
};

localStorage.setItem('ca_study_tracker_state', JSON.stringify(incomingTracker));

console.log("Before restore:", trackerState);

try {
  restoreTrackerState();
  console.log("After restore:", trackerState);
  console.log("Timer value:", document.getElementById('st-timer-value').textContent);
  console.log("Button display:", document.getElementById('st-btn-pause').style.display);
  
  setTimeout(() => {
    console.log("Timer value after 1s:", document.getElementById('st-timer-value').textContent);
    process.exit(0);
  }, 1100);
} catch (e) {
  console.error("Error in restore:", e);
  process.exit(1);
}
