const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

const window = dom.window;

window.localStorage = {
  getItem: () => null,
  setItem: () => null
};

// Instead of executing the scripts via <script> tags which might fail asynchronously,
// Let's eval them in the context of `window` directly!

const dataJs = fs.readFileSync('data.js', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

// We can just use vm to run it in the context of the JSDOM window
const vm = require('vm');
vm.createContext(window);

try {
  vm.runInContext(dataJs, window);
  vm.runInContext(appJs, window);
} catch (e) {
  console.error("Error during script load:", e);
}

// Now the window has everything!
try {
  window.currentGroup = 'group2';
  // Let's call loadJournal which calls addJournalRow
  window.loadJournal('2026-07-21');
  console.log("SUCCESS! loadJournal ran without errors.");
  console.log("Tbody content:", window.document.getElementById('journal-tbody').innerHTML.trim().substring(0, 100));
} catch (e) {
  console.error("CRASH IN RUNTIME:", e);
}
