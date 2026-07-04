const fs = require('fs');
let app = fs.readFileSync('app.js','utf8');
app = app.replace('placeholder="e.g. Ch 24 Transfer Pricing — ALP methods"', 'placeholder="e.g. Complete pending questions"');
fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v61/g, 'v62');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=61/g, 'v=62');
fs.writeFileSync('index.html', html);
console.log('Fixed');
