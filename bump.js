const fs = require('fs');

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v[0-9]+/g, 'v70');
sw = sw.replace(/v=[0-9]+/g, 'v=70');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=[0-9]+/g, 'v=70');
fs.writeFileSync('index.html', html);

console.log('Bumped all to v70');
