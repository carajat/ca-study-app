const fs = require('fs');

// 1. Fix sw.js caching by adding cache-busting
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'ca-tracker-v[0-9]+';/, "const CACHE_NAME = 'ca-tracker-v53';");
sw = sw.replace(
  /const ASSETS = \[\s*'\/',\s*'\/index\.html',\s*'\/style\.css',\s*'\/app\.js',\s*'\/data\.js',/g,
  `const ASSETS = [
  '/',
  '/index.html?v=53',
  '/style.css?v=53',
  '/app.js?v=53',
  '/data.js?v=53',`
);
fs.writeFileSync('sw.js', sw);

// 2. Fix app.js loadDynamicData crash
let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(
  "DYNAMIC_DATA = JSON.parse(JSON.stringify(APP_DATA[state.activeGroup]));",
  `
    try {
      if (!APP_DATA[state.activeGroup]) throw new Error("APP_DATA missing group");
      DYNAMIC_DATA = JSON.parse(JSON.stringify(APP_DATA[state.activeGroup]));
    } catch(e) {
      console.error(e);
      // Fallback if data.js is somehow old
      DYNAMIC_DATA = JSON.parse(JSON.stringify(APP_DATA.group2 || APP_DATA));
    }
  `
);
// Also set dropdown value on init
app = app.replace(
  "renderDashboard();",
  "const gs = document.getElementById('group-selector'); if(gs) gs.value = state.activeGroup;\n  renderDashboard();"
);
fs.writeFileSync('app.js', app);

console.log("v53 fixes applied");
