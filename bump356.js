const fs = require('fs');

let html = fs.readFileSync('index.html','utf8');
html = html.replace(/v355/g, 'v356');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('sw.js','utf8');
sw = sw.replace(/v355/g, 'v356');
fs.writeFileSync('sw.js', sw);
