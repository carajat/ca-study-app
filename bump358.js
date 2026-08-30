const fs = require('fs');
let sw = fs.readFileSync('sw.js','utf8');
sw = sw.replace(/v357/g, 'v358');
fs.writeFileSync('sw.js', sw);

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(/v357/g, 'v358');
fs.writeFileSync('app.js', app);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v357/g, 'v358');
fs.writeFileSync('index.html', html);
