const fs = require('fs');

// Bump sw.js to v94
let swJs = fs.readFileSync('sw.js', 'utf8');
swJs = swJs.replace(/v92/g, 'v94').replace(/v93/g, 'v94');
fs.writeFileSync('sw.js', swJs);

// Bump index.html to v94
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=92/g, 'v=94').replace(/v=93/g, 'v=94');
fs.writeFileSync('index.html', html);

console.log('Bumped to v94');
