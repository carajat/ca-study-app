const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

// Helper to remove event handlers and draggable
function stripDragAttrs(str) {
  return str.replace(/ draggable="\$\{isEditMode\}"/g, '')
            .replace(/ ondragstart="[^"]+"/g, '')
            .replace(/ ondragover="[^"]+"/g, '')
            .replace(/ ondrop="[^"]+"/g, '')
            .replace(/ ondragend="[^"]+"/g, '')
            .replace(/ class="draggable-item"/g, '');
}
app = stripDragAttrs(app);

// 1. Syllabus subjects
app = app.replace(
  /\$\{!isEditMode \? `<span class="prog-text">\$\{pct\}%<\/span>` : `\s*<button class="delete-btn" onclick="event\.stopPropagation\(\); deleteSyllabusSubject\('\$\{subj\.id\}'\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>\s*`\}/g,
  `\${!isEditMode ? \`<span class="prog-text">\${pct}%\</span>\` : \`
        <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
          <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(\${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
          <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(\${idx}, 1)" \${idx===DYNAMIC_DATA.syllabusSubjects.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
          <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject('\${subj.id}')"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>
      \`}`
);

// 2. Syllabus folders
app = app.replace(
  /\$\{!isEditMode \? `\s*<span class="prog-text">\$\{overallPct\}%<\/span>\s*` : `\s*<button class="delete-btn" onclick="event\.stopPropagation\(\); deleteSyllabusSubject\('\$\{subj\.id\}'\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>\s*`\}/g,
  `\${!isEditMode ? \`
          <span class="prog-text">\${overallPct}%\</span>
        \` : \`
          <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
            <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(\${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
            <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(\${idx}, 1)" \${idx===DYNAMIC_DATA.syllabusSubjects.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject('\${subj.id}')"><span class="material-symbols-rounded icon-sm">delete</span></button>
          </div>
        \`}`
);

// 3. Syllabus detail (chapters for DT/IDT)
app = app.replace(
  /\$\{!isEditMode \? `<button class="btn-secondary outline" onclick="openChapterModal\('\$\{key\}', \$\{idx\}\)">Update<\/button>` : `\s*<button class="delete-btn" onclick="event\.stopPropagation\(\); deleteSyllabusChapter\('\$\{key\}', \$\{idx\}\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>\s*`\}/g,
  `\${!isEditMode ? \`<button class="btn-secondary outline" onclick="openChapterModal('\${key}', \${idx})">Update</button>\` : \`
      <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
        <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter('\${key}', \${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
        <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter('\${key}', \${idx}, 1)" \${idx===chapters.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
        <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter('\${key}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
      </div>
    \`}`
);

// 4. Syllabus detail (IBS chapters)
app = app.replace(
  /\$\{!isEditMode \? `\s*<input type="checkbox" \$\{isDone \? 'checked' : ''\} onchange="toggleIbsChapter\('\$\{key\}', \$\{idx\}\)">\s*` : `\s*<button class="delete-btn" onclick="event\.stopPropagation\(\); deleteSyllabusChapter\('\$\{key\}', \$\{idx\}\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>\s*`\}/g,
  `\${!isEditMode ? \`
        <input type="checkbox" \${isDone ? 'checked' : ''} onchange="toggleIbsChapter('\${key}', \${idx})">
      \` : \`
        <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
          <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter('\${key}', \${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
          <button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter('\${key}', \${idx}, 1)" \${idx===chapters.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
          <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter('\${key}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>
      \`}`
);

// 5. Mocks
app = app.replace(
  /\$\{!isEditMode \? `<button class="btn-secondary outline" onclick="openMockModal\('\$\{mock\.id\}'\)">Update<\/button>` : `\s*<button class="delete-btn" onclick="deleteMock\(\$\{sIdx\}, \$\{mIdx\}\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>\s*`\}/g,
  `\${!isEditMode ? \`<button class="btn-secondary outline" onclick="openMockModal('\${mock.id}')">Update</button>\` : \`
      <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
        <button class="move-btn" onclick="event.stopPropagation(); moveMock(\${sIdx}, \${mIdx}, -1)" \${mIdx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
        <button class="move-btn" onclick="event.stopPropagation(); moveMock(\${sIdx}, \${mIdx}, 1)" \${mIdx===DYNAMIC_DATA.mocks['series'+(sIdx+1)].length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
        <button class="delete-btn" onclick="deleteMock(\${sIdx}, \${mIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
      </div>
    \`}`
);

// 6. Schedule slots
app = app.replace(
  /\$\{!isEditMode \? `\s*<div class="slot-time">\$\{slot\.startRange\}<\/div>\s*` : `\s*<button class="delete-btn" onclick="deleteScheduleSlot\('\$\{scheduleKey\}', \$\{idx\}\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>\s*`\}/g,
  `\${!isEditMode ? \`
        <div class="slot-time">\${slot.startRange}</div>
      \` : \`
        <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
          <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${scheduleKey}', \${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
          <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${scheduleKey}', \${idx}, 1)" \${idx===slots.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
          <button class="delete-btn" onclick="deleteScheduleSlot('\${scheduleKey}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>
      \`}`
);

// 7. Remove `<span class="drag-handle material-symbols-rounded">drag_handle</span>`
app = app.replace(/<span class="drag-handle material-symbols-rounded">drag_handle<\/span>/g, '');

// 8. Remove old reorder handlers and drag events
app = app.replace(/let draggedItemIndex = null;\n/g, '');
app = app.replace(/function handleDragStart[\s\S]*?function handleDragEnd[^}]+\}\n/g, '');

// 9. Add new move functions at the end of the file
const moveFunctions = `
function findSubj(id) {
  const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  return flattenSubjects(DYNAMIC_DATA.syllabusSubjects).find(s => s.id === id);
}

function moveSyllabusSubject(idx, dir) {
  if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.syllabusSubjects.length) return;
  reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx + dir);
  saveDynamicData();
  renderSyllabusTab();
}

function moveSyllabusChapter(subjectId, idx, dir) {
  const subj = findSubj(subjectId);
  if (subj && subj.chapters) {
    if (idx + dir < 0 || idx + dir >= subj.chapters.length) return;
    reorderArray(subj.chapters, idx, idx + dir);
    saveDynamicData();
    renderSyllabusDetail(subjectId);
  }
}

function moveMock(sIdx, idx, dir) {
  const seriesKey = Object.keys(DYNAMIC_DATA.mocks)[sIdx];
  if (DYNAMIC_DATA.mocks[seriesKey]) {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.mocks[seriesKey].length) return;
    reorderArray(DYNAMIC_DATA.mocks[seriesKey], idx, idx + dir);
    saveDynamicData();
    renderMocksTab();
  }
}

function moveScheduleSlot(scheduleKey, idx, dir) {
  const slots = DYNAMIC_DATA.schedules[scheduleKey].slots;
  if (idx + dir < 0 || idx + dir >= slots.length) return;
  reorderArray(slots, idx, idx + dir);
  saveDynamicData();
  renderScheduleDetail(scheduleKey);
}
`;

if (!app.includes('function moveSyllabusSubject')) {
  app += '\n' + moveFunctions;
}

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v70/g, 'v71');
sw = sw.replace(/v=70/g, 'v=71');
fs.writeFileSync('sw.js', sw);

let html2 = fs.readFileSync('index.html', 'utf8');
html2 = html2.replace(/v=70/g, 'v=71');
fs.writeFileSync('index.html', html2);

console.log('Done replacing drag-and-drop with up/down arrows!');
