const fs = require('fs');

function applyRegexReplace(app, regex, replacement, description) {
  if (regex.test(app)) {
    app = app.replace(regex, replacement);
    console.log('SUCCESS: ' + description);
  } else {
    console.log('FAILED: ' + description);
  }
  return app;
}

let app = fs.readFileSync('app.js', 'utf8');

// 1. Add Data Migration in loadDynamicData
app = applyRegexReplace(app, 
  /(\/\/ Migrate to unified syllabusSubjects if not present\s*if \(\!DYNAMIC_DATA\.syllabusSubjects\) \{[\s\S]*?saveDynamicData\(\);\s*\})/,
  `$1

  // Migrate flat IBS subjects to Folder structure
  if (DYNAMIC_DATA.syllabusSubjects) {
    const ibsItems = DYNAMIC_DATA.syllabusSubjects.filter(s => (s.type === 'ibs' || s.id.startsWith('ibs-')) && !s.children);
    if (ibsItems.length > 0) {
       const folder = {
         id: 'ibs-folder',
         name: 'Paper 6: IBS (MCS)',
         source: 'Multidisciplinary Case Study',
         type: 'folder',
         children: ibsItems
       };
       DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || s.id.startsWith('ibs-') && !s.children));
       DYNAMIC_DATA.syllabusSubjects.push(folder);
       saveDynamicData();
    }
  }`, 
  "Data Migration");

// 2. Modify calculateSubjectProgress
const calculateSubjectProgressNew = `function calculateSubjectProgress(subjectId, type) {
  const subjects = DYNAMIC_DATA.syllabusSubjects || [];
  
  let foundSubj = null;
  const findSubj = (list) => {
    for (let s of list) {
      if (s.id === subjectId) return s;
      if (s.type === 'folder' && s.children) {
        const sub = findSubj(s.children);
        if (sub) return sub;
      }
    }
    return null;
  };
  foundSubj = findSubj(subjects);
  
  if (!foundSubj) return 0;
  
  if (foundSubj.type === 'folder') {
    if (!foundSubj.children || foundSubj.children.length === 0) return 0;
    let total = 0;
    foundSubj.children.forEach(child => {
      total += calculateSubjectProgress(child.id, child.type);
    });
    return Math.round(total / foundSubj.children.length);
  }
  
  const chaps = foundSubj.chapters || [];`;
