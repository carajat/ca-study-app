const fs = require('fs');

let sync = fs.readFileSync('sync.js', 'utf8');

const newSyncToCloud = `
let syncTimeout = null;
window.syncToCloud = function(data) {
  if (!currentUser || !db) return; 
  if (window.isReadOnlyMode) { console.log("Read-only mode: Sync prevented"); return; } 
  
  const cleanData = JSON.parse(JSON.stringify(data));
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(() => {
    db.ref(SHARED_PATH).set(cleanData).catch(err => {
      console.error("Firebase sync error.", err.message); 
      if(typeof showToast === "function") showToast("Sync Error: " + err.message);
    });
  }, 300);
}
`;

sync = sync.replace(/window\.syncToCloud = function\(data\) \{[\s\S]*?\}\r?\n/, newSyncToCloud.trim() + '\n');
fs.writeFileSync('sync.js', sync);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=172');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v172');
fs.writeFileSync('sw.js', sw);
