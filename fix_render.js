const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

function replaceFunction(name, newContent) {
  let startIdx = app.indexOf('function ' + name);
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

const renderSyllabusDetailNew = `function renderSyllabusDetail(subject) {
  const { key, type } = subject;
  const progress = getSyllabusProgress();
  
  const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  const flatSubjects = flattenSubjects(DYNAMIC_DATA.syllabusSubjects);
  const subjData = flatSubjects.find(s => s.id === key);
  
  if (!subjData) return;
  const chapters = subjData.chapters || [];
  const title = subjData.name;
  
  const pct = calculateSubjectProgress(key, type);
  
  const headerEl = document.getElementById('syllabus-detail-header');
  headerEl.innerHTML = '<h3 style="margin-bottom:8px;"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:6px;">menu_book</span> ' + title + '</h3>' +
    '<div class="detail-progress"><span>' + pct + '% done</span><div class="stat-bar stat-bar-lg"><div class="stat-bar-fill" style="width:' + pct + '%"></div></div></div>';
  
  const contentEl = document.getElementById('syllabus-detail-content');
  
  if (type === 'main') {
    // DT/IDT: Columnar with 3 checkboxes
    contentEl.innerHTML = '<div class="syllabus-table">' +
      '<div class="st-header">' +
        '<span class="st-num">#</span>' +
        '<span class="st-name">Chapter</span>' +
        '<span class="st-check"><span class="material-symbols-rounded icon-sm">import_contacts</span></span>' +
        '<span class="st-check"><span class="material-symbols-rounded icon-sm">help</span></span>' +
        '<span class="st-check"><span class="material-symbols-rounded icon-sm">videocam</span></span>' +
      '</div>' +
      chapters.map((ch, idx) => {
        const chProgress = progress[ch.id] || {};
        return '<div class="st-row ' + (isEditMode ? 'is-edit' : '') + ' draggable-item" draggable="' + isEditMode + '" ondragstart="handleDragStart(event, ' + idx + ')" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ' + idx + ', \\'syllabus-chapter\\', \\'' + key + '\\')" ondragend="handleDragEnd(event)">' +
          '<span class="drag-handle material-symbols-rounded">drag_handle</span>' +
          (!isEditMode ? '<span class="st-num">' + (idx + 1) + '</span><div class="st-name">' + ch.name + '</div>' : 
            '<div class="st-name" style="flex:1; margin-right: 10px;">' +
              '<input type="text" class="inline-input" value="' + ch.name.replace(/"/g, '&quot;') + '" onclick="event.stopPropagation()" onchange="updateSyllabusChapter(\\'' + key + '\\', ' + idx + ', this.value)">' +
            '</div>'
          ) +
          (!isEditMode ? 
          '<span class="st-check"><input type="checkbox" ' + (chProgress.conceptBook ? 'checked' : '') + ' onchange="toggleSyllabusCheck(\\'' + ch.id + '\\', \\'conceptBook\\', this.checked)"></span>' +
          '<span class="st-check"><input type="checkbox" ' + (chProgress.questionBank ? 'checked' : '') + ' onchange="toggleSyllabusCheck(\\'' + ch.id + '\\', \\'questionBank\\', this.checked)"></span>' +
          '<span class="st-check"><input type="checkbox" ' + (chProgress.revisionVideo ? 'checked' : '') + ' onchange="toggleSyllabusCheck(\\'' + ch.id + '\\', \\'revisionVideo\\', this.checked)"></span>' 
          : 
          '<div class="edit-mode-controls">' +
            '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
          '</div>'
          ) +
        '</div>';
      }).join('') +
    '</div>';
    
    if (isEditMode) {
      contentEl.innerHTML += '<button class="add-item-btn" onclick="addSyllabusChapter(\\'' + key + '\\')">+ Add Chapter</button>';
    }
  } else {
    // IBS: Simple checkbox
    contentEl.innerHTML = '<div class="syllabus-simple">' +
      chapters.map((ch, idx) => {
        const isDone = progress[ch.id]?.done || false;
        return '<div class="ss-row ' + (isDone ? 'done' : '') + ' draggable-item" draggable="' + isEditMode + '" ondragstart="handleDragStart(event, ' + idx + ')" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ' + idx + ', \\'syllabus-chapter\\', \\'' + key + '\\')" ondragend="handleDragEnd(event)" ' + (!isEditMode ? 'onclick="toggleIbsCheck(\\'' + ch.id + '\\')"' : '') + '>' +
          '<span class="drag-handle material-symbols-rounded">drag_handle</span>' +
          '<span class="ss-check">' + (isDone ? '<span class="material-symbols-rounded icon-sm">check_box</span>' : '<span class="material-symbols-rounded icon-sm">check_box_outline_blank</span>') + '</span>' +
          '<span class="ss-num">' + (!isEditMode ? (idx + 1) + '.' : '') + '</span>' +
          (!isEditMode ? '<span class="ss-name" style="flex:1">' + ch.name + '</span>' : 
          '<div class="ss-name" style="flex:1; margin-right:10px;">' +
            '<input type="text" class="inline-input" value="' + ch.name.replace(/"/g, '&quot;') + '" onclick="event.stopPropagation()" onchange="updateSyllabusChapter(\\'' + key + '\\', ' + idx + ', this.value)">' +
          '</div>' +
          '<div class="edit-mode-controls">' +
            '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
          '</div>'
          ) +
        '</div>';
      }).join('') +
    '</div>';
    
    if (isEditMode) {
      contentEl.innerHTML += '<button class="add-item-btn" onclick="addSyllabusChapter(\\'' + key + '\\')">+ Add Chapter</button>';
    }
  }
}`;

replaceFunction('renderSyllabusDetail', renderSyllabusDetailNew);

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v65/g, 'v66');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=65/g, 'v=66');
fs.writeFileSync('index.html', html);

console.log('BUMPED to v66');
