const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// Fix moveMock
app = app.replace(
  /function moveMock\(sIdx, idx, dir\) \{[\s\S]*?renderMocksTab\(\);\n\s*\}/,
  `function moveMock(seriesKey, idx, dir) {
  if (DYNAMIC_DATA.mocks[seriesKey]) {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.mocks[seriesKey].tests.length) return;
    reorderArray(DYNAMIC_DATA.mocks[seriesKey].tests, idx, idx + dir);
    saveDynamicData();
    renderMocksTab();
  }
}`
);

// Fix moveSyllabusSubject
app = app.replace(
  /function moveSyllabusSubject\(idx, dir\) \{[\s\S]*?renderSyllabusTab\(\);\n\s*\}/,
  `function moveSyllabusSubject(idx, dir, parentIdx = null) {
  if (parentIdx !== null) {
    const parent = DYNAMIC_DATA.syllabusSubjects[parentIdx];
    if (idx + dir < 0 || idx + dir >= parent.children.length) return;
    reorderArray(parent.children, idx, idx + dir);
  } else {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.syllabusSubjects.length) return;
    reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx + dir);
  }
  saveDynamicData();
  renderSyllabusTab();
}`
);

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v74/g, 'v75');
sw = sw.replace(/v=74/g, 'v=75');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=74/g, 'v=75');
fs.writeFileSync('index.html', html);

console.log('Fixed functions!');
