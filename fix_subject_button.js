const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

const targetStr = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +`;

const replaceStr = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); openSubjectDetail(\\'' + subj.id + '\\', \\'' + subj.type + '\\')" title="Open Subject"><span class="material-symbols-rounded">arrow_forward</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +`;

app = app.replace(targetStr, replaceStr);

fs.writeFileSync('app.js', app);

// Bump cache again
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v\d+/g, 'ca-tracker-v83');
sw = sw.replace(/v=\d+/g, 'v=83');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=\d+/g, 'v=83');
fs.writeFileSync('index.html', html);

console.log('Added arrow_forward to subjects!');
