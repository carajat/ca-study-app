const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// 1. Fix openAddTaskModal
app = app.replace(
  /function openAddTaskModal\(\) \{[\s\S]*?openModal\(/,
  `function openAddTaskModal() {
  const subjects = (DYNAMIC_DATA.syllabusSubjects || []).map(s => ({ value: s.id, label: s.name }));
  
  openModal(`
);

// 2. Fix onTaskSubjectChange
const oldSubjectChange = `function onTaskSubjectChange() {
  const subj = document.getElementById('task-subject').value;
  const chapterGroup = document.getElementById('task-chapter-group');
  const activityGroup = document.getElementById('task-activity-group');
  const chapterSelect = document.getElementById('task-chapter');
  
  if (!subj) {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
    return;
  }
  
  let chapters = [];
  let isMain = false;
  
  if (subj === 'DT' || subj === 'IBS-DT') { chapters = DYNAMIC_DATA.dtChapters; isMain = (subj === 'DT'); }
  else if (subj === 'IDT' || subj === 'IBS-IDT') { chapters = DYNAMIC_DATA.idtChapters; isMain = (subj === 'IDT'); }
  else if (subj.startsWith('IBS-')) {
    const key = subj.replace('IBS-', '').toLowerCase();
    if (DYNAMIC_DATA.ibsSubjects[key]) {
      chapters = DYNAMIC_DATA.ibsSubjects[key].chapters;
    }
  }
  
  if (chapters.length > 0) {
    chapterGroup.style.display = 'block';
    chapterSelect.innerHTML = '<option value="">— Select Chapter —</option>' + 
      chapters.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('');
      
    if (isMain) {
      activityGroup.style.display = 'block';
    } else {
      activityGroup.style.display = 'none';
      document.getElementById('task-activity').value = '';
    }
  } else {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
  }
}`;

const newSubjectChange = `function onTaskSubjectChange() {
  const subj = document.getElementById('task-subject').value;
  const chapterGroup = document.getElementById('task-chapter-group');
  const activityGroup = document.getElementById('task-activity-group');
  const chapterSelect = document.getElementById('task-chapter');
  
  if (!subj) {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
    return;
  }
  
  let chapters = [];
  const subjectObj = (DYNAMIC_DATA.syllabusSubjects || []).find(s => s.id === subj);
  if (subjectObj && subjectObj.chapters) {
    chapters = subjectObj.chapters;
  }
  
  if (chapters.length > 0) {
    chapterGroup.style.display = 'block';
    chapterSelect.innerHTML = '<option value="">— Select Chapter —</option>' + 
      chapters.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('');
      
    activityGroup.style.display = 'block';
  } else {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
  }
}`;
app = app.replace(oldSubjectChange, newSubjectChange);

// 3. Fix addPlannerTask (remove IBS hack)
app = app.replace(
  /  \/\/ For IBS subjects \(no activity dropdown\), implicitly set activity to 'done'\n  if \(subject && subject\.startsWith\('IBS-'\) && chapterId\) \{\n    activityType = 'done';\n  \}/,
  `  // If activity is empty but chapter is selected, default to 'done'
  if (chapterId && !activityType) {
    activityType = 'done';
  }`
);

fs.writeFileSync('app.js', app);

// 4. Update sw.js to v61
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'ca-tracker-v[0-9]+';/, "const CACHE_NAME = 'ca-tracker-v61';");
sw = sw.replace(/v=60/g, "v=61");
fs.writeFileSync('sw.js', sw);

// 5. Update index.html to v61
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=60/g, "v=61");
fs.writeFileSync('index.html', html);

console.log('Fixed planner logic');
