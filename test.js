const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('`n');
if(idx > -1) {
  console.log('FOUND AT', idx);
  fs.writeFileSync('index.html', html.replace(/`n/g, '\n'));
  console.log('FIXED index.html');
} else {
  console.log('NOT FOUND in index.html');
}

const appjs = fs.readFileSync('app.js', 'utf8');
const appIdx = appjs.indexOf('`n');
if (appIdx > -1) {
  console.log('FOUND IN app.js AT', appIdx);
  fs.writeFileSync('app.js', appjs.replace(/`n/g, '\n'));
  console.log('FIXED app.js');
} else {
  console.log('NOT FOUND in app.js');
}
