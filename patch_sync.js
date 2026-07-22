const fs = require('fs');

let sync = fs.readFileSync('sync.js', 'utf8');

const globals = `window.GF_EMAIL = 'shrutiagrrawal@gmail.com';
window.isReadOnlyMode = false;
`;

if (!sync.includes('window.GF_EMAIL')) {
    sync = sync.replace('const SHARED_PATH', globals + '\nconst SHARED_PATH');
}

sync = sync.replace(
    'window.isCloudLoggedIn = !!user;',
    'window.isCloudLoggedIn = !!user;\n    window.isReadOnlyMode = user ? (user.email === window.GF_EMAIL) : false;'
);

sync = sync.replace(
    'window.syncToCloud = function(data) {\n  if (!currentUser || !db) return; \n  if (isSyncing) return;',
    'window.syncToCloud = function(data) {\n  if (!currentUser || !db) return; \n  if (isSyncing) return;\n  if (window.isReadOnlyMode) { console.log("Read-only mode: Sync prevented"); return; }'
);

fs.writeFileSync('sync.js', sync);

console.log("Patched sync.js");
