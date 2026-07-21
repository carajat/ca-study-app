const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// 1. Strip all draggable attributes
app = app.replace(/ draggable="\$\{isEditMode\}"/g, '');
app = app.replace(/ draggable="' \+ isEditMode \+ '"/g, '');
app = app.replace(/ ondragstart="[^"]+"/g, '');
app = app.replace(/ ondragover="[^"]+"/g, '');
app = app.replace(/ ondrop="[^"]+"/g, '');
app = app.replace(/ ondragend="[^"]+"/g, '');
app = app.replace(/ class=".*draggable-item"/g, match => match.replace(' draggable-item', ''));
app = app.replace(/<span class="drag-handle material-symbols-rounded">drag_handle<\/span>/g, '');
app = app.replace(/let draggedItemIndex = null;\n/g, '');
app = app.replace(/function handleDragStart[\s\S]*?function handleDragEnd[^}]+\}\n/g, '');

// 2. Add moveSyllabusChapter (if missing)
const moveSyllabusChapterCode = `function moveSyllabusChapter(subjectId, idx, dir) {
  const subj = findSubj(subjectId);
  if (subj && subj.chapters) {
    if (idx + dir < 0 || idx + dir >= subj.chapters.length) return;
    reorderArray(subj.chapters, idx, idx + dir);
    saveDynamicData();
    renderSyllabusDetail(subjectId);
  }
}`;
if (!app.includes('function moveSyllabusChapter')) {
  app += '\\n' + moveSyllabusChapterCode;
}

// 3. Replace Mocks delete button
app = app.replace(
  /<button class="delete-btn" onclick="event\.stopPropagation\(\); deleteMock\('\$\{series\.id\}', \$\{mockIdx\}\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>/g,
  `<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
    <button class="move-btn" onclick="event.stopPropagation(); moveMock('\${series.id}', \${mockIdx}, -1)" \${mockIdx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
    <button class="move-btn" onclick="event.stopPropagation(); moveMock('\${series.id}', \${mockIdx}, 1)" \${mockIdx===series.tests.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
    <button class="delete-btn" onclick="event.stopPropagation(); deleteMock('\${series.id}', \${mockIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
  </div>`
);

// 4. Replace Schedule delete button
app = app.replace(
  /<button class="delete-btn" onclick="deleteScheduleSlot\('\$\{state\.activeSchedule\}', \$\{idx\}\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>/g,
  `<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, 1)" \${idx===slots.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
    <button class="delete-btn" onclick="deleteScheduleSlot('\${state.activeSchedule}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
  </div>`
);

// 5. Replace Syllabus Chapter delete button
app = app.replace(
  /'<button class="delete-btn" onclick="event\.stopPropagation\(\); deleteSyllabusChapter\(\\'' \+ key \+ '\\', ' \+ idx \+ '\)"><span class="material-symbols-rounded icon-sm">delete<\/span><\/button>' \+/g,
  `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', 1)" ' + (idx === chapters.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>' +`
);

// Remove the standalone div tags that might wrap the schedule or mock delete buttons
app = app.replace(/<div class="edit-mode-controls">\s*<div class="edit-mode-controls"/g, '<div class="edit-mode-controls"');
app = app.replace(/<\/div>\s*<\/div>\s*` : ''\}/g, '</div>\n` : \'\'}');

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v72/g, 'v73');
sw = sw.replace(/v=72/g, 'v=73');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=72/g, 'v=73');
fs.writeFileSync('index.html', html);

console.log('Fixed everything');
