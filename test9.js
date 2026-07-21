const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
window.localStorage = { getItem: () => null, setItem: () => null };

const dataJs = fs.readFileSync('data.js', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

const vm = require('vm');
vm.createContext(window);

try { vm.runInContext(dataJs, window); } catch(e){}
try { 
  const script = new vm.Script(appJs);
  script.runInContext(window);
} catch(e){}

try {
  window.currentGroup = 'group2';
  // Fake an old entry with a subject!
  window.DYNAMIC_DATA = {
    journalEntries: {
      "2026-07-21": {
        sleep: "7",
        rows: [
          { subject: "Paper 4: Direct Tax", topic: "Intro", tasks: "Read", durHH: 2, durMM: 30, status: "Done" }
        ]
      }
    }
  };
  
  // Fake the date picker value
  window.document.getElementById('journal-date-picker').value = '2026-07-21';

  // Override alert to catch it!
  window.alert = function(msg) {
    console.log("ALERT CALLED:", msg);
  };

  window.loadJournal('2026-07-21');
} catch (e) {
  console.log("CRASH:", e);
}
