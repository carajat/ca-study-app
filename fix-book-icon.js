const fs = require('fs');

// 1. data.js - replace 'book' with 'menu_book'
let data = fs.readFileSync('data.js', 'utf8');
data = data.replace(/"book"/g, '"menu_book"');
fs.writeFileSync('data.js', data);

// 2. app.js - update migration code to also migrate 'book' to 'menu_book'
// and any other stray emojis
let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(
  "if (slot.icon === '☀️') { slot.icon = 'wb_sunny'; emojisModified = true; }",
  "if (slot.icon === '☀️') { slot.icon = 'wb_sunny'; emojisModified = true; }\n        if (slot.icon === 'book') { slot.icon = 'menu_book'; emojisModified = true; }\n        if (slot.icon === '📚') { slot.icon = 'menu_book'; emojisModified = true; }"
);

fs.writeFileSync('app.js', app);

// 3. Bump version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v156/g, 'v157');
fs.writeFileSync('sw.js', sw);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=156/g, 'v=157');
fs.writeFileSync('index.html', index);

console.log('Book icon fix script completed.');
