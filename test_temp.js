const fs = require('fs');
let code = fs.readFileSync('temp_app.js', 'utf8');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><html><body>
<div id="schedule-slots-container"></div>
<ul id="study-rules-list"></ul>
</body></html>`);

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem:()=>null, setItem:()=>{} };
global.navigator = { serviceWorker: { register: ()=>Promise.resolve() } };
global.matchMedia = ()=>({addEventListener:()=>{}, removeEventListener:()=>{}});

// Just evaluate temp_app.js
try {
  eval(code);
  
  // mock state
  state.activeSchedule = Object.keys(DYNAMIC_DATA.schedules)[0] || 'active';
  console.log('Active schedule:', state.activeSchedule);
  
  renderSchedule();
  console.log('renderSchedule executed successfully');
} catch (e) {
  console.error('CRASH:', e.message);
  console.error(e.stack);
}
