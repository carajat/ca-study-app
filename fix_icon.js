const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(/drag_indicator/g, 'drag_handle');
fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v47/g, 'ca-tracker-v48');
fs.writeFileSync('sw.js', sw);

console.log('Icon replaced');
