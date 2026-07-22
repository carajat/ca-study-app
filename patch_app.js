const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

app = app.replace(
    'function saveDynamicData() {',
    'function saveDynamicData() {\n  if (window.isReadOnlyMode) { console.log("Read-only mode: Not saving to local storage"); return; }'
);

// Also add a visual indicator in the settings menu
app = app.replace(
    '</span> Settings & Tools\', `',
    '</span> Settings & Tools\' + (window.isReadOnlyMode ? \' <span style="color:var(--error-color); font-size:12px; margin-left:10px;">(GF Read-Only)</span>\' : \'\'), `'
);

fs.writeFileSync('app.js', app);
console.log('App.js patched successfully.');
