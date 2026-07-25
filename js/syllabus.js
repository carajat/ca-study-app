// ========================================
// syllabus.js — Subject Progress Tracking
// ========================================

import { state, DYNAMIC_DATA, isEditMode, saveDynamicData } from './state.js';
import { showToast } from './utils.js';
import { openFormModal } from './modals.js';
import { getSyllabusProgress, saveSyllabusProgress } from './state.js';
import { reorderArray, confirmDelete, clearSortables } from './edit-mode.js';

export function renderSyllabus() {
  clearSortables();
  if (state.syllabusView === 'list') {
    showSubjectsList();
  } else {
    renderSyllabusDetail();
  }
}

export function showSubjectsList() {
  const container = document.getElementById('syllabus-detail-content');
  container.innerHTML = '';
  
  const backBtn = document.getElementById('syllabus-back-btn');
  backBtn.style.display = 'none';
  
  document.getElementById('syllabus-title').textContent = 'Syllabus Tracker';
  
  let html = '<div class="subjects-list" id="subjects-list-container">';
  
  DYNAMIC_DATA.syllabusSubjects.forEach((subj, idx) => {
    if (subj.type === 'folder') {
      html += renderFolderCard(subj, idx);
    } else {
      html += renderSubjectCard(subj, idx);
    }
  });
  
  html += '</div>';
  
  if (isEditMode) {
    html += `<button class="add-item-btn" onclick="addSyllabusSubject()">+ Add Subject</button>`;
  }
  
  // Overall progress
  const overall = calculateOverallProgress();
  html = `
    <div class="overall-progress glass-card">
      <div class="op-label">Overall Progress</div>
      <div class="op-bar"><div class="op-bar-fill" style="width:${overall}%"></div></div>
      <div class="op-pct">${overall}%</div>
    </div>
  ` + html;
  
  container.innerHTML = html;
}

export function renderSubjectCard(subj, idx, parentIdx) {
  const progress = calculateSubjectProgress(subj.id, subj.type);
  const pClass = progress >= 80 ? 'high' : (progress >= 40 ? 'mid' : 'low');
  const parentAttr = parentIdx !== undefined ? parentIdx : 'null';
  
  return `
    <div class="subject-card glass-card ${pClass}" ${!isEditMode ? `onclick="openSubjectDetail('${subj.id}', '${subj.type || 'main'}')"` : ''}>
      ${isEditMode ? `
        <div class="edit-mode-controls" style="display:flex; gap:4px; margin-bottom:8px; align-items:center; justify-content:space-between;">
          <div style="display:flex; gap:4px;">
            <button class="move-btn" onclick="event.stopPropagation(); moveSubjectUp(${parentAttr !== 'null' ? parentAttr : idx}, ${parentAttr !== 'null' ? idx : 'null'})" title="Move Up"><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
            <button class="move-btn" onclick="event.stopPropagation(); moveSubjectDown(${parentAttr !== 'null' ? parentAttr : idx}, ${parentAttr !== 'null' ? idx : 'null'})" title="Move Down"><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
          </div>
          <div style="display:flex; gap:4px;">
            <button class="edit-btn" onclick="event.stopPropagation(); updateSyllabusSubject(${parentAttr !== 'null' ? parentAttr : idx}, ${parentAttr !== 'null' ? idx : 'null'})"><span class="material-symbols-rounded icon-sm">edit</span></button>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(${parentAttr !== 'null' ? parentAttr : idx}, ${parentAttr !== 'null' ? idx : 'null'})"><span class="material-symbols-rounded icon-sm">delete</span></button>
          </div>
        </div>
      ` : ''}
      <div class="sc-name">${subj.name}</div>
      ${subj.source ? `<div class="sc-source">${subj.source}</div>` : ''}
      <div class="sc-progress">
        <div class="sc-bar"><div class="sc-bar-fill" style="width:${progress}%"></div></div>
        <span class="sc-pct">${progress}%</span>
      </div>
    </div>
  `;
}

