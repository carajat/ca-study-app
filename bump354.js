const fs = require('fs');
let app = fs.readFileSync('app.js','utf8');
app = app.replace(/v353/g, 'v354');
fs.writeFileSync('app.js', app);

let html = fs.readFileSync('index.html','utf8');
html = html.replace(/v353/g, 'v354');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('sw.js','utf8');
sw = sw.replace(/v353/g, 'v354');
fs.writeFileSync('sw.js', sw);
