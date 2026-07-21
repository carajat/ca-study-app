const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

function replaceFunction(name, newContent) {
  let startIdx = app.indexOf('function ' + name);
  if (startIdx === -1) startIdx = app.indexOf(name + ' = function');
  if (startIdx === -1) {
    console.log('NOT FOUND: ' + name);
    return;
  }
  
  let braceCount = 0;
  let endIdx = -1;
  let foundFirstBrace = false;
  for (let i = startIdx; i < app.length; i++) {
    if (app[i] === '{') {
      braceCount++;
      foundFirstBrace = true;
    }
    if (app[i] === '}') {
      braceCount--;
    }
    if (foundFirstBrace && braceCount === 0) {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx !== -1) {
    app = app.substring(0, startIdx) + newContent + app.substring(endIdx + 1);
    console.log('REPLACED: ' + name);
  }
}

// 1. calculateSubjectProgress
replaceFunction('calculateSubjectProgress', \`function calculateSubjectProgress(key, type) {
  const progress = getSyllabusProgress();
  const subjects = DYNAMIC_DATA.syllabusSubjects || [];
  
  let subj = null;
  const findSubj = (list) => {
    for (let s of list) {
      if (s.id === key) return s;
      if (s.type === 'folder' && s.children) {
        const sub = findSubj(s.children);
        if (sub) return sub;
      }
    }
    return null;
  };
  subj = findSubj(subjects);
  
  if (!subj) return 0;
  
  if (subj.type === 'folder') {
    if (!subj.children || subj.children.length === 0) return 0;
    let total = 0;
    subj.children.forEach(child => {
      total += calculateSubjectProgress(child.id, child.type);
    });
    return Math.round(total / subj.children.length);
  }
  
  if (!subj.chapters) return 0;
  
  const chapters = subj.chapters;
  let total = 0, done = 0;
  
  if (type === 'main') {
    total = chapters.length * 3;
    chapters.forEach(ch => {
      const p = progress[ch.id] || {};
      if (p.conceptBook) done++;
      if (p.questionBank) done++;
      if (p.revisionVideo) done++;
    });
  } else {
    total = chapters.length;
    chapters.forEach(ch => {
      if (progress[ch.id]?.done) done++;
    });
  }
  
  return total > 0 ? Math.round((done / total) * 100) : 0;
}\`);


// 2. showSubjectsList
replaceFunction('showSubjectsList', \`function showSubjectsList() {
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
      return \\\`
        <div class="subject-folder" data-idx="\${idx}" style="margin-bottom:12px;">
          <div class="subject-card glass-card folder-header" onclick="toggleFolder('\${subj.id}')" style="cursor:pointer; display:flex; align-items:center;">
             <span class="drag-handle material-symbols-rounded">drag_handle</span>
             <div class="subj-info" style="flex: 1">
                \${!isEditMode ? \\\`
                  <div class="subj-name" style="font-weight:700; color:var(--primary-color)"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:4px;">folder</span> \${subj.name}</div>
                  <div class="subj-source">\${subj.source || ''}</div>
                \\\` : \\\`
                  <div class="subj-name">
                    <input type="text" class="inline-input" value="\${subj.name.replace(/"/g, '&quot;')}" onclick="event.stopPropagation()" onchange="updateSyllabusSubject(\${idx}, this.value, null)">
                  </div>
                \\\`}
             </div>
             \${!isEditMode ? \\\`
              <div class="subj-progress">
                <span class="subj-pct">\${p}%</span>
                <div class="stat-bar"><div class="stat-bar-fill" style="width:\${p}%"></div></div>
              </div>
              <span class="subj-arrow material-symbols-rounded" id="arrow-\${subj.id}" style="margin-left:8px; font-size:20px;">expand_more</span>
             \\\` : \\\`
              <div class="edit-mode-controls">
                <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(\${idx}, null)"><span class="material-symbols-rounded icon-sm">delete</span></button>
              </div>
             \\\`}
          </div>
          <div class="folder-content" id="folder-\${subj.id}" style="display: none; padding-left: 20px; border-left: 2px solid var(--border-color); margin-left: 10px; margin-top: 8px;">
            \${subj.children.map((child, cIdx) => renderSubjectCard(child, cIdx, idx)).join('')}
          </div>
        </div>
      \\\`;
    }
    
    return \\\`
      <div class="subject-card glass-card \${!isNested ? 'draggable-item' : ''}" style="\${isNested ? 'margin-bottom:8px;' : ''}" >
        \${!isNested ? \\\`<span class="drag-handle material-symbols-rounded">drag_handle</span>\\\` : ''}
        <div class="subj-info" onclick="openSubjectDetail('\${subj.id}', '\${subj.type}')" style="cursor:pointer; flex: 1">
          \${!isEditMode ? \\\`
            <div class="subj-name"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:4px;">menu_book</span> \${subj.name}</div>
            <div class="subj-source">\${subj.source || ''}</div>
          \\\` : \\\`
            <div class="subj-name">
              <input type="text" class="inline-input" value="\${subj.name.replace(/"/g, '&quot;')}" onclick="event.stopPropagation()" onchange="updateSyllabusSubject(\${isNested ? parentIdx : idx}, this.value, \${isNested ? idx : 'null'})">
            </div>
          \\\`}
        </div>
        \${!isEditMode ? \\\`
        <div class="subj-progress">
          <span class="subj-pct">\${p}%</span>
          <div class="stat-bar"><div class="stat-bar-fill" style="width:\${p}%"></div></div>
        </div>
        <span class="subj-arrow">▶</span>
        \\\` : \\\`
        <div class="edit-mode-controls">
          <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(\${isNested ? parentIdx : idx}, \${isNested ? idx : 'null'})"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>
        \\\`}
      </div>
    \\\`;
  };
  
  container.innerHTML = subjects.map((subj, idx) => renderSubjectCard(subj, idx, null)).join('');
  
  if (isEditMode) {
    container.innerHTML += \\\`<button class="add-item-btn" onclick="addSyllabusSubject()">+ Add Subject</button>\\\`;
  }
}\`);


// 3. onTaskSubjectChange
replaceFunction('onTaskSubjectChange', \`function onTaskSubjectChange() {
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
  const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  const flatSubjects = flattenSubjects(DYNAMIC_DATA.syllabusSubjects);
  const subjectObj = flatSubjects.find(s => s.id === subj);
  
  if (subjectObj && subjectObj.chapters) {
    chapters = subjectObj.chapters;
  }
  
  if (chapters.length > 0) {
    chapterGroup.style.display = 'block';
    chapterSelect.innerHTML = '<option value="">— Select Chapter —</option>' + 
      chapters.map(c => \\\`<option value="\${c.id}">\${c.name}</option>\\\`).join('');
      
    activityGroup.style.display = 'block';
  } else {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
  }
}\`);

// 4. deleteSyllabusSubject
replaceFunction('deleteSyllabusSubject', \`window.deleteSyllabusSubject = function(parentIdx, childIdx) {
  confirmDelete('this subject', () => {
    if (childIdx !== null && childIdx !== undefined) {
      DYNAMIC_DATA.syllabusSubjects[parentIdx].children.splice(childIdx, 1);
    } else {
      DYNAMIC_DATA.syllabusSubjects.splice(parentIdx, 1);
    }
    saveDynamicData();
    showSubjectsList();
  });
};\`);

// 5. updateSyllabusSubject
replaceFunction('updateSyllabusSubject', \`window.updateSyllabusSubject = function(parentIdx, newName, childIdx) {
  if (childIdx !== null && childIdx !== undefined) {
    DYNAMIC_DATA.syllabusSubjects[parentIdx].children[childIdx].name = newName;
  } else {
    DYNAMIC_DATA.syllabusSubjects[parentIdx].name = newName;
  }
  saveDynamicData();
};\`);

fs.writeFileSync('app.js', app);
console.log('DONE');
