const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// Patch trackerStop
appJs = appJs.replace(
  `if (!DYNAMIC_DATA.journalEntries[todayStr]) {
      DYNAMIC_DATA.journalEntries[todayStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
    }`,
  `if (!DYNAMIC_DATA.journalEntries[todayStr]) {
      DYNAMIC_DATA.journalEntries[todayStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
    }
    if (!DYNAMIC_DATA.journalEntries[todayStr].rows) {
      DYNAMIC_DATA.journalEntries[todayStr].rows = [];
    }`
);

// Patch saveManualLog
appJs = appJs.replace(
  `if (!DYNAMIC_DATA.journalEntries[dateStr]) {
    DYNAMIC_DATA.journalEntries[dateStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
  }`,
  `if (!DYNAMIC_DATA.journalEntries[dateStr]) {
    DYNAMIC_DATA.journalEntries[dateStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
  }
  if (!DYNAMIC_DATA.journalEntries[dateStr].rows) {
    DYNAMIC_DATA.journalEntries[dateStr].rows = [];
  }`
);

fs.writeFileSync('app.js', appJs);
console.log("Patched missing rows init");
