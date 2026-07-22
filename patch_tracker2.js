const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

const regex = /const cleanTracker = \{[\s\S]*?cleanLocalTracker\)\);/;

const newBlock = `const cleanTracker = {
    isRunning: !!newTracker.isRunning,
    isPaused: !!newTracker.isPaused,
    startTime: newTracker.startTime || null,
    pausedTime: newTracker.pausedTime || 0,
    pauseStart: newTracker.pauseStart || null,
    subject: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.subject || '') : '',
    topic: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.topic || '') : '',
    task: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.task || '') : ''
  };

  const cleanLocalTracker = {
    isRunning: !!trackerState.isRunning,
    isPaused: !!trackerState.isPaused,
    startTime: trackerState.startTime || null,
    pausedTime: trackerState.pausedTime || 0,
    pauseStart: trackerState.pauseStart || null,
    subject: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.subject || '') : '',
    topic: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.topic || '') : '',
    task: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.task || '') : ''
  };

  const localHash = JSON.stringify(normalizeForHash(DYNAMIC_DATA)) + JSON.stringify(normalizeForHash(loadState())) + JSON.stringify(normalizeForHash(cleanLocalTracker));`;

app = app.replace(regex, newBlock);
fs.writeFileSync('app.js', app);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=175');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v175');
fs.writeFileSync('sw.js', sw);
