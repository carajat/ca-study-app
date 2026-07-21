const fs = require('fs');

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v\d+/g, 'ca-tracker-v82');
sw = sw.replace(/v=\d+/g, 'v=82');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=\d+/g, 'v=82');
fs.writeFileSync('index.html', html);

console.log('Fixed cache versions!');
