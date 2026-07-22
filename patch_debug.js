const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const debugCode = `
  if (localHash !== cloudHash) {
    console.log("Cloud data differs. Applying sync and reloading...");
    localStorage.setItem(getDynamicDataKey(), JSON.stringify(newDynamic));
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
    
    if (cleanTracker.isRunning || cleanTracker.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify(cleanTracker));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
    
    let reloads = parseInt(sessionStorage.getItem('sync_reloads') || '0');
    if (reloads > 1) {
       document.body.innerHTML = '<div style="padding:20px; color:white; background:black; height:100vh; overflow:auto;"><h1>Sync Loop Detected</h1><p>Please screenshot this and send to developer:</p><div style="word-break:break-all; font-family:monospace; font-size:10px; margin-bottom:10px; border:1px solid red; padding:5px;">LOCAL:<br>' + localHash + '</div><div style="word-break:break-all; font-family:monospace; font-size:10px; border:1px solid green; padding:5px;">CLOUD:<br>' + cloudHash + '</div><button onclick="sessionStorage.removeItem(\\'sync_reloads\\'); location.reload();" style="padding:10px; margin-top:20px;">Reset & Reload</button></div>';
       return;
    }
    sessionStorage.setItem('sync_reloads', (reloads + 1).toString());
    
    location.reload();
  } else {
    sessionStorage.removeItem('sync_reloads');
  }
`;

app = app.replace(
    /if \(localHash !== cloudHash\) \{[\s\S]*?location\.reload\(\);\r?\n  \}/,
    debugCode
);

fs.writeFileSync('app.js', app);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=170');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v170');
fs.writeFileSync('sw.js', sw);
