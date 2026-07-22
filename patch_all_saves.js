const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

function doSync() {
  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud({ 
      dynamic: DYNAMIC_DATA, 
      state: loadState(), 
      tracker: trackerState 
    });
  }
}

const syncCode = `
  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud({ dynamic: DYNAMIC_DATA, state: loadState(), tracker: trackerState });
  }
`;

// Patch 1: saveDynamicData
appJs = appJs.replace(
  `localStorage.setItem(getDynamicDataKey(), JSON.stringify(DYNAMIC_DATA));`,
  `localStorage.setItem(getDynamicDataKey(), JSON.stringify(DYNAMIC_DATA));` + syncCode
);

// Patch 2: saveState
appJs = appJs.replace(
  `localStorage.setItem(getStorageKey(), JSON.stringify(merged));`,
  `localStorage.setItem(getStorageKey(), JSON.stringify(merged));` + syncCode
);

// Patch 3: saveTrackerState
appJs = appJs.replace(
  `localStorage.removeItem('ca_study_tracker_state');\n    }`,
  `localStorage.removeItem('ca_study_tracker_state');\n    }` + syncCode
);
// Also patch the part where it sets item in saveTrackerState
appJs = appJs.replace(
  `topic: trackerState.topic, task: trackerState.task\n      }));`,
  `topic: trackerState.topic, task: trackerState.task\n      }));` + syncCode
);

// Patch 4: rewrite reloadAppFromCloud completely to handle all 3 pieces
const oldReloadRegex = /window\.reloadAppFromCloud = function[\s\S]*?(?=^$|^\w)/m;
const newReload = `window.reloadAppFromCloud = function(cloudData) {
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
};
`;

appJs = appJs.replace(oldReloadRegex, newReload);

fs.writeFileSync('app.js', appJs);
console.log("Patched all save functions and reloadAppFromCloud in app.js");
