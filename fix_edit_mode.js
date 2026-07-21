const fs = require('fs');

// Fix app.js
let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(
  /\$\{idx===slots\.length-1 \? 'disabled' : ''\}/g,
  "${idx===DYNAMIC_DATA.schedules[state.activeSchedule].slots.length-1 ? 'disabled' : ''}"
);
// Fix duplicate edit-mode-controls inner divs in app.js for Syllabus & Schedule to make it clean
app = app.replace(
  /'<div class="edit-mode-controls">' \+\s*'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">'/g,
  '\'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">\''
);
app = app.replace(
  /'<\/div>' \+\s*'<\/div>'/g,
  '\'</div>\''
);
// And fix the ones inside template literals if any
app = app.replace(
  /<div class="edit-mode-controls">\s*<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">/g,
  '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">'
);
app = app.replace(
  /<\/div>\s*<\/div>\s*` : ''\}/g,
  '</div>\n` : \'\'}'
);

fs.writeFileSync('app.js', app);

// Fix style.css
let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(
  /\.st-row\.is-edit \{ grid-template-columns: 32px 1fr 42px; \}/g,
  '.st-row.is-edit { grid-template-columns: 1fr auto; }'
);
fs.writeFileSync('style.css', css);

// Bump versions
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v76/g, 'v77');
sw = sw.replace(/v=76/g, 'v=77');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=76/g, 'v=77');
fs.writeFileSync('index.html', html);

console.log('Fixed edit mode bugs!');