function renderFolderCard(folder, folderIdx) {
  const collapsed = folder.collapsed;
  let html = `
    <div class="folder-card glass-card" style="border-left: 3px solid var(--primary);">
      <div class="folder-header" onclick="${isEditMode ? '' : `toggleFolder(${folderIdx})`}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="material-symbols-rounded icon-sm">${collapsed ? 'folder' : 'folder_open'}</span>
          <strong>${folder.name}</strong>
          ${folder.source ? `<div class="sc-source" style="margin-top:4px;">${folder.source}</div>` : ''}
        </div>
        ${isEditMode ? `
          <div class="edit-mode-controls" style="display:flex; gap:4px;">
            <button class="edit-btn" onclick="event.stopPropagation(); updateSyllabusSubject(${folderIdx}, null)"><span class="material-symbols-rounded icon-sm">edit</span></button>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(${folderIdx}, null)"><span class="material-symbols-rounded icon-sm">delete</span></button>
          </div>
        ` : `<span class="material-symbols-rounded icon-sm">${collapsed ? 'expand_more' : 'expand_less'}</span>`}
      </div>
  `;
  
  if (!collapsed && folder.children) {
    html += '<div class="folder-children" style="margin-top:10px;">';
    folder.children.forEach((child, childIdx) => {
      html += renderSubjectCard(child, childIdx, folderIdx);
    });
    if (isEditMode) {
      html += `<button class="add-item-btn" onclick="addSyllabusSubject(${folderIdx})">+ Add Subject to Folder</button>`;
    }
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

export function openSubjectDetail(subjectId, type) {
  state.syllabusView = 'detail';
  state.activeSubject = { key: subjectId, type: type };
  renderSyllabus();
}

export function renderSyllabusDetail() {
  if (!state.activeSubject) { showSubjectsList(); return; }
  
  const { key, type } = state.activeSubject;
  const backBtn = document.getElementById('syllabus-back-btn');
  backBtn.style.display = 'flex';
  
  // Find subject
  let subj = null;
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  subj = flatSubjects.find(s => s.id === key);
  
  if (!subj) {
    document.getElementById('syllabus-detail-content').innerHTML = '<p>Subject not found</p>';
    return;
  }
  
  document.getElementById('syllabus-title').textContent = subj.name;
  
  const progress = getSyllabusProgress();
  const chapters = subj.chapters || [];
  let html = '';
  
  const isIbs = type === 'ibs' || key.startsWith('ibs-');
  
  chapters.forEach((ch, chIdx) => {
    const chProgress = progress[ch.id] || {};
    
    if (isIbs) {
      html += `
        <div class="chapter-card glass-card">
          ${isEditMode ? `
            <div class="edit-mode-controls" style="display:flex; gap:4px; margin-bottom:8px; justify-content:space-between;">
              <div style="display:flex; gap:4px;">
                <button class="move-btn" onclick="moveSyllabusChapter('${key}', ${chIdx}, -1)"><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
                <button class="move-btn" onclick="moveSyllabusChapter('${key}', ${chIdx}, 1)"><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
              </div>
              <div style="display:flex; gap:4px;">
                <button class="edit-btn" onclick="updateSyllabusChapter('${key}', ${chIdx})"><span class="material-symbols-rounded icon-sm">edit</span></button>
                <button class="delete-btn" onclick="deleteSyllabusChapter('${key}', ${chIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
              </div>
            </div>
          ` : ''}
          <div class="ch-name">${ch.name}</div>
          <div class="ch-checks">
            <label class="check-label" onclick="event.stopPropagation();">
              <input type="checkbox" ${chProgress.done ? 'checked' : ''} onchange="toggleIbsCheck('${ch.id}', this.checked)"> Completed
            </label>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="chapter-card glass-card">
          ${isEditMode ? `
            <div class="edit-mode-controls" style="display:flex; gap:4px; margin-bottom:8px; justify-content:space-between;">
              <div style="display:flex; gap:4px;">
                <button class="move-btn" onclick="moveSyllabusChapter('${key}', ${chIdx}, -1)"><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
                <button class="move-btn" onclick="moveSyllabusChapter('${key}', ${chIdx}, 1)"><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
              </div>
              <div style="display:flex; gap:4px;">
                <button class="edit-btn" onclick="updateSyllabusChapter('${key}', ${chIdx})"><span class="material-symbols-rounded icon-sm">edit</span></button>
                <button class="delete-btn" onclick="deleteSyllabusChapter('${key}', ${chIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
              </div>
            </div>
          ` : ''}
          <div class="ch-name">${ch.name}</div>
          <div class="ch-checks">
            <label class="check-label" onclick="event.stopPropagation();">
              <input type="checkbox" ${chProgress.conceptBook ? 'checked' : ''} onchange="toggleSyllabusCheck('${ch.id}', 'conceptBook', this.checked)"> <span class="material-symbols-rounded icon-sm">menu_book</span> Book
            </label>
            <label class="check-label" onclick="event.stopPropagation();">
              <input type="checkbox" ${chProgress.questionBank ? 'checked' : ''} onchange="toggleSyllabusCheck('${ch.id}', 'questionBank', this.checked)"> <span class="material-symbols-rounded icon-sm">edit_document</span> QB
            </label>
            <label class="check-label" onclick="event.stopPropagation();">
              <input type="checkbox" ${chProgress.revisionVideo ? 'checked' : ''} onchange="toggleSyllabusCheck('${ch.id}', 'revisionVideo', this.checked)"> <span class="material-symbols-rounded icon-sm">play_circle</span> Revision
            </label>
          </div>
        </div>
      `;
    }
  });
  
  if (isEditMode) {
    html += `<button class="add-item-btn" onclick="addSyllabusChapter('${key}')">+ Add Chapter</button>`;
  }
  
  document.getElementById('syllabus-detail-content').innerHTML = html;
}

export function toggleSyllabusCheck(chapterId, type, checked) {
  const progress = getSyllabusProgress();
  if (!progress[chapterId]) progress[chapterId] = {};
  progress[chapterId][type] = checked;
  saveSyllabusProgress(progress);
}

export function toggleIbsCheck(chapterId, checked) {
  const progress = getSyllabusProgress();
  if (!progress[chapterId]) progress[chapterId] = {};
  progress[chapterId].done = checked;
  saveSyllabusProgress(progress);
}


export function calculateSubjectProgress(subjectId, type) {
  const progress = getSyllabusProgress();
  let subj = null;
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  subj = flatSubjects.find(s => s.id === subjectId);
  
  if (!subj || !subj.chapters || subj.chapters.length === 0) return 0;
  
  const isIbs = type === 'ibs' || subjectId.startsWith('ibs-');
  
  if (isIbs) {
    let done = 0;
    subj.chapters.forEach(ch => {
      if (progress[ch.id] && progress[ch.id].done) done++;
    });
    return Math.round((done / subj.chapters.length) * 100);
  }
  
  let totalChecks = 0;
  let checkedCount = 0;
  const checks = ['conceptBook', 'questionBank', 'revisionVideo'];
  
  subj.chapters.forEach(ch => {
    totalChecks += checks.length;
    checks.forEach(c => {
      if (progress[ch.id] && progress[ch.id][c]) checkedCount++;
    });
  });
  
  return totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 0;
}

export function calculateOverallProgress() {
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    if (s.type === 'folder' && s.children) {
      s.children.forEach(c => flatSubjects.push(c));
    } else {
      flatSubjects.push(s);
    }
  });
  
  if (flatSubjects.length === 0) return 0;
  
  let total = 0;
  flatSubjects.forEach(s => {
    total += calculateSubjectProgress(s.id, s.type);
  });
  return Math.round(total / flatSubjects.length);
}


