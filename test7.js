const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');
const dataJs = fs.readFileSync('data.js', 'utf8');

try {
  new Function(dataJs);
  console.log("data.js compiles fine");
} catch(e) {
  console.error("Syntax Error in data.js:", e);
}

try {
  new Function(appJs);
  console.log("app.js compiles fine");
} catch(e) {
  console.error("Syntax Error in app.js:", e);
}
