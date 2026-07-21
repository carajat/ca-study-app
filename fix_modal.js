const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');
const oldOptions = '<option value="study">Study Session</option><option value="revision">Revision</option><option value="mock">Mock Test</option><option value="personal">Personal / Break</option>';
const newOptions = '<option value="primary">Primary Subject</option><option value="secondary">Secondary Subject</option><option value="quick">Quick Task</option>';
app = app.replace(oldOptions, newOptions);
fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v66/g, 'v67');
sw = sw.replace(/v=65/g, 'v=67');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=65/g, 'v=67');
fs.writeFileSync('index.html', html);

console.log('BUMPED to v67');
