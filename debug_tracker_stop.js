const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const oldTrackerStop = `function trackerStop() {
  if (trackerState.isPaused && trackerState.pauseStart) {
    trackerState.pausedTime += (Date.now() - trackerState.pauseStart);
    trackerState.pauseStart = null;
  }
  var elapsedMs = getElapsedMs();
  var totalMinutes = Math.round(elapsedMs / 60000);`;

const newTrackerStop = `function trackerStop() {
  try {
    if (trackerState.isPaused && trackerState.pauseStart) {
      trackerState.pausedTime += (Date.now() - trackerState.pauseStart);
      trackerState.pauseStart = null;
    }
    var elapsedMs = getElapsedMs();
    var totalMinutes = Math.round(elapsedMs / 60000);`;

const oldEnd = `  setTimeout(function() {
    var st = document.getElementById('st-status');
    if (st) st.textContent = '';
  }, 4000);
}`;

const newEnd = `  setTimeout(function() {
    var st = document.getElementById('st-status');
    if (st) st.textContent = '';
  }, 4000);
  } catch (err) {
    alert("Crash in trackerStop: " + err.message + "\\nLine: " + err.stack);
  }
}`;

if (appJs.includes(oldTrackerStop)) {
  appJs = appJs.replace(oldTrackerStop, newTrackerStop);
  appJs = appJs.replace(oldEnd, newEnd);
  fs.writeFileSync('app.js', appJs);
  console.log("Patched trackerStop with try/catch");
} else {
  console.log("Could not find trackerStop string");
}
