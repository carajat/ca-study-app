const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

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

try {
  eval(code);
  state.activeSchedule = Object.keys(DYNAMIC_DATA.schedules)[0];
  
  renderSchedule();
  console.log('DOM after render:', document.getElementById('schedule-slots-container').innerHTML);
} catch (e) {
  console.error('CRASH:', e.message);
  console.error(e.stack);
}
