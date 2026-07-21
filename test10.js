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
try { new vm.Script(appJs).runInContext(window); } catch(e){}

try {
  // Let's manually run calculateJournalStats
  // First, we need to create a row
  const tbody = window.document.getElementById('journal-tbody');
  const tr = window.document.createElement('tr');
  tr.innerHTML = `
    <td>
      <div style="display:flex; gap:4px; align-items:center;">
        <input type="number" class="j-duration-hh elegant-input" value="1" onchange="saveJournal()" min="0" placeholder="HH" style="width:45px; padding:6px; text-align:center;">
        <span style="font-weight:bold;">:</span>
        <input type="number" class="j-duration-mm elegant-input" value="30" onchange="saveJournal()" min="0" max="59" placeholder="MM" style="width:45px; padding:6px; text-align:center;">
      </div>
    </td>
  `;
  tbody.appendChild(tr);

  // Now run calculateJournalStats
  window.calculateJournalStats();
  console.log("SUCCESS");
} catch (e) {
  console.log("CRASH:", e.stack);
}
