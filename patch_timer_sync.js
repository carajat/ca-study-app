const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Update saveState to send both DYNAMIC_DATA and trackerState
const oldSaveState = `  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud(DYNAMIC_DATA);
  }`;
const newSaveState = `  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud({ dynamic: DYNAMIC_DATA, tracker: trackerState });
  }`;

if (appJs.includes(oldSaveState)) {
  appJs = appJs.replace(oldSaveState, newSaveState);
}

// 2. Update saveTrackerState to also call syncToCloud
const oldSaveTrackerState = `      localStorage.removeItem('ca_study_tracker_state');
    }
  } catch(e) { console.error('saveTrackerState', e); }`;
  
const newSaveTrackerState = `      localStorage.removeItem('ca_study_tracker_state');
    }
    if (typeof window.syncToCloud === 'function') {
      window.syncToCloud({ dynamic: DYNAMIC_DATA, tracker: trackerState });
    }
  } catch(e) { console.error('saveTrackerState', e); }`;

if (appJs.includes(oldSaveTrackerState)) {
  appJs = appJs.replace(oldSaveTrackerState, newSaveTrackerState);
}

// 3. Update reloadAppFromCloud to handle the new format
const oldReloadFunc = `window.reloadAppFromCloud = function(cloudData) {
  const localHash = JSON.stringify(DYNAMIC_DATA);
  const cloudHash = JSON.stringify(cloudData);
  if (localHash !== cloudHash) {
    console.log("Cloud data differs from local data. Applying sync and reloading...");
    localStorage.setItem('ca-study-data', cloudHash);
    location.reload();
  } else {
    console.log("Cloud data is identical. No reload needed.");
  }
};`;

const newReloadFunc = `window.reloadAppFromCloud = function(cloudData) {
  let newDynamic = cloudData.dynamic || cloudData;
  let newTracker = cloudData.tracker || {};
  
  // Clean up undefined/null from newTracker to match trackerState stringify
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

  const localHash = JSON.stringify(DYNAMIC_DATA) + JSON.stringify(trackerState);
  const cloudHash = JSON.stringify(newDynamic) + JSON.stringify(cleanTracker);
  
  if (localHash !== cloudHash) {
    console.log("Cloud data differs. Applying sync and reloading...");
    localStorage.setItem('ca-study-data', JSON.stringify(newDynamic));
    
    if (cleanTracker.isRunning || cleanTracker.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify(cleanTracker));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
    
    location.reload();
  } else {
    console.log("Cloud data is identical. No reload needed.");
  }
};`;

if (appJs.includes(oldReloadFunc)) {
  appJs = appJs.replace(oldReloadFunc, newReloadFunc);
}

fs.writeFileSync('app.js', appJs);
console.log("Patched timer sync!");
