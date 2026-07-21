const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// Fix the selector in updateChapterProgress and any other place
app = app.replace(
  "const pctEl = headerEl.querySelector('span');",
  "const pctEl = headerEl.querySelector('.detail-progress span');"
);

fs.writeFileSync('app.js', app);

// Bump SW version to v43
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v42/g, 'ca-tracker-v43');
fs.writeFileSync('sw.js', sw);

console.log('Fixed pctEl selector');
