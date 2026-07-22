const fs = require('fs');
let sync = fs.readFileSync('sync.js', 'utf8');

sync = sync.replace(
    'console.error("Firebase sync error.", err.message);',
    'console.error("Firebase sync error.", err.message); if(typeof showToast === "function") showToast("Sync Error: " + err.message);'
);
fs.writeFileSync('sync.js', sync);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=165');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v164/g, 'v165');
fs.writeFileSync('sw.js', sw);
