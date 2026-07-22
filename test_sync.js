const fs = require('fs');

const DYNAMIC_DATA = {};
const loadState = () => ({});
let trackerState = {
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedTime: 0,
  pauseStart: null,
  subject: '',
  topic: '',
  task: ''
};

function normalizeForHash(data) {
  if (Array.isArray(data)) {
    const arr = data.map(normalizeForHash).filter(v => v !== undefined && v !== null);
    return arr.length > 0 ? arr : undefined;
  } else if (typeof data === 'object' && data !== null) {
    const newObj = {};
    let hasKeys = false;
    const keys = Object.keys(data).sort();
    for (let k of keys) {
      const val = normalizeForHash(data[k]);
      if (val !== undefined && val !== null) {
        newObj[k] = val;
        hasKeys = true;
      }
    }
    return hasKeys ? newObj : undefined;
  }
  return data;
}

const cloudData = {
  dynamic: {},
  state: {},
  tracker: {
    isRunning: true,
    isPaused: false,
    startTime: 1234567,
    pausedTime: 0,
    pauseStart: null,
    subject: 'hello',
    topic: 'world',
    task: 'test',
    intervalId: 55
  }
};

let newTracker = cloudData.tracker;

  const cleanTracker = {
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

  const localHash = JSON.stringify(normalizeForHash(DYNAMIC_DATA)) + JSON.stringify(normalizeForHash(loadState())) + JSON.stringify(normalizeForHash(cleanLocalTracker));
  const cloudHash = JSON.stringify(normalizeForHash(cloudData.dynamic)) + JSON.stringify(normalizeForHash(cloudData.state)) + JSON.stringify(normalizeForHash(cleanTracker));

  console.log('localHash:', localHash);
  console.log('cloudHash:', cloudHash);
  console.log('Match?', localHash === cloudHash);