// ─── SYLLABUS EDIT HANDLERS ─────────────

export function reorderSyllabusSubject(from, to) {
  reorderArray(DYNAMIC_DATA.syllabusSubjects, from, to);
}

export function updateSyllabusSubject(idx, childIdx) {
  const subj = childIdx !== null && childIdx !== undefined
    ? (DYNAMIC_DATA.syllabusSubjects[idx].children ? DYNAMIC_DATA.syllabusSubjects[idx].children[childIdx] : null)
    : DYNAMIC_DATA.syllabusSubjects[idx];
    
  if (!subj) return;
  
  openFormModal('Edit Subject', [
    { label: 'Name', type: 'text', value: subj.name },
    { label: 'Source', type: 'text', value: subj.source || '' }
  ], (name, source) => {
    subj.name = name || subj.name;
    subj.source = source;
    saveDynamicData();
    showSubjectsList();
  });
}

export function deleteSyllabusSubject(idx, childIdx) {
  const subj = childIdx !== null && childIdx !== undefined
    ? (DYNAMIC_DATA.syllabusSubjects[idx].children ? DYNAMIC_DATA.syllabusSubjects[idx].children[childIdx] : null)
    : DYNAMIC_DATA.syllabusSubjects[idx];
    
  if (!subj) return;
  
  confirmDelete(subj.name, () => {
    if (childIdx !== null && childIdx !== undefined) {
      DYNAMIC_DATA.syllabusSubjects[idx].children.splice(childIdx, 1);
    } else {
      DYNAMIC_DATA.syllabusSubjects.splice(idx, 1);
    }
    saveDynamicData();
    showSubjectsList();
  });
}

