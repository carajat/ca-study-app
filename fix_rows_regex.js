const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// Use regex to find the push statement and inject the check BEFORE it
// In trackerStop: DYNAMIC_DATA.journalEntries[todayStr].rows.push({
const patch1 = `    if (!DYNAMIC_DATA.journalEntries[todayStr].rows) { DYNAMIC_DATA.journalEntries[todayStr].rows = []; }\n    DYNAMIC_DATA.journalEntries[todayStr].rows.push({`;
appJs = appJs.replace(/DYNAMIC_DATA\.journalEntries\[todayStr\]\.rows\.push\(\{/g, patch1);

// In saveManualLog: DYNAMIC_DATA.journalEntries[dateStr].rows.push({
const patch2 = `  if (!DYNAMIC_DATA.journalEntries[dateStr].rows) { DYNAMIC_DATA.journalEntries[dateStr].rows = []; }\n  DYNAMIC_DATA.journalEntries[dateStr].rows.push({`;
appJs = appJs.replace(/DYNAMIC_DATA\.journalEntries\[dateStr\]\.rows\.push\(\{/g, patch2);

fs.writeFileSync('app.js', appJs);
console.log("Successfully patched via regex.");
