const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const data = fs.readFileSync('data.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
dom.window.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

try {
  dom.window.eval(data);
  dom.window.eval(app);
  
  dom.window.openJournal();
  
  console.log("Success! journal-tbody children count:", dom.window.document.getElementById('journal-tbody').children.length);
} catch (e) {
  console.error("Error found:", e);
}
