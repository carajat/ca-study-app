const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// Replace the bad `subj.children.length` with `DYNAMIC_DATA.syllabusSubjects[parentIdx].children.length`
app = app.replace(
  /idx === \(isNested \? subj\.children\.length - 1 : DYNAMIC_DATA\.syllabusSubjects\.length - 1\)/g,
  'idx === (isNested ? DYNAMIC_DATA.syllabusSubjects[parentIdx].children.length - 1 : DYNAMIC_DATA.syllabusSubjects.length - 1)'
);

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v73/g, 'v74');
sw = sw.replace(/v=73/g, 'v=74');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=73/g, 'v=74');
fs.writeFileSync('index.html', html);

console.log('Fixed rendering error!');
