const fs = require('fs');

let sync = fs.readFileSync('sync.js', 'utf8');
sync = sync.replace(
    'databaseURL: "https://castudyapp8-default-rtdb.asia-southeast1.firebasedatabase.app"',
    'databaseURL: "https://castudyapp8-default-rtdb.firebaseio.com"'
);
fs.writeFileSync('sync.js', sync);

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(
    'function saveDynamicData() {\r\n  if (window.isReadOnlyMode) { console.log("Read-only mode: Not saving to local storage"); return; }',
    'function saveDynamicData() {\r\n  if (window.isReadOnlyMode) { if(typeof showToast === "function") showToast("Read-Only Mode: Changes will not be saved."); return; }'
);
app = app.replace(
    'function saveDynamicData() {\n  if (window.isReadOnlyMode) { console.log("Read-only mode: Not saving to local storage"); return; }',
    'function saveDynamicData() {\n  if (window.isReadOnlyMode) { if(typeof showToast === "function") showToast("Read-Only Mode: Changes will not be saved."); return; }'
);
fs.writeFileSync('app.js', app);

let css = fs.readFileSync('style.css', 'utf8');
// Use regex to carefully strip the read-only mode css block
css = css.replace(/\/\* GF Read-Only Mode \*\/[\s\S]*?pointer-events: none !important;\r?\n}/g, '');
fs.writeFileSync('style.css', css);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=166');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v166');
fs.writeFileSync('sw.js', sw);
