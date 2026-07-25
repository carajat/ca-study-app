// ========================================
// edit-mode.js — Edit Mode & Drag-Drop
// ========================================

import { state, isEditMode, setEditMode, saveDynamicData } from './state.js';

export function toggleEditMode() {
  setEditMode(!isEditMode);
  document.body.classList.toggle('edit-mode-active', isEditMode);
  if (typeof window.switchTab === 'function') window.switchTab(state.activeTab); // re-render current tab
}

// ─── Drag and Drop & Edit Helpers ───────

window.activeSortables = [];
export function initSortable(containerIdOrEl, arrayRef, saveCallback) {
  const container = typeof containerIdOrEl === "string" ? document.getElementById(containerIdOrEl) : containerIdOrEl;
  
  if (!container) return;
  if (isEditMode) {
    const s = new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      delay: 150, // Time in ms to define when the sorting should start
      delayOnTouchOnly: true, // Only delay if user is using touch
      touchStartThreshold: 3, // px, how many pixels the point should move before cancelling a delayed drag event
      fallbackTolerance: 3,
      onEnd: function(evt) {
        if (evt.oldIndex !== evt.newIndex) {
          const item = arrayRef.splice(evt.oldIndex, 1)[0];
          arrayRef.splice(evt.newIndex, 0, item);
          saveCallback();
        }
      }
    });
    window.activeSortables.push(s);
  }
}
export function clearSortables() {
  if (window.activeSortables) {
    window.activeSortables.forEach(s => s.destroy());
    window.activeSortables = [];
  }
}

let draggedItemIndex = null;

export function handleDragStart(e, index) {
  if (!isEditMode) return;
  draggedItemIndex = index;
  const el = e.target.closest('.draggable-item');
  if (el) el.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index);
}

export function handleDragOver(e) {
  if (!isEditMode) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

export function handleDrop(e, dropIndex, context, ...args) {
  if (!isEditMode || draggedItemIndex === null || draggedItemIndex === dropIndex) return;
  e.preventDefault();
  
  // Dispatch to context handler
  if (context === 'syllabus-subject') window.reorderSyllabusSubject(draggedItemIndex, dropIndex);
  else if (context === 'syllabus-chapter') window.reorderSyllabusChapter(draggedItemIndex, dropIndex, args[0], args[1]);
  else if (context === 'exam') window.reorderExam(draggedItemIndex, dropIndex);
  else if (context === 'mock') window.reorderMock(draggedItemIndex, dropIndex, args[0]);
  else if (context === 'schedule-slot') window.reorderScheduleSlot(draggedItemIndex, dropIndex, args[0]);
  
  draggedItemIndex = null;
  saveDynamicData();
  if (typeof window.switchTab === 'function') window.switchTab(state.activeTab);
}

export function handleDragEnd(e) {
  const el = e.target.closest('.draggable-item');
  if (el) el.classList.remove('dragging');
}

export function reorderArray(arr, from, to) {
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
}

export function promptEdit(title, defaultValue, callback) {
  const val = prompt(title, defaultValue);
  if (val !== null && val.trim() !== '') {
    callback(val.trim());
    saveDynamicData();
    if (typeof window.switchTab === 'function') window.switchTab(state.activeTab);
  }
}

export function confirmDelete(itemName, callback) {
  if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
    callback();
    saveDynamicData();
    if (typeof window.switchTab === 'function') window.switchTab(state.activeTab);
  }
}

// ─── Window Attachments ─────────────────
window.toggleEditMode = toggleEditMode;
window.reorderArray = reorderArray;
window.confirmDelete = confirmDelete;
window.initSortable = initSortable;
window.clearSortables = clearSortables;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;
window.promptEdit = promptEdit;
