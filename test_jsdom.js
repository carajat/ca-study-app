const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const code = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><html><body>
<div id="schedule-slots-container"></div>
<ul id="study-rules-list"></ul>
</body></html>`);

// Mock browser environment
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { serviceWorker: { register: async () => {} } };
global.matchMedia = () => ({ addEventListener: () => {}, removeEventListener: () => {} });

// We need to bypass the DOMContentLoaded listener so we can trigger it manually,
// or we just extract renderSchedule directly. Since app.js wraps things, let's just run it:
try {
  // Execute the script in the context of the fake DOM
  const scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = code;
  dom.window.document.body.appendChild(scriptEl);
  
  // Now call renderSchedule
  dom.window.eval(`
    // Need to initialize DYNAMIC_DATA since app.js might wait for DOMContentLoaded
    if (typeof DYNAMIC_DATA === 'undefined' || !DYNAMIC_DATA) {
      window.DYNAMIC_DATA = { 
        schedules: { 
          'active': { 
            slots: [ {id: 's1', type: 'study', startRange: '10:00-12:00', duration: 120} ], 
            rules: [] 
          } 
        },
        consistency: { dailyLog: {} }
      };
      window.state.activeSchedule = 'active';
    }
    
    try {
      renderSchedule();
      console.log('DOM after render:', document.getElementById('schedule-slots-container').innerHTML.substring(0, 100));
    } catch(e) {
      console.error("CRASH IN renderSchedule:", e.message);
      console.error(e.stack);
    }
  `);
} catch (e) {
  console.error("CRASH DURING INIT:", e.message);
}
