const fs = require('fs');
let app = fs.readFileSync('app.js','utf8');
app = app.replace(/v352/g, 'v353');
fs.writeFileSync('app.js', app);

let html = fs.readFileSync('index.html','utf8');
html = html.replace(/v352/g, 'v353');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('sw.js','utf8');
sw = sw.replace(/v352/g, 'v353');
fs.writeFileSync('sw.js', sw);
