const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = { getItem: () => null, setItem: () => null };

// We need to properly run the scripts inside the JSDOM context so they attach to window
const dataJs = fs.readFileSync('data.js', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

const script1 = dom.window.document.createElement('script');
script1.textContent = dataJs;
dom.window.document.body.appendChild(script1);

const script2 = dom.window.document.createElement('script');
script2.textContent = appJs;
dom.window.document.body.appendChild(script2);

setTimeout(() => {
  try {
    dom.window.currentGroup = 'group2';
    dom.window.addJournalRow();
    console.log('Row added successfully!');
    console.log('HTML inside tbody:', dom.window.document.getElementById('journal-tbody').innerHTML.substring(0, 200));
  } catch(e) {
    console.error('CRASH:', e);
  }
}, 500);
