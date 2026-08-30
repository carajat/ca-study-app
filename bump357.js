const fs = require('fs');

let html = fs.readFileSync('index.html','utf8');
html = html.replace(/v356/g, 'v357');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('sw.js','utf8');
sw = sw.replace(/v356/g, 'v357');
fs.writeFileSync('sw.js', sw);
