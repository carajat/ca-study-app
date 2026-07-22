const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const normalizeFn = `
function normalizeForHash(data) {
  if (Array.isArray(data)) {
    const arr = data.map(normalizeForHash).filter(v => v !== undefined && v !== null);
    return arr.length > 0 ? arr : undefined;
  } else if (typeof data === 'object' && data !== null) {
    const newObj = {};
    let hasKeys = false;
    for (let k in data) {
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
`;

// Insert the normalize function before reloadAppFromCloud
app = app.replace('window.reloadAppFromCloud = function(cloudData) {', normalizeFn + '\nwindow.reloadAppFromCloud = function(cloudData) {');

// Replace the hash logic
app = app.replace(
    'const localHash = JSON.stringify(DYNAMIC_DATA) + JSON.stringify(loadState()) + JSON.stringify(trackerState);',
    'const localHash = JSON.stringify(normalizeForHash(DYNAMIC_DATA)) + JSON.stringify(normalizeForHash(loadState())) + JSON.stringify(normalizeForHash(trackerState));'
);
app = app.replace(
    'const cloudHash = JSON.stringify(newDynamic) + JSON.stringify(newState) + JSON.stringify(cleanTracker);',
    'const cloudHash = JSON.stringify(normalizeForHash(newDynamic)) + JSON.stringify(normalizeForHash(newState)) + JSON.stringify(normalizeForHash(cleanTracker));'
);

fs.writeFileSync('app.js', app);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=167');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v167');
fs.writeFileSync('sw.js', sw);
