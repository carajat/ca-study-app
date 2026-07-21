const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const t1 = `<div class="edit-mode-controls">
                  <button class="delete-btn" onclick="event.stopPropagation(); deleteMock('\${series.id}', \${mockIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
                </div>`;
const r1 = `<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
                  <button class="move-btn" onclick="event.stopPropagation(); moveMock('\${series.id}', \${mockIdx}, -1)" \${mockIdx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
                  <button class="move-btn" onclick="event.stopPropagation(); moveMock('\${series.id}', \${mockIdx}, 1)" \${mockIdx===series.tests.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
                  <button class="delete-btn" onclick="event.stopPropagation(); deleteMock('\${series.id}', \${mockIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
                </div>`;
app = app.split(t1).join(r1);

const t2 = `<div class="edit-mode-controls">
          <button class="delete-btn" onclick="deleteScheduleSlot('\${state.activeSchedule}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>`;
const r2 = `<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
          <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, -1)" \${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
          <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('\${state.activeSchedule}', \${idx}, 1)" \${idx===slots.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
          <button class="delete-btn" onclick="deleteScheduleSlot('\${state.activeSchedule}', \${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
        </div>`;
app = app.split(t2).join(r2);

const t3 = `'<div class="edit-mode-controls"><button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + idx + ', null)"><span class="material-symbols-rounded icon-sm">delete</span></button></div>'`;
const r3 = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', 1)" ' + (idx === DYNAMIC_DATA.syllabusSubjects.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
            '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + idx + ', null)"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
          '</div>'`;
app = app.split(t3).join(r3);

const t4 = `'<div class="edit-mode-controls"><button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + (isNested ? parentIdx : idx) + ', ' + (isNested ? idx : 'null') + ')"><span class="material-symbols-rounded icon-sm">delete</span></button></div>'`;
const r4 = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', 1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === (isNested ? subj.children.length - 1 : DYNAMIC_DATA.syllabusSubjects.length - 1) ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + (isNested ? parentIdx : idx) + ', ' + (isNested ? idx : 'null') + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>'`;
app = app.split(t4).join(r4);

const t5 = `'<div class="edit-mode-controls">' +
            '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
          '</div>'`;
const r5 = `'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\\'' + key + '\\', ' + idx + ', 1)" ' + (idx === chapters.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
            '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\\'' + key + '\\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
          '</div>'`;
app = app.split(t5).join(r5);

const moveMockStr = `function moveMock(sIdx, idx, dir) {
  const seriesKey = Object.keys(DYNAMIC_DATA.mocks)[sIdx];
  if (DYNAMIC_DATA.mocks[seriesKey]) {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.mocks[seriesKey].length) return;
    reorderArray(DYNAMIC_DATA.mocks[seriesKey], idx, idx + dir);
    saveDynamicData();
    renderMocksTab();
  }
}`;
const newMoveMock = `function moveMock(seriesKey, idx, dir) {
  if (DYNAMIC_DATA.mocks[seriesKey]) {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.mocks[seriesKey].tests.length) return;
    reorderArray(DYNAMIC_DATA.mocks[seriesKey].tests, idx, idx + dir);
    saveDynamicData();
    renderMocksTab();
  }
}`;
app = app.split(moveMockStr).join(newMoveMock);

const moveSyllabusStr = `function moveSyllabusSubject(idx, dir) {
  if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.syllabusSubjects.length) return;
  reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx + dir);
  saveDynamicData();
  renderSyllabusTab();
}`;
const newMoveSyllabus = `function moveSyllabusSubject(idx, dir, parentIdx = null) {
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
}`;
app = app.split(moveSyllabusStr).join(newMoveSyllabus);

fs.writeFileSync('app.js', app);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=70/g, 'v=72');
fs.writeFileSync('index.html', html);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v=70/g, 'v=72');
sw = sw.replace(/v70/g, 'v72');
fs.writeFileSync('sw.js', sw);

console.log('Replaced all successfully!');
