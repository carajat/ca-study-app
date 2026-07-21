const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Polyfills
window.matchMedia = window.matchMedia || function() {
    return { matches: false, addListener: function() {}, removeListener: function() {} };
};
window.localStorage = { getItem: () => null, setItem: () => null };

const dataJs = fs.readFileSync('data.js', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

const vm = require('vm');
vm.createContext(window);

try {
  vm.runInContext(dataJs, window);
} catch (e) {
  console.log("data.js Error:", e);
}

try {
  // Let's run it with a proxy or just catch the error properly
  const script = new vm.Script(appJs, { filename: 'app.js' });
  script.runInContext(window);
} catch (e) {
  console.log("app.js LOAD ERROR:", e.name, e.message, e.stack);
}
