const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// 1. Syllabus subjects (folders) - Line 1143 area
const folderDelete = `'<div class="edit-mode-controls"><button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + idx + ', null)"><span class="material-symbols-rounded icon-sm">delete</span></button></div>'`;
const folderArrows = `
          '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', 1)" ' + (idx === DYNAMIC_DATA.syllabusSubjects.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
            '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + idx + ', null)"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
          '</div>'
`.trim();
app = app.replace(folderDelete, folderArrows);

// 2. Syllabus subjects (items) - Line 1166 area
const itemDelete = `'<div class="edit-mode-controls"><button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + (isNested ? parentIdx : idx) + ', ' + (isNested ? idx : 'null') + ')"><span class="material-symbols-rounded icon-sm">delete</span></button></div>'`;
const itemArrows = `
        '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
          '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + (isNested ? childIdx : idx) + ', -1, ' + (isNested ? parentIdx : 'null') + ')" ' + ((isNested ? childIdx : idx) === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
          '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + (isNested ? childIdx : idx) + ', 1, ' + (isNested ? parentIdx : 'null') + ')" ' + ((isNested ? childIdx : idx) === (isNested ? DYNAMIC_DATA.syllabusSubjects[parentIdx].children.length - 1 : DYNAMIC_DATA.syllabusSubjects.length - 1) ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
          '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + (isNested ? parentIdx : idx) + ', ' + (isNested ? childIdx : 'null') + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
        '</div>'
`.trim();
// NOTE: I replaced `(isNested ? idx : 'null')` in the delete with `(isNested ? childIdx : 'null')` as `childIdx` is available in the map.
// Let's just do a simpler search & replace for the actual strings.
app = app.replace(
  `'<div class="edit-mode-controls"><button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + (isNested ? parentIdx : idx) + ', ' + (isNested ? idx : 'null') + ')"><span class="material-symbols-rounded icon-sm">delete</span></button></div>'`,
  `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + (isNested ? idx : idx) + ', -1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + (isNested ? idx : idx) + ', 1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === (isNested ? subj.children.length - 1 : DYNAMIC_DATA.syllabusSubjects.length - 1) ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + (isNested ? parentIdx : idx) + ', ' + (isNested ? idx : 'null') + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>'`
);

// 3. Syllabus Chapter (DT/IDT) - Line 1238
app = app.replace(
  `'<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +`,
  `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', 1)" ' + (idx === chapters.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>' +`
);

// 4. Syllabus Chapter (IBS) - Line 1262
app = app.replace(
  `'<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +`,
  `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', 1)" ' + (idx === chapters.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>' +`
);

// 5. Schedule Slot - Line 790
app = app.replace(
  `<button class="delete-btn" onclick="deleteScheduleSlot('\${state.activeSchedule}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>`,
  `<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, -1)" \${idx === 0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, 1)" \${idx === slots.length - 1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
    <button class="delete-btn" onclick="deleteScheduleSlot('\${state.activeSchedule}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
  </div>`
);

// Fix move functions
app = app.replace(/function moveMock\(sIdx, idx, dir\) \{[\s\S]*?renderMocksTab\(\);\n\}/, 
`function moveMock(seriesKey, idx, dir) {
  if (DYNAMIC_DATA.mocks[seriesKey]) {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.mocks[seriesKey].tests.length) return;
    reorderArray(DYNAMIC_DATA.mocks[seriesKey].tests, idx, idx + dir);
    saveDynamicData();
    renderMocksTab();
  }
}`);

app = app.replace(/function moveSyllabusSubject\(idx, dir\) \{[\s\S]*?renderSyllabusTab\(\);\n\}/, 
`function moveSyllabusSubject(idx, dir, parentIdx = null) {
  if (parentIdx !== null) {
    const parent = DYNAMIC_DATA.syllabusSubjects[parentIdx];
    if (idx + dir < 0 || idx + dir >= parent.children.length) return;
    reorderArray(parent.children, idx, idx + dir);
  } else {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.syllabusSubjects.length) return;
    reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx + dir);
  }
  saveDynamicData();
  renderSyllabusTab();
}`);

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v71/g, 'v72');
sw = sw.replace(/v=71/g, 'v=72');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=71/g, 'v=72');
fs.writeFileSync('index.html', html);
