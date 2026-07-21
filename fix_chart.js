const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

const dynamicChart = `
  const subjectsSet = new Set();
  DYNAMIC_DATA.mocks.forEach(series => {
    series.tests.forEach(m => subjectsSet.add(m.subject));
  });
  const subjects = Array.from(subjectsSet);
  // Give them some default colors
  const palette = ['#6C3CE1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const colors = {};
  subjects.forEach((s, i) => { colors[s] = palette[i % palette.length]; });
`;

if (app.includes("const subjects = ['DT', 'IDT', 'IBS'];")) {
  app = app.replace(
    "const subjects = ['DT', 'IDT', 'IBS'];\n  const colors = { DT: '#6C3CE1', IDT: '#3B82F6', IBS: '#10B981' };",
    dynamicChart
  );

  // Also fix the chart labels based on series count
  app = app.replace(
    "['S1', 'S2', 'S3'].forEach((label, i) => {",
    "DYNAMIC_DATA.mocks.forEach((series, i) => {\n    const label = 'S' + (i + 1);"
  );

  fs.writeFileSync('app.js', app);
}

// Bump SW
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v49/g, 'ca-tracker-v50');
sw = sw.replace(/ca-tracker-v50/g, 'ca-tracker-v50'); // Just in case
fs.writeFileSync('sw.js', sw);

console.log('Chart made dynamic');