export function addSyllabusSubject(folderIdx) {
  openFormModal('Add Subject', [
    { label: 'Subject Name', type: 'text', placeholder: 'e.g., New Subject' },
    { label: 'Source / Teacher', type: 'text', placeholder: 'e.g., Self Study' }
  ], (name, source) => {
    if (!name) return;
    const newSubj = { id: 'subj_' + Date.now(), name, source, type: 'main', chapters: [] };
    if (folderIdx !== undefined && DYNAMIC_DATA.syllabusSubjects[folderIdx] && DYNAMIC_DATA.syllabusSubjects[folderIdx].children) {
      DYNAMIC_DATA.syllabusSubjects[folderIdx].children.push(newSubj);
    } else {
      DYNAMIC_DATA.syllabusSubjects.push(newSubj);
    }
    saveDynamicData();
    showSubjectsList();
  });
}

export function reorderSyllabusChapter(from, to, subjectId) {
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  const subj = flatSubjects.find(s => s.id === subjectId);
  if (subj && subj.chapters) reorderArray(subj.chapters, from, to);
}

export function updateSyllabusChapter(subjectId, chIdx) {
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  const subj = flatSubjects.find(s => s.id === subjectId);
  if (!subj || !subj.chapters || !subj.chapters[chIdx]) return;
  
  openFormModal('Edit Chapter', [
    { label: 'Chapter Name', type: 'text', value: subj.chapters[chIdx].name }
  ], (name) => {
    subj.chapters[chIdx].name = name || subj.chapters[chIdx].name;
    saveDynamicData();
    renderSyllabusDetail();
  });
}

export function deleteSyllabusChapter(subjectId, chIdx) {
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  const subj = flatSubjects.find(s => s.id === subjectId);
  if (!subj || !subj.chapters || !subj.chapters[chIdx]) return;
  
  confirmDelete(subj.chapters[chIdx].name, () => {
    subj.chapters.splice(chIdx, 1);
    saveDynamicData();
    renderSyllabusDetail();
  });
}

export function addSyllabusChapter(subjectId) {
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  const subj = flatSubjects.find(s => s.id === subjectId);
  if (!subj) return;
  
  openFormModal('Add Chapter', [
    { label: 'Chapter Name', type: 'text', placeholder: 'e.g., New Chapter' }
  ], (name) => {
    if (!name) return;
    if (!subj.chapters) subj.chapters = [];
    subj.chapters.push({ id: 'ch_' + Date.now(), name });
    saveDynamicData();
    renderSyllabusDetail();
  });
}

export function moveSubjectUp(idx, childIdx) {
  if (childIdx !== null && childIdx !== undefined) {
    const children = DYNAMIC_DATA.syllabusSubjects[idx].children;
    if (childIdx > 0) { reorderArray(children, childIdx, childIdx - 1); saveDynamicData(); showSubjectsList(); }
  } else {
    if (idx > 0) { reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx - 1); saveDynamicData(); showSubjectsList(); }
  }
}

export function moveSubjectDown(idx, childIdx) {
  if (childIdx !== null && childIdx !== undefined) {
    const children = DYNAMIC_DATA.syllabusSubjects[idx].children;
    if (childIdx < children.length - 1) { reorderArray(children, childIdx, childIdx + 1); saveDynamicData(); showSubjectsList(); }
  } else {
    if (idx < DYNAMIC_DATA.syllabusSubjects.length - 1) { reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx + 1); saveDynamicData(); showSubjectsList(); }
  }
}

