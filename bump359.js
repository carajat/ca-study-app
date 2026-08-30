const fs = require('fs');

let sw = fs.readFileSync('sw.js','utf8');
sw = sw.replace(/v358/g, 'v359');
fs.writeFileSync('sw.js', sw);

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(/v358/g, 'v359');
fs.writeFileSync('app.js', app);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v358/g, 'v359');
fs.writeFileSync('index.html', html);
