const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

// 1. Remove `if (isEditMode) return;` from toggleFolder
app = app.replace(
  /window\.toggleFolder = function\(id\) \{\s*if \(isEditMode\) return;/g,
  'window.toggleFolder = function(id) {'
);

// 2. Fix moveSyllabusSubject
app = app.replace(
  /window\.moveSyllabusSubject = function[\s\S]*?renderSyllabusTab\(\);\s*\}/g,
  `window.moveSyllabusSubject = function(idx, dir, parentIdx) {
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
}`
);
app = app.replace(
  /function moveSyllabusSubject\(idx, dir\) \{[\s\S]*?renderSyllabusTab\(\);\s*\}/g,
  `window.moveSyllabusSubject = function(idx, dir, parentIdx) {
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
}`
);


// 3. Fix moveMock
app = app.replace(
  /function moveMock\(sIdx, idx, dir\) \{[\s\S]*?renderMocksTab\(\);\s*\}/g,
  `window.moveMock = function(seriesId, idx, dir) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesId);
  if (series && series.tests) {
    if (idx + dir < 0 || idx + dir >= series.tests.length) return;
    reorderArray(series.tests, idx, idx + dir);
    saveDynamicData();
    renderExams();
  }
}`
);
app = app.replace(
  /window\.moveMock = function[\s\S]*?renderMocksTab\(\);\s*\}/g,
  `window.moveMock = function(seriesId, idx, dir) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesId);
  if (series && series.tests) {
    if (idx + dir < 0 || idx + dir >= series.tests.length) return;
    reorderArray(series.tests, idx, idx + dir);
    saveDynamicData();
    renderExams();
  }
}`
);


fs.writeFileSync('app.js', app);

console.log('Fixed edit mode UI updates!');
