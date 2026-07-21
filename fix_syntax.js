const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const reloadIndex = appJs.indexOf('window.reloadAppFromCloud = function');
if (reloadIndex !== -1) {
  // Cut off everything from reloadAppFromCloud to the end
  appJs = appJs.substring(0, reloadIndex);
  
  // Append the correct function
  const cleanReloadFunc = `window.reloadAppFromCloud = function(cloudData) {
  if (!cloudData) return;
  
  let newDynamic = cloudData.dynamic || cloudData;
  let newState = cloudData.state || {};
  let newTracker = cloudData.tracker || {};
  
  const cleanTracker = {
    isRunning: !!newTracker.isRunning,
    isPaused: !!newTracker.isPaused,
    startTime: newTracker.startTime || null,
    pausedTime: newTracker.pausedTime || 0,
    pauseStart: newTracker.pauseStart || null,
    subject: newTracker.subject || '',
    topic: newTracker.topic || '',
    task: newTracker.task || ''
  };

  const localHash = JSON.stringify(DYNAMIC_DATA) + JSON.stringify(loadState()) + JSON.stringify(trackerState);
  const cloudHash = JSON.stringify(newDynamic) + JSON.stringify(newState) + JSON.stringify(cleanTracker);
  
  if (localHash !== cloudHash) {
    console.log("Cloud data differs. Applying sync and reloading...");
    localStorage.setItem(getDynamicDataKey(), JSON.stringify(newDynamic));
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
    
    if (cleanTracker.isRunning || cleanTracker.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify(cleanTracker));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
    
    location.reload();
  }
};\n`;
  
  appJs += cleanReloadFunc;
  fs.writeFileSync('app.js', appJs);
  console.log("Fixed SyntaxError at the end of app.js");
}
