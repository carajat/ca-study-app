const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const legacyFix = `  if (DYNAMIC_DATA.mocks && !Array.isArray(DYNAMIC_DATA.mocks)) {
    const newMocks = [];
    Object.keys(DYNAMIC_DATA.mocks).forEach((key, idx) => {
      newMocks.push({ id: key, name: 'Series ' + (idx + 1), tests: DYNAMIC_DATA.mocks[key] });
    });
    DYNAMIC_DATA.mocks = newMocks;
    saveDynamicData();
  }
  
  // Clean up legacy Group 2 data in Group 1 if they got copied over by mistake
  if (state.activeGroup === 'group1') {
    const hasLegacyDT = DYNAMIC_DATA.mocks.some(series => series.tests && series.tests.some(t => t.subject === 'DT'));
    const isEmpty = DYNAMIC_DATA.finalExams && DYNAMIC_DATA.finalExams.length === 0;
    if (hasLegacyDT || isEmpty) {
      // Re-initialize with proper APP_DATA.group1 defaults
      if (APP_DATA.group1.mocks && Array.isArray(APP_DATA.group1.mocks)) {
         // Need to run the new structure
      }
      
      const newMocks = [];
      if (!Array.isArray(APP_DATA.group1.mocks)) {
         Object.keys(APP_DATA.group1.mocks).forEach((key, idx) => {
            newMocks.push({ id: key, name: 'Series ' + (idx + 1), tests: APP_DATA.group1.mocks[key] });
         });
      } else {
         newMocks.push(...APP_DATA.group1.mocks);
      }
      
      DYNAMIC_DATA.mocks = newMocks.length > 0 ? newMocks : DYNAMIC_DATA.mocks;
      if (APP_DATA.group1.finalExams.length > 0) DYNAMIC_DATA.finalExams = JSON.parse(JSON.stringify(APP_DATA.group1.finalExams));
      if (APP_DATA.group1.syllabusSubjects.length > 0) DYNAMIC_DATA.syllabusSubjects = JSON.parse(JSON.stringify(APP_DATA.group1.syllabusSubjects));
      saveDynamicData();
    }
  }`;

app = app.replace(
  /if \(DYNAMIC_DATA\.mocks && !Array\.isArray\(DYNAMIC_DATA\.mocks\)\) \{[\s\S]*?saveDynamicData\(\);\s*\}/,
  legacyFix
);

fs.writeFileSync('app.js', app);

// Bump version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v79/g, 'v80');
sw = sw.replace(/v=79/g, 'v=80');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=79/g, 'v=80');
fs.writeFileSync('index.html', html);

console.log('App updated for legacy fix!');
