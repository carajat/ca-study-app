const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

// 1. Remove `if (isEditMode) return;` from toggleFolder
app = app.replace(
  /window\.toggleFolder = function\(id\) \{\s*if \(isEditMode\) return;/g,
  'window.toggleFolder = function(id) {'
);

// 2. Replace moveSyllabusSubject entirely
const moveSyllabusSubjectRegex = /function moveSyllabusSubject\(idx, dir\) \{[\s\S]*?renderSyllabusTab\(\);\s*\}/g;
app = app.replace(moveSyllabusSubjectRegex, `window.moveSyllabusSubject = function(idx, dir, parentIdx) {
  if (parentIdx !== null && parentIdx !== 'null' && parentIdx !== undefined) {
    const parent = DYNAMIC_DATA.syllabusSubjects[parentIdx];
    if (parent && parent.children) {
      if (idx + dir < 0 || idx + dir >= parent.children.length) return;
      reorderArray(parent.children, idx, idx + dir);
      saveDynamicData();
      showSubjectsList();
    }
  } else {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.syllabusSubjects.length) return;
    reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx + dir);
    saveDynamicData();
    showSubjectsList();
  }
}`);

// 3. Replace moveMock entirely
const moveMockRegex = /function moveMock\(sIdx, idx, dir\) \{[\s\S]*?renderMocksTab\(\);\s*\}/g;
app = app.replace(moveMockRegex, `window.moveMock = function(seriesId, idx, dir) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesId);
  if (series && series.tests) {
    if (idx + dir < 0 || idx + dir >= series.tests.length) return;
    reorderArray(series.tests, idx, idx + dir);
    saveDynamicData();
    renderExams();
  }
}`);

// Wait, I should also make sure moveScheduleSlot renders schedule!
// moveScheduleSlot uses `renderScheduleDetail(scheduleKey)` which does not exist! It should be `renderSchedule()`.
app = app.replace(
  /renderScheduleDetail\(scheduleKey\);/g,
  'renderSchedule();'
);

fs.writeFileSync('app.js', app);

// Bump versions
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v78/g, 'v79');
sw = sw.replace(/v=78/g, 'v=79');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=78/g, 'v=79');
fs.writeFileSync('index.html', html);

console.log('Fixed edit mode UI updates safely!');
