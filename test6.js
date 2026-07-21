const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Polyfill matchMedia
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

const dataJs = fs.readFileSync('data.js', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

const vm = require('vm');
vm.createContext(window);

try {
  vm.runInContext(dataJs, window);
} catch (e) { console.error("Error data.js:", e); }

try {
  vm.runInContext(appJs, window);
} catch (e) { console.error("Error app.js:", e); }

try {
  window.currentGroup = 'group2';
  window.APP_DATA = window.APP_DATA || {};
  // Call it
  window.loadJournal('2026-07-21');
  console.log("Tbody content:", window.document.getElementById('journal-tbody').innerHTML.trim().substring(0, 100));
} catch (e) {
  console.error("CRASH:", e);
}