app = applyRegexReplace(app, 
  /function calculateSubjectProgress\(subjectId, type\) \{[\s\S]*?const chaps = (.*)\.chapters \|\| \[\];/,
  calculateSubjectProgressNew,
  "calculateSubjectProgress");

// 3. Modify showSubjectsList
const showSubjectsListNew = `function showSubjectsList() {
  state.syllabusView = 'list';
  document.getElementById('syllabus-detail').style.display = 'none';
  
  // Overall progress
  const pct = calculateOverallProgress();
  document.getElementById('overall-pct').textContent = pct + '%';
  document.getElementById('overall-bar').style.width = pct + '%';
  
  const container = document.getElementById('syllabus-subjects-list');
  clearSortables();
  container.style.display = 'block';
  
  const subjects = DYNAMIC_DATA.syllabusSubjects || [];
  
  window.renderSubjectCard = function(subj, idx, parentIdx = null) {
    const p = calculateSubjectProgress(subj.id, subj.type);
    const isNested = parentIdx !== null;
    
    if (subj.type === 'folder') {
      return \`
        <div class="subject-folder" data-idx="\${idx}" style="margin-bottom:12px;">
          <div class="subject-card glass-card folder-header" onclick="toggleFolder('\${subj.id}')" style="cursor:pointer; display:flex; align-items:center;">
             <span class="drag-handle material-symbols-rounded">drag_handle</span>
             <div class="subj-info" style="flex: 1">
                \${!isEditMode ? \`
                  <div class="subj-name" style="font-weight:700; color:var(--primary-color)"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:4px;">folder</span> \${subj.name}</div>
                  <div class="subj-source">\${subj.source || ''}</div>
                \` : \`
                  <div class="subj-name">
                    <input type="text" class="inline-input" value="\${subj.name.replace(/"/g, '&quot;')}" onclick="event.stopPropagation()" onchange="updateSyllabusSubject(\${idx}, this.value, null)">
                  </div>
                \`}
             </div>
             \${!isEditMode ? \`
              <div class="subj-progress">
                <span class="subj-pct">\${p}%</span>
                <div class="stat-bar"><div class="stat-bar-fill" style="width:\${p}%"></div></div>
              </div>
              <span class="subj-arrow material-symbols-rounded" id="arrow-\${subj.id}" style="margin-left:8px; font-size:20px;">expand_more</span>
             \` : \`
              <div class="edit-mode-controls">
                <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(\${idx}, null)"><span class="material-symbols-rounded icon-sm">delete</span></button>
              </div>
             \`}
          </div>
          <div class="folder-content" id="folder-\${subj.id}" style="display: none; padding-left: 20px; border-left: 2px solid var(--border-color); margin-left: 10px; margin-top: 8px;">
            \${subj.children.map((child, cIdx) => renderSubjectCard(child, cIdx, idx)).join('')}
          </div>
        </div>
      \`;
    }
    
    return \`
      <div class="subject-card glass-card \${!isNested ? 'draggable-item' : ''}" style="\${isNested ? 'margin-bottom:8px;' : ''}" >
        \${!isNested ? \`<span class="drag-handle material-symbols-rounded">drag_handle</span>\` : ''}
        <div class="subj-info" onclick="openSubjectDetail('\${subj.id}', '\${subj.type}')" style="cursor:pointer; flex: 1">
          \${!isEditMode ? \`
            <div class="subj-name"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:4px;">menu_book</span> \${subj.name}</div>
            <div class="subj-source">\${subj.source || ''}</div>
          \` : \`
            <div class="subj-name">
              <input type="text" class="inline-input" value="\${subj.name.replace(/"/g, '&quot;')}" onclick="event.stopPropagation()" onchange="updateSyllabusSubject(\${isNested ? parentIdx : idx}, this.value, \${isNested ? idx : 'null'})">
            </div>
          \`}
        </div>
        \${!isEditMode ? \`
        <div class="subj-progress">
          <span class="subj-pct">\${p}%</span>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:\${p}%"></div></div>
        </div>
        <span class="subj-arrow">▶</span>
        \` : \`
        <div class="edit-mode-controls">
          <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(\${isNested ? parentIdx : idx}, \${isNested ? idx : 'null'})"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>
        \`}
      </div>
    \`;
  };
  
  container.innerHTML = subjects.map((subj, idx) => renderSubjectCard(subj, idx, null)).join('');
  
  if (isEditMode) {
    container.innerHTML += \`<button class="add-item-btn" onclick="addSyllabusSubject()">+ Add Subject</button>\`;
  }
}`;
app = applyRegexReplace(app, 
  /function showSubjectsList\(\) \{[\s\S]*?container\.innerHTML \+\= \`\<button class="add-item-btn" onclick="addSyllabusSubject\(\)"\>\+ Add Subject\<\/button\>\`\;\s*\n  \}\n\}/,
  showSubjectsListNew,
  "showSubjectsList");

// 4. Inject toggleFolder
if (!app.includes('window.toggleFolder = function')) {
  app += `
window.toggleFolder = function(id) {
  if (isEditMode) return;
  const el = document.getElementById('folder-' + id);
  const arrow = document.getElementById('arrow-' + id);
  if (el.style.display === 'none') {
    el.style.display = 'block';
    arrow.textContent = 'expand_less';
  } else {
    el.style.display = 'none';
    arrow.textContent = 'expand_more';
  }
};
`;
  console.log('SUCCESS: toggleFolder');
}

// 5. Update Edit Functions
app = applyRegexReplace(app,
  /window\.deleteSyllabusSubject = function\(idx\) \{[\s\S]*?showSubjectsList\(\);\n  \}\);\n\};/,
  `window.deleteSyllabusSubject = function(parentIdx, childIdx) {
  confirmDelete('this subject', () => {
    if (childIdx !== null) {
      DYNAMIC_DATA.syllabusSubjects[parentIdx].children.splice(childIdx, 1);
    } else {
      DYNAMIC_DATA.syllabusSubjects.splice(parentIdx, 1);
    }
    saveDynamicData();
    showSubjectsList();
  });
};`,
  "deleteSyllabusSubject");

app = applyRegexReplace(app,
  /window\.updateSyllabusSubject = function\(idx, newName\) \{[\s\S]*?saveDynamicData\(\);\n\};/,
  `window.updateSyllabusSubject = function(parentIdx, newName, childIdx) {
  if (childIdx !== null) {
    DYNAMIC_DATA.syllabusSubjects[parentIdx].children[childIdx].name = newName;
  } else {
    DYNAMIC_DATA.syllabusSubjects[parentIdx].name = newName;
  }
  saveDynamicData();
};`,
  "updateSyllabusSubject");

// 6. Update openAddTaskModal
app = applyRegexReplace(app,
  /const subjects = \(DYNAMIC_DATA\.syllabusSubjects \|\| \[\]\)\.map\(s => \(\{ value: s\.id, label: s\.name \}\)\);/,
  `const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  const subjects = flattenSubjects(DYNAMIC_DATA.syllabusSubjects).map(s => ({ value: s.id, label: s.name }));`,
  "openAddTaskModal");

// 7. Update onTaskSubjectChange
app = applyRegexReplace(app,
  /const subjectObj = \(DYNAMIC_DATA\.syllabusSubjects \|\| \[\]\)\.find\(s => s\.id === subj\);/,
  `const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  const subjectObj = flattenSubjects(DYNAMIC_DATA.syllabusSubjects).find(s => s.id === subj);`,
  "onTaskSubjectChange");

fs.writeFileSync('app.js', app);

// 8. Update sw.js and index.html to v63
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'ca-tracker-v[0-9]+';/, "const CACHE_NAME = 'ca-tracker-v63';");
sw = sw.replace(/v=62/g, "v=63");
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=62/g, "v=63");
fs.writeFileSync('index.html', html);

console.log('Script Finished');
