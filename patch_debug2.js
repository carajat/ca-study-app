const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

const regex = /if \(localHash !== cloudHash\) \{[\s\S]*?location\.reload\(\);\s*\}/;

const newBlock = `if (localHash !== cloudHash) {
    let reloads = parseInt(sessionStorage.getItem('sync_reloads') || '0');
    if (reloads > 1) {
      document.body.innerHTML = \`
        <div style="background:black; color:white; padding:20px; font-family:monospace; height:100vh; overflow:auto;">
          <h1 style="color:red">Sync Loop Detected</h1>
          <button onclick="sessionStorage.removeItem('sync_reloads'); location.reload()" style="padding:10px; margin-bottom:20px">Clear & Reload</button>
          <div style="display:flex; gap:20px">
            <div style="flex:1; border:2px solid red; padding:10px"><h3>LOCAL (Red)</h3>\${localHash}</div>
            <div style="flex:1; border:2px solid green; padding:10px"><h3>CLOUD (Green)</h3>\${cloudHash}</div>
          </div>
        </div>
      \`;
      return;
    }
    sessionStorage.setItem('sync_reloads', (reloads + 1).toString());

    console.log("Cloud data differs. Applying sync and reloading...");
    localStorage.setItem(getDynamicDataKey(), JSON.stringify(newDynamic));
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
    
    if (cleanTracker.isRunning || cleanTracker.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify(cleanTracker));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
    
    location.reload();
  }`;

app = app.replace(regex, newBlock);
fs.writeFileSync('app.js', app);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=173');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v173');
fs.writeFileSync('sw.js', sw);
