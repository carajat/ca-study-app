const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Add try-catch to loadJournal
appJs = appJs.replace(
  /function loadJournal\(dateStr\) \{/,
  `function loadJournal(dateStr) {\n  try {`
);
appJs = appJs.replace(
  /  calculateJournalStats\(\);\n\}/,
  `  calculateJournalStats();\n  } catch (e) { alert("ERROR IN LOADJOURNAL: " + e.stack); }\n}`
);

// 2. Add try-catch to addJournalRow
appJs = appJs.replace(
  /function addJournalRow\(data = \{\}\) \{/,
  `function addJournalRow(data = {}) {\n  try {`
);
appJs = appJs.replace(
  /  calculateJournalStats\(\);\n\}/,
  `  calculateJournalStats();\n  } catch (e) { alert("ERROR IN ADDROW: " + e.stack); }\n}`
);

// 3. Add auto-update logic at the top of app.js
const autoUpdateCode = `
// FORCE UPDATE LOGIC v95
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    let shouldReload = false;
    for(let registration of registrations) {
      registration.unregister();
      shouldReload = true;
    }
    if (shouldReload && !window.location.href.includes('v=95')) {
      window.location.href = window.location.pathname + '?v=95';
    }
  });
}
`;
appJs = autoUpdateCode + '\n' + appJs;

fs.writeFileSync('app.js', appJs);

// Also update index.html to v95
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=94/g, 'v=95');
fs.writeFileSync('index.html', html);

console.log("Patched app.js with try-catch and SW unregister, bumped to v95");