export function toggleFolder(idx) {
  DYNAMIC_DATA.syllabusSubjects[idx].collapsed = !DYNAMIC_DATA.syllabusSubjects[idx].collapsed;
  saveDynamicData();
  showSubjectsList();
}

export function findSubj(idOrName) {
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  return flatSubjects.find(s => s.id === idOrName || s.name === idOrName);
}

export function moveSyllabusSubject(fromIdx, toIdx, parentIdx) {
  if (parentIdx !== undefined && parentIdx !== null) {
    const children = DYNAMIC_DATA.syllabusSubjects[parentIdx].children;
    if (children) reorderArray(children, fromIdx, toIdx);
  } else {
    reorderArray(DYNAMIC_DATA.syllabusSubjects, fromIdx, toIdx);
  }
  saveDynamicData();
  showSubjectsList();
}

export function moveSyllabusChapter(subjectId, chIdx, dir) {
  const flatSubjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    flatSubjects.push(s);
    if (s.type === 'folder' && s.children) flatSubjects.push(...s.children);
  });
  const subj = flatSubjects.find(s => s.id === subjectId);
  if (!subj || !subj.chapters) return;
  
  const newIdx = chIdx + dir;
  if (newIdx < 0 || newIdx >= subj.chapters.length) return;
  reorderArray(subj.chapters, chIdx, newIdx);
  saveDynamicData();
  renderSyllabusDetail();
}

export function smartRepairSyllabusData() {
  if (!DYNAMIC_DATA || !DYNAMIC_DATA.syllabusSubjects) return;
  
  DYNAMIC_DATA.syllabusSubjects.forEach((subj, idx) => {
    if (subj.type === 'folder' && subj.children) {
      subj.children.forEach(child => {
        if (!child.chapters) child.chapters = [];
        if (!child.id) child.id = 'subj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      });
    }
    if (!subj.id) subj.id = 'subj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    
    // Validate chapters have unique IDs
    if (subj.chapters) {
      const idSet = new Set();
      subj.chapters.forEach(ch => {
        if (!ch.id || idSet.has(ch.id)) {
          ch.id = 'ch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        }
        idSet.add(ch.id);
      });
    }
  });
  
  // Remove undefined or null entries
  DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => s && s.name);
  DYNAMIC_DATA.syllabusSubjects.forEach(s => {
    if (s.type === 'folder' && s.children) {
      s.children = s.children.filter(c => c && c.name);
    }
  });
  
  saveDynamicData();
}


// ─── Window Attachments ─────────────────
window.renderSyllabus = renderSyllabus;
window.showSubjectsList = showSubjectsList;
window.renderSubjectCard = renderSubjectCard;
window.openSubjectDetail = openSubjectDetail;
window.renderSyllabusDetail = renderSyllabusDetail;
window.toggleSyllabusCheck = toggleSyllabusCheck;
window.toggleIbsCheck = toggleIbsCheck;
window.calculateOverallProgress = calculateOverallProgress;
window.calculateSubjectProgress = calculateSubjectProgress;
window.reorderSyllabusSubject = reorderSyllabusSubject;
window.updateSyllabusSubject = updateSyllabusSubject;
window.deleteSyllabusSubject = deleteSyllabusSubject;
window.addSyllabusSubject = addSyllabusSubject;
window.reorderSyllabusChapter = reorderSyllabusChapter;
window.updateSyllabusChapter = updateSyllabusChapter;
window.deleteSyllabusChapter = deleteSyllabusChapter;
window.addSyllabusChapter = addSyllabusChapter;
window.moveSubjectUp = moveSubjectUp;
window.moveSubjectDown = moveSubjectDown;
window.toggleFolder = toggleFolder;
window.findSubj = findSubj;
window.moveSyllabusSubject = moveSyllabusSubject;
window.moveSyllabusChapter = moveSyllabusChapter;
window.smartRepairSyllabusData = smartRepairSyllabusData;
