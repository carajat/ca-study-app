const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// The regex matches the block from "const localHash = ..." down to "sessionStorage.removeItem('sync_reloads');\n  }"
const regex = /const localHash = JSON\.stringify\(normalizeForHash\(DYNAMIC_DATA\)\) \+[\s\S]*?sessionStorage\.removeItem\('sync_reloads'\);\r?\n  \}/;

const newBlock = `
  const cleanLocalTracker = {
    isRunning: !!trackerState.isRunning,
    isPaused: !!trackerState.isPaused,
    startTime: trackerState.startTime || null,
    pausedTime: trackerState.pausedTime || 0,
    pauseStart: trackerState.pauseStart || null,
    subject: trackerState.subject || '',
    topic: trackerState.topic || '',
    task: trackerState.task || ''
  };

  const localHash = JSON.stringify(normalizeForHash(DYNAMIC_DATA)) + JSON.stringify(normalizeForHash(loadState())) + JSON.stringify(normalizeForHash(cleanLocalTracker));
  const cloudHash = JSON.stringify(normalizeForHash(newDynamic)) + JSON.stringify(normalizeForHash(newState)) + JSON.stringify(normalizeForHash(cleanTracker));
  
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
`;

app = app.replace(regex, newBlock.trim());

fs.writeFileSync('app.js', app);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=171');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v171');
fs.writeFileSync('sw.js', sw);
