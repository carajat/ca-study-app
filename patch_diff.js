const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

const regex = /if \(localHash !== cloudHash\) \{[\s\S]*?location\.reload\(\);\s*\}/;

const newBlock = `if (localHash !== cloudHash) {
    let reloads = parseInt(sessionStorage.getItem('sync_reloads') || '0');
    if (reloads > 1) {
      // FIND DIFF
      let diffStr = "";
      const s1 = localHash;
      const s2 = cloudHash;
      for (let i = 0; i < Math.max(s1.length, s2.length); i++) {
         if (s1[i] !== s2[i]) {
            const start = Math.max(0, i - 30);
            const end1 = Math.min(s1.length, i + 30);
            const end2 = Math.min(s2.length, i + 30);
            diffStr = "Mismatch at index " + i + "<br>LOCAL: ..." + s1.substring(start, end1) + "...<br>CLOUD: ..." + s2.substring(start, end2) + "...";
            break;
         }
      }

      document.body.innerHTML = \`
        <div style="background:black; color:white; padding:20px; font-family:monospace; height:100vh; overflow:auto;">
          <h1 style="color:red">Sync Loop Detected</h1>
          <button onclick="sessionStorage.removeItem('sync_reloads'); location.reload()" style="padding:10px; margin-bottom:20px">Clear & Reload</button>
          <div style="border:2px solid yellow; padding:10px; font-size:24px; font-weight:bold; color:yellow;">
             \${diffStr}
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
index = index.replace(/v=\d+/g, 'v=174');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v174');
fs.writeFileSync('sw.js', sw);
