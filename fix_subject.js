const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const oldLogic = `  if (chapters.length > 0) {
    chapterGroup.style.display = 'block';
    chapterSelect.innerHTML = '<option value="">— Select Chapter —</option>' + 
      chapters.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');
      
    activityGroup.style.display = 'block';
  } else {`;

const newLogic = `  if (chapters.length > 0) {
    chapterGroup.style.display = 'block';
    chapterSelect.innerHTML = '<option value="">— Select Chapter —</option>' + 
      chapters.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');
      
    if (subjectObj && (subjectObj.type === 'ibs' || subj.toLowerCase().startsWith('ibs-'))) {
      activityGroup.style.display = 'none';
    } else {
      activityGroup.style.display = 'block';
    }
  } else {`;

app = app.replace(oldLogic, newLogic);
fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v67/g, 'v68');
sw = sw.replace(/v=67/g, 'v=68');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=67/g, 'v=68');
fs.writeFileSync('index.html', html);

console.log('Fixed and bumped to v68');
