const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// For Folders
const folderTarget = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, null)"';`;

const folderReplacement = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
            '<button class="move-btn" onclick="event.stopPropagation(); toggleFolder(\\'' + subj.id + '\\')" title="Expand/Collapse"><span class="material-symbols-rounded" id="arrow-' + subj.id + '">expand_more</span></button>' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, null)"';`;

app = app.replace(
  /'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' \+\s*'<button class="move-btn" onclick="event.stopPropagation\(\); moveSyllabusSubject\(' \+ idx \+ ', -1, null\)"'/g,
  folderReplacement
);

// For Subjects
const subjectTarget = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, ' + (isNested ? parentIdx : 'null') + ')"';`;

const subjectReplacement = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); openSubjectDetail(\\'' + subj.id + '\\', \\'' + subj.type + '\\')" title="Open Chapters"><span class="material-symbols-rounded">arrow_forward</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, ' + (isNested ? parentIdx : 'null') + ')"';`;

app = app.replace(
  /'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' \+\s*'<button class="move-btn" onclick="event.stopPropagation\(\); moveSyllabusSubject\(' \+ idx \+ ', -1, ' \+ \(isNested \? parentIdx : 'null'\) \+ '\)"'/g,
  subjectReplacement
);

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v80/g, 'v81');
sw = sw.replace(/v=80/g, 'v=81');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=80/g, 'v=81');
fs.writeFileSync('index.html', html);

console.log('Added expand/open buttons to edit mode!');
