
// ========================================
// CA Final Study Companion — App Logic
// ========================================

// ─── State ──────────────────────────────
let state = {
  activeGroup: localStorage.getItem('ca_app_prefs_group') || 'group1',
  activeTab: 'dashboard',
  activeSchedule: 'earlyMorning',
  activeNotificationSchedule: null,
  targetAttempt: 'Nov 2026',
  plannerDate: new Date(),
  calendarMonth: new Date(),
  syllabusView: 'list', // 'list' or 'detail'
  activeSubject: null
};
window.state = state;

// ─── Dynamic Data State ─────────────────
var DYNAMIC_DATA = null;
let isEditMode = false;


function getDynamicDataKey() { return state.activeGroup === 'group2' ? 'ca_dynamic_data' : 'ca_dynamic_data_group1'; }
function getStorageKey() { return state.activeGroup === 'group2' ? 'ca_final_tracker' : 'ca_final_tracker_group1'; }

function switchGroup(groupId) {
  state.activeGroup = groupId;
  localStorage.setItem('ca_app_prefs_group', groupId);
  loadDynamicData();

  // Migrate Emojis for existing users
  
  // ULTIMATE EMOJI TO MATERIAL ICON MIGRATION
  let dataStr = JSON.stringify(DYNAMIC_DATA);
  const emojiMap = {
    '☀️': 'wb_sunny', '☕': 'local_cafe', '🍽️': 'restaurant', '😴': 'bedtime',
    '📚': 'menu_book', '📖': 'menu_book', '✍️': 'edit_document', '💾': 'save',
    '🏋️': 'fitness_center', '📱': 'phone_iphone', '📺': 'tv', '🟢': 'radio_button_checked',
    '⚠️': 'warning', '✅': 'check_circle', '📅': 'calendar_month', '📊': 'bar_chart',
    '⏱️': 'timer', '📝': 'edit_document', '📁': 'folder', '📘': 'menu_book',
    '💪': 'fitness_center', '🏃': 'directions_run', '🧘': 'self_improvement',
    '🚿': 'shower', '🚌': 'directions_bus', '🚗': 'directions_car'
  };
  
  // Replace all known mapped emojis with their material icon equivalents in strings
  Object.keys(emojiMap).forEach(emoji => {
    const regex = new RegExp(emoji, 'g');
    dataStr = dataStr.replace(regex, emojiMap[emoji]);
  });
  
  // Strip any remaining emojis globally
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F200}-\u{1F251}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
  dataStr = dataStr.replace(emojiRegex, '');
  
  // Also clean up any 'book' ligatures that act as emojis
  dataStr = dataStr.replace(/"icon":"book"/g, '"icon":"menu_book"');
  
  DYNAMIC_DATA = JSON.parse(dataStr);
  saveDynamicData();


  smartRepairSyllabusData();
  // Re-attach cloud listener to the new group's path
  if (typeof window.attachCloudListener === 'function') window.attachCloudListener();
  const groupSel = document.getElementById('group-selector');
  if (groupSel) groupSel.value = state.activeGroup;
  switchTab('dashboard'); // This will also re-render everything
}

function loadDynamicData() {
  const savedData = localStorage.getItem(getDynamicDataKey());
  let parsedData = null;
  
  if (savedData) {
    try {
      parsedData = JSON.parse(savedData);
    } catch(e) {
      console.error("Failed to parse dynamic data", e);
    }
  }
  
  // Validate that critical fields exist
  if (!parsedData || !parsedData.exam || !parsedData.schedules) {
    console.warn("Corrupted or outdated dynamic data found. Resetting to APP_DATA.");
    
    try {
      if (!APP_DATA[state.activeGroup]) throw new Error("APP_DATA missing group");
      DYNAMIC_DATA = JSON.parse(JSON.stringify(APP_DATA[state.activeGroup]));
    } catch(e) {
      console.error(e);
      DYNAMIC_DATA = JSON.parse(JSON.stringify(APP_DATA.group2 || APP_DATA));
    }
  
  } else {
    DYNAMIC_DATA = parsedData;
    for (let key in APP_DATA[state.activeGroup]) {
      if (!(key in DYNAMIC_DATA)) {
        DYNAMIC_DATA[key] = JSON.parse(JSON.stringify(APP_DATA[state.activeGroup][key]));
      }
    }
  }
  
    if (DYNAMIC_DATA.mocks && !Array.isArray(DYNAMIC_DATA.mocks)) {
    const newMocks = [];
    Object.keys(DYNAMIC_DATA.mocks).forEach((key, idx) => {
      newMocks.push({ id: key, name: 'Series ' + (idx + 1), tests: DYNAMIC_DATA.mocks[key] });
    });
    DYNAMIC_DATA.mocks = newMocks;
    saveDynamicData();
  }
  
  // Clean up legacy Group 2 data in Group 1 if they got copied over by mistake
  if (state.activeGroup === 'group1') {
    const hasLegacyDT = DYNAMIC_DATA.mocks.some(series => series.tests && series.tests.some(t => t.subject === 'DT'));
    const isEmpty = DYNAMIC_DATA.finalExams && DYNAMIC_DATA.finalExams.length === 0;
    if (hasLegacyDT || isEmpty) {
      // Re-initialize with proper APP_DATA.group1 defaults
      if (APP_DATA.group1.mocks && Array.isArray(APP_DATA.group1.mocks)) {
         // Need to run the new structure
      }
      
      const newMocks = [];
      if (!Array.isArray(APP_DATA.group1.mocks)) {
         Object.keys(APP_DATA.group1.mocks).forEach((key, idx) => {
            newMocks.push({ id: key, name: 'Series ' + (idx + 1), tests: APP_DATA.group1.mocks[key] });
         });
      } else {
         newMocks.push(...APP_DATA.group1.mocks);
      }
      
      DYNAMIC_DATA.mocks = newMocks.length > 0 ? newMocks : DYNAMIC_DATA.mocks;
      if (APP_DATA.group1.finalExams.length > 0) DYNAMIC_DATA.finalExams = JSON.parse(JSON.stringify(APP_DATA.group1.finalExams));
      if (APP_DATA.group1.syllabusSubjects.length > 0) DYNAMIC_DATA.syllabusSubjects = JSON.parse(JSON.stringify(APP_DATA.group1.syllabusSubjects));
      saveDynamicData();
    }
  }
  
  if (DYNAMIC_DATA.syllabusSubjects) {
    let changed = false;
    DYNAMIC_DATA.syllabusSubjects.forEach(s => {
      if (s.name && (s.name.includes('<') || s.name.includes('menu_book') || s.name.includes('auto_stories') || s.name.includes('class='))) {
        s.name = s.name.replace(/<[^>]*>?/gm, '');
        s.name = s.name.replace(/onclick="[^"]*"/g, '');
        s.name = s.name.replace(/onchange="[^"]*"/g, '');
        s.name = s.name.replace(/class="[^"]*"/g, '');
        s.name = s.name.replace(/menu_book /g, '');
        s.name = s.name.replace(/auto_stories /g, '');
        s.name = s.name.replace(/"/g, '');
        s.name = s.name.trim();
        if (!s.name || s.name === '') {
          if (s.id === 'dt') s.name = 'Paper 4: DT & International Tax';
          else if (s.id === 'idt') s.name = 'Paper 5: IDT (GST + Customs)';
          else s.name = 'Syllabus Subject';
        }
        changed = true;
      }
    });
    if (changed) {
      saveDynamicData();
    }
  }

  if (!DYNAMIC_DATA.syllabusSubjects) {
    DYNAMIC_DATA.syllabusSubjects = [
      { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: DYNAMIC_DATA.dtChapters || APP_DATA.group2.dtChapters },
      { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: DYNAMIC_DATA.idtChapters || APP_DATA.group2.idtChapters },
      { id: 'ibs-fr', name: 'IBS — FR', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.fr) ? DYNAMIC_DATA.ibsSubjects.fr.chapters : APP_DATA.group2.ibsSubjects.fr.chapters },
      { id: 'ibs-afm', name: 'IBS — AFM', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.afm) ? DYNAMIC_DATA.ibsSubjects.afm.chapters : APP_DATA.group2.ibsSubjects.afm.chapters },
      { id: 'ibs-audit', name: 'IBS — Audit', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.audit) ? DYNAMIC_DATA.ibsSubjects.audit.chapters : APP_DATA.group2.ibsSubjects.audit.chapters },
      { id: 'ibs-law', name: 'IBS — Law (SPOM A)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.law) ? DYNAMIC_DATA.ibsSubjects.law.chapters : APP_DATA.group2.ibsSubjects.law.chapters },
      { id: 'ibs-scpm', name: 'IBS — SC&PM (SPOM B)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.scpm) ? DYNAMIC_DATA.ibsSubjects.scpm.chapters : APP_DATA.group2.ibsSubjects.scpm.chapters }
    ];
    saveDynamicData();
  }
  
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
       DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || (s.id.startsWith('ibs-') && !s.children)));
       DYNAMIC_DATA.syllabusSubjects.push(folder);
       saveDynamicData();
     }
  }
  if (typeof window.updateUserBadge === 'function') window.updateUserBadge();
}

function saveDynamicData() {
  if (window.isReadOnlyMode) { if(typeof showToast === "function") showToast("Read-Only Mode: Changes will not be saved."); return; }
  localStorage.setItem(getDynamicDataKey(), JSON.stringify(DYNAMIC_DATA));
  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud({ dynamic: DYNAMIC_DATA, state: loadState(), tracker: trackerState });
  }

}

function toggleEditMode() {
  isEditMode = !isEditMode;
  document.body.classList.toggle('edit-mode-active', isEditMode);
  
  if (isEditMode) {
    if (!document.getElementById('edit-mode-indicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'edit-mode-indicator';
      indicator.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px;">edit</span> Editing Mode &nbsp;<span class="material-symbols-rounded" style="font-size:14px; opacity:0.8;">close</span>';
      indicator.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:var(--warning-color, #f59e0b); color:#fff; padding:6px 12px 6px 16px; border-radius:20px; font-weight:700; font-size:12px; z-index:9999; display:flex; align-items:center; gap:4px; box-shadow:0 4px 12px rgba(245, 158, 11, 0.4); cursor:pointer; user-select:none; transition:transform 0.2s;';
      indicator.onclick = () => {
        toggleEditMode();
        showToast('Edit mode turned OFF', 'info');
      };
      // Add active state for touch/click feedback
      indicator.onmousedown = () => indicator.style.transform = 'translateX(-50%) scale(0.95)';
      indicator.onmouseup = () => indicator.style.transform = 'translateX(-50%) scale(1)';
      indicator.ontouchstart = () => indicator.style.transform = 'translateX(-50%) scale(0.95)';
      indicator.ontouchend = () => indicator.style.transform = 'translateX(-50%) scale(1)';
      document.body.appendChild(indicator);
    }
  } else {
    const indicator = document.getElementById('edit-mode-indicator');
    if (indicator) indicator.remove();
  }
  
  switchTab(state.activeTab); // re-render current tab
}

// ─── Drag and Drop & Edit Helpers ───────

window.activeSortables = [];
function initSortable(containerIdOrEl, arrayRef, saveCallback) {
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
function clearSortables() {
  if (window.activeSortables) {
    window.activeSortables.forEach(s => s.destroy());
    window.activeSortables = [];
  }
}

let draggedItemIndex = null;

function handleDragStart(e, index) {
  if (!isEditMode) return;
  draggedItemIndex = index;
  const el = e.target.closest('.draggable-item');
  if (el) el.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index);
}

function handleDragOver(e) {
  if (!isEditMode) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e, dropIndex, context, ...args) {
  if (!isEditMode || draggedItemIndex === null || draggedItemIndex === dropIndex) return;
  e.preventDefault();
  
  // Dispatch to context handler
  if (context === 'syllabus-subject') reorderSyllabusSubject(draggedItemIndex, dropIndex);
  else if (context === 'syllabus-chapter') reorderSyllabusChapter(draggedItemIndex, dropIndex, args[0], args[1]);
  else if (context === 'exam') reorderExam(draggedItemIndex, dropIndex);
  else if (context === 'mock') reorderMock(draggedItemIndex, dropIndex, args[0]);
  else if (context === 'schedule-slot') reorderScheduleSlot(draggedItemIndex, dropIndex, args[0]);
  
  draggedItemIndex = null;
  saveDynamicData();
  switchTab(state.activeTab);
}

function handleDragEnd(e) {
  const el = e.target.closest('.draggable-item');
  if (el) el.classList.remove('dragging');
}

function reorderArray(arr, from, to) {
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
}

function promptEdit(title, defaultValue, callback) {
  const val = prompt(title, defaultValue);
  if (val !== null && val.trim() !== '') {
    callback(val.trim());
    saveDynamicData();
    switchTab(state.activeTab);
  }
}

function confirmDelete(itemName, callback) {
  if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
    callback();
    saveDynamicData();
    switchTab(state.activeTab);
  }
}


// ─── Storage Helper ─────────────────────


function loadState() {
  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Load error:', e); }
  return {};
}

function saveState(data) {
  try {
    const existing = loadState();
    const merged = { ...existing, ...data };
    localStorage.setItem(getStorageKey(), JSON.stringify(merged));
  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud({ dynamic: DYNAMIC_DATA, state: loadState(), tracker: trackerState });
  }

  } catch (e) { console.error('Save error:', e); }
}

function getSyllabusProgress() {
  return loadState().syllabusProgress || {};
}

function saveSyllabusProgress(progress) {
  saveState({ syllabusProgress: progress });
}

function getMockScores() {
  return loadState().mockScores || {};
}

function saveMockScore(mockId, score, notes) {
  const scores = getMockScores();
  scores[mockId] = { score: parseInt(score), notes, date: new Date().toISOString() };
  saveState({ mockScores: scores });
}

function getPlannerTasks() {
  return loadState().plannerTasks || {};
}

function savePlannerTasks(tasks) {
  saveState({ plannerTasks: tasks });
}

// ─── Toast ──────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerHTML = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Modal ──────────────────────────────
function openModal(title, bodyHtml) {
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('show');
  overlay.style.display = '';
}

window.activeFormCallback = null;
function openFormModal(title, fields, callback) {
  window.activeFormCallback = callback;
  let html = '<div class="form-modal-body">';
  
  fields.forEach((f, idx) => {
    html += `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type || 'text'}" id="fm-input-${idx}" value="${f.value || ''}" placeholder="${f.placeholder || ''}" class="form-input">
      </div>
    `;
  });
  
  html += `
    <div style="display: flex; gap: 8px; margin-top: 15px;">
      <button class="btn-primary" onclick="submitFormModal(${fields.length})"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">save</span> Save</button>
      <button class="btn-secondary" onclick="closeModal()"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">close</span> Cancel</button>
    </div>
  </div>`;
  
  openModal(title, html);
}

function submitFormModal(numFields) {
  if (window.activeFormCallback) {
    const values = [];
    for (let i = 0; i < numFields; i++) {
      values.push(document.getElementById(`fm-input-${i}`).value);
    }
    window.activeFormCallback(...values);
    closeModal();
  }
}

// ─── Tab Navigation ─────────────────────
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelector(`.nav-item[data-tab="${tabName}"]`).classList.add('active');
  
  // Refresh content
  if (tabName === 'dashboard') {
    const gs = document.getElementById('group-selector');
    if(gs) gs.value = state.activeGroup;
    const gt = document.getElementById('group-title');
    if(gt) gt.textContent = state.activeGroup === 'group1' ? 'CA Final Group 1' : 'CA Final Group 2';
    const hs = document.getElementById('header-subtitle');
    if(hs) hs.textContent = `${state.targetAttempt || 'Nov 2026'}`;
    renderDashboard();
    if(window.updateOngoingJournalTask) window.updateOngoingJournalTask();
  populateTrackerSubjects();
  restoreTrackerState();
  renderTodaysLog();
  renderTodaysLog();
  }
  if (tabName === 'exams') renderExams();
  if (tabName === 'schedule') renderSchedule();
  if (tabName === 'planner') renderPlanner();
  if (tabName === 'syllabus') renderSyllabus();
  
  window.scrollTo(0, 0);
}

// ─── Date Helpers ───────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDateFull(date) {
  const d = new Date(date);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  const now = new Date(typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  now.setHours(0,0,0,0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function isToday(date) {
  const d = new Date(date);
  const today = new Date(typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

// ═══════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════
function renderDashboard() {
  refreshConsistencyData();
  updateCountdown();
  updateDashboardStats();
  updateCurrentActivity();
  updateDashboardPlanner();
  updateQuote();
  updateConsistencyWidget();
  renderTrendGraph();
}

function renderTrendGraph() {
  const container = document.getElementById('trend-graph-container');
  if (!container) return;

  const days = 14;
  const today = new Date(typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  
  let data = [];
  let maxMins = 0;
  
  for (let i = days - 1; i >= 0; i--) {
    let d = new Date(today);
    d.setDate(d.getDate() - i);
    let dStr = dateKey(d);
    
    let dayMins = 0;
    if (DYNAMIC_DATA && DYNAMIC_DATA.journalEntries && DYNAMIC_DATA.journalEntries[dStr]) {
      const rows = DYNAMIC_DATA.journalEntries[dStr].rows || [];
      rows.forEach(r => {
        dayMins += ((parseInt(r.durHH)||0) * 60 + (parseInt(r.durMM)||0));
      });
    }
    if (dayMins > maxMins) maxMins = dayMins;
    
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    data.push({ date: dStr, mins: dayMins, label: `${d.getDate()} ${months[d.getMonth()]}` });
  }
  
  const effectiveMax = maxMins > 0 ? maxMins * 1.2 : 60; // 20% headroom
  let hrsMax = Math.floor(effectiveMax / 60);
  let mnsMax = Math.floor(effectiveMax % 60);
  document.getElementById('trend-max-label').textContent = `Max: ${hrsMax}h ${mnsMax}m`;
  
  document.getElementById('trend-start-date').textContent = data[0].label;

  let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="overflow:visible; filter: drop-shadow(0 4px 6px rgba(108,60,225,0.2));">
    <defs>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.6" />
        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0" />
      </linearGradient>
    </defs>`;
  
  let points = [];
  let htmlDots = '';
  
  data.forEach((d, index) => {
    let x = (index / (days - 1)) * 100;
    let y = 100 - ((d.mins / effectiveMax) * 100);
    points.push(`${x},${y}`);
    
    let hrs = Math.floor(d.mins / 60);
    let mns = d.mins % 60;
    let timeStr = d.mins === 0 ? '0h' : mns === 0 ? `${hrs}h` : hrs === 0 ? `${mns}m` : `${hrs}h ${mns}m`;
    
    // Create invisible touch targets for each column
    let leftPct = index === 0 ? 0 : index === days - 1 ? 100 - (50/(days-1)) : (index - 0.5) / (days - 1) * 100;
    let widthPct = index === 0 || index === days - 1 ? 50/(days-1) : 100/(days-1);
    
    htmlDots += `<div style="position:absolute; left:${leftPct}%; top:0; width:${widthPct}%; height:100%; cursor:pointer; z-index:10;" onclick="showTrendTooltip(this, '${timeStr}', '${d.label}')"></div>`;
  });
  
  let pointsStr = points.join(' ');
  
  // Filled Area
  svgHtml += `<polygon points="0,100 ${pointsStr} 100,100" fill="url(#areaGradient)" />`;
  
  // Line
  svgHtml += `<polyline points="${pointsStr}" fill="none" stroke="var(--primary)" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />`;
  
  svgHtml += `</svg>`;
  container.innerHTML = svgHtml + htmlDots;
}

window.showTrendTooltip = function(el, timeStr, dateLabel) {
  let tooltip = document.getElementById('trend-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'trend-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'var(--text-primary)';
    tooltip.style.color = 'var(--bg-base)';
    tooltip.style.padding = '6px 10px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontSize = '12px';
    tooltip.style.fontWeight = 'bold';
    tooltip.style.zIndex = '9999';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    tooltip.style.textAlign = 'center';
    tooltip.style.transition = 'opacity 0.2s ease-in-out';
    document.body.appendChild(tooltip);
  }
  
  tooltip.innerHTML = `<div style="font-size:10px; opacity:0.8; margin-bottom:2px; font-weight:600;">${dateLabel}</div><div>${timeStr}</div>`;
  
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + window.scrollX + rect.width / 2;
  const topY = rect.top + window.scrollY; // The top of the graph container
  
  tooltip.style.display = 'block';
  tooltip.style.opacity = '1';
  
  // Position above the graph container
  tooltip.style.left = centerX + 'px';
  tooltip.style.top = (topY - 10) + 'px';
  tooltip.style.transform = 'translate(-50%, -100%)';
  
  // Auto-hide after 2.5s
  if (window.trendTooltipTimeout) clearTimeout(window.trendTooltipTimeout);
  window.trendTooltipTimeout = setTimeout(() => {
    tooltip.style.opacity = '0';
    setTimeout(() => tooltip.style.display = 'none', 200);
  }, 2500);
};

function updateCountdown() {
  let examDate = new Date(DYNAMIC_DATA.exam.date);
  if (DYNAMIC_DATA.finalExams && DYNAMIC_DATA.finalExams.length > 0) {
    const dates = DYNAMIC_DATA.finalExams.map(x => new Date(x.date)).filter(d => !isNaN(d.valueOf()));
    if (dates.length > 0) examDate = new Date(Math.min(...dates));
  }
  // Set to exactly 2:00 PM local time
  examDate.setHours(14, 0, 0, 0);
  const now = new Date(typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  const diff = examDate - now;
  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '0';
    document.getElementById('cd-hours').textContent = '0';
    document.getElementById('cd-mins').textContent = '0';
    document.getElementById('cd-secs').textContent = '0';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  document.getElementById('cd-days').textContent = days;
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}

function updateDashboardStats() {
  // Syllabus progress
  const pct = calculateOverallProgress();
  document.getElementById('dash-syllabus-pct').textContent = pct + '%';
  document.getElementById('dash-syllabus-bar').style.width = pct + '%';
  
  // Next mock
  const nextMock = getNextMock();
  const elValue = document.getElementById('dash-next-mock');
  const elLabel = document.getElementById('dash-next-mock-label');
  
  if (nextMock) {
    elValue.style.fontSize = '';
    elValue.style.lineHeight = '';
    elValue.textContent = daysUntil(nextMock.date) + ' days';
    elLabel.textContent = nextMock.subject;
  } else {
    elValue.style.fontSize = '';
    elValue.style.lineHeight = '';
    elValue.textContent = 'Done!';
    elLabel.textContent = 'All mocks completed';
  }
}

function updateCurrentActivity() {
  const schedule = DYNAMIC_DATA.schedules[state.activeSchedule];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTime = currentHour * 60 + currentMin;
  
  let currentSlot = null;
  let nextSlot = null;
  
  for (let i = 0; i < schedule.slots.length; i++) {
    const slot = schedule.slots[i];
    const [startStr] = slot.startRange.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + slot.duration;
    
    if (currentTime >= startMin && currentTime < endMin) {
      currentSlot = slot;
      if (i + 1 < schedule.slots.length) nextSlot = schedule.slots[i + 1];
    }
  }
  
  if (currentSlot) {
    document.getElementById('ca-slot-name').innerHTML = '<span class="material-symbols-rounded" style="vertical-align:middle; margin-right:6px; font-size: 20px;">' + (currentSlot.icon || '').trim() + '</span> ' + currentSlot.label;
    document.getElementById('ca-slot-details').textContent = `Window: ${currentSlot.startRange} · Duration: ${currentSlot.duration >= 60 ? (currentSlot.duration/60) + ' hrs' : currentSlot.duration + ' min'}`;
    document.getElementById('ca-slot-name').className = 'ca-slot-name slot-' + currentSlot.type;
  } else {
    document.getElementById('ca-slot-name').innerHTML = '<span class="material-symbols-rounded icon-sm">bed</span> Rest Time';
    document.getElementById('ca-slot-details').textContent = 'No active session right now';
  }
  
  if (nextSlot) {
    document.getElementById('ca-next-slot').innerHTML = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">arrow_forward</span> Next: ' + '<span class="material-symbols-rounded" style="vertical-align:middle; font-size:14px; margin-right:4px;">' + (nextSlot.icon || '').trim() + '</span> ' + nextSlot.label;
  } else {
    document.getElementById('ca-next-slot').textContent = '';
  }
}

function updateDashboardPlanner() {
  const tasks = getPlannerTasks();
  const todayTasks = tasks[dateKey(new Date())] || [];
  const done = todayTasks.filter(t => t.done).length;
  const total = todayTasks.length;
  document.getElementById('dash-planner-done').textContent = done;
  document.getElementById('dash-planner-total').textContent = total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('dash-planner-bar').style.width = pct + '%';
}

function updateQuote() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const quoteIdx = dayOfYear % DYNAMIC_DATA.quotes.length;
  document.getElementById('daily-quote').textContent = '"' + DYNAMIC_DATA.quotes[quoteIdx] + '"';
}

// ═══════════════════════════════════════════
//  EXAM SCHEDULE
// ═══════════════════════════════════════════
function renderExams() {
  let examDateStr = DYNAMIC_DATA.exam.date;
  if (DYNAMIC_DATA.finalExams && DYNAMIC_DATA.finalExams.length > 0) {
    const dates = DYNAMIC_DATA.finalExams.map(x => new Date(x.date)).filter(d => !isNaN(d.valueOf()));
    if (dates.length > 0) examDateStr = new Date(Math.min(...dates)).toISOString();
  }
  const days = daysUntil(examDateStr);
  document.getElementById('exam-days-left').textContent = days + ' days left';
  
  // Next mock
  const nextMock = getNextMock();
  if (nextMock) {
    const mockDays = daysUntil(nextMock.date);
    document.getElementById('nmc-subject').textContent = nextMock.subject;
    document.getElementById('nmc-date').textContent = formatDate(nextMock.date);
    document.getElementById('nmc-countdown').textContent = mockDays <= 0 ? 'TODAY!' : mockDays + ' days remaining';
    document.getElementById('next-mock-card').className = 'next-mock-card glass-card' + (mockDays <= 3 ? ' urgent' : '');
  }
  
  // Render series
  const container = document.getElementById('mock-series-container');
  container.innerHTML = '';
  const scores = getMockScores();
  
  DYNAMIC_DATA.mocks.forEach((series, seriesIdx) => {
    const seriesHtml = `
      <div class="mock-series glass-card">
        <h3 class="series-title" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          ${!isEditMode ? `<span>${series.name}</span>` : `
            <input type="text" class="inline-input" value="${series.name}" onchange="updateMockSeries(${seriesIdx}, this.value)" style="font-weight:bold; font-size:1.1em;">
            <div class="edit-mode-controls" style="display:inline-flex; opacity:1; transform:none; position:static; margin-left:10px;">
              <button class="delete-btn" onclick="deleteMockSeries(${seriesIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
            </div>
          `}
        </h3>
        <div class="mock-list">
          ${series.tests.map((mock, mockIdx) => {
            const score = scores[mock.id];
            const isPast = daysUntil(mock.date) < 0;
            const isUpcoming = daysUntil(mock.date) >= 0 && daysUntil(mock.date) <= 3;
            return `
              <div class="mock-item ${score ? 'scored' : ''} ${isUpcoming ? 'upcoming' : ''}"  ${!isEditMode ? `onclick="openMockScoreModal('${mock.id}', '${mock.subject}', '${series.name}', '${mock.date}')"` : ''}>
                ${isEditMode ? `
  
` : ''}
                ${!isEditMode ? `
                <div class="mock-subject" style="flex:1">${mock.subject}</div>
                <div class="mock-date">${formatDate(mock.date)}</div>
                <div class="mock-score">${score ? score.score + '/100' : (isPast ? '<span class="material-symbols-rounded icon-sm" style="color:var(--error-color);">warning</span>' : '<span class="material-symbols-rounded icon-sm">check_box_outline_blank</span>')}</div>
                ` : `
                <div class="mock-subject" style="flex:1; margin-right:10px;">
                  <input type="text" class="inline-input" value="${mock.subject}" onchange="updateMock('${series.id}', ${mockIdx}, 'subject', this.value)">
                </div>
                <div class="mock-date">
                  <input type="date" class="inline-input date-input" value="${mock.date}" onchange="updateMock('${series.id}', ${mockIdx}, 'date', this.value)">
                </div>
                <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
    <button class="move-btn" onclick="event.stopPropagation(); moveMock('${series.id}', ${mockIdx}, -1)" ${mockIdx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
    <button class="move-btn" onclick="event.stopPropagation(); moveMock('${series.id}', ${mockIdx}, 1)" ${mockIdx===series.tests.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
    <button class="delete-btn" onclick="event.stopPropagation(); deleteMock('${series.id}', ${mockIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
  </div>
                </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
        ${isEditMode ? `<button class="add-item-btn" onclick="addMock('${series.id}')">+ Add Mock</button>` : ''}
      </div>
    `;
    container.innerHTML += seriesHtml;
  });
  
  if (isEditMode) {
    container.innerHTML += `<button class="add-item-btn" style="margin-bottom: 20px" onclick="addMockSeries()">+ Add New Test Series</button>`;
  }

  
  // ─── Final Exam Datesheet ─────────────
  container.innerHTML += `
    <div class="mock-series glass-card final-datesheet">
      <h3 class="series-title" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <span><span class="material-symbols-rounded icon-sm">school</span> CA Final - ${state.targetAttempt}</span>
        ${isEditMode ? `
          <div style="display:flex; gap:10px; align-items:center;">
            <select class="inline-input" onchange="updateTargetAttempt(this.value)" style="padding:4px; font-size:12px; border-radius:4px;">
              <option value="Nov 2026" ${state.targetAttempt==='Nov 2026'?'selected':''}>Nov 2026</option>
              <option value="May 2027" ${state.targetAttempt==='May 2027'?'selected':''}>May 2027</option>
              <option value="Nov 2027" ${state.targetAttempt==='Nov 2027'?'selected':''}>Nov 2027</option>
            </select>
            <button class="add-item-btn" style="padding:4px 8px; font-size:12px;" onclick="syncOfficialDates()">🔄 Sync Dates</button>
          </div>
        ` : ''}
      </h3>
      <div class="mock-list">
        ${DYNAMIC_DATA.finalExams.map((exam, examIdx) => {
          const days = daysUntil(exam.date);
          const dateObj = new Date(exam.date);
          const dayName = !isNaN(dateObj.valueOf()) ? dateObj.toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown Day';
          const timeStr = exam.subject.toLowerCase().includes('ibs') ? '2:00 PM - 6:00 PM' : '2:00 PM - 5:00 PM';
          return `
            <div class="mock-item final-exam-item">
              ${!isEditMode ? `
              <div class="mock-subject" style="flex:1">${exam.subject}</div>
              <div class="mock-date">${formatDate(exam.date)} (${dayName})<br><small>${timeStr}</small></div>
              <div class="mock-score final-days">${days} days</div>
              ` : `
              <div class="mock-subject" style="flex:1; display:flex; flex-direction:column; gap:4px; margin-right:10px;">
                <input type="text" class="inline-input" value="${exam.subject}" onchange="updateExam(${examIdx}, 'subject', this.value)">
                <small style="color:var(--text-grey); font-size:12px;">${timeStr}</small>
              </div>
              <div class="mock-date" style="display:flex; flex-direction:column; gap:4px; margin-right:10px;">
                <input type="date" class="inline-input date-input" value="${exam.date}" onchange="updateExam(${examIdx}, 'date', this.value)">
                <small style="color:var(--text-grey); font-size:12px;">${dayName}</small>
              </div>
              <div class="edit-mode-controls">
                <button class="delete-btn" onclick="deleteExam(${examIdx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
              </div>
              `}
            </div>
          `;
        }).join('')}
      </div>
      ${isEditMode ? `<button class="add-item-btn" onclick="addExam()">+ Add Exam</button>` : ''}
    </div>
  `;
  
  renderScoreChart();
}

function getNextMock() {
  const allMocks = DYNAMIC_DATA.mocks.flatMap(s => s.tests);
  const upcoming = allMocks.filter(m => daysUntil(m.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcoming[0] || null;
}

function getNextMockFor(subj) {
  const allMocks = DYNAMIC_DATA.mocks.flatMap(s => s.tests);
  const upcoming = allMocks.filter(m => m.subject === subj && daysUntil(m.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date));
  return upcoming[0] || null;
}

function openMockScoreModal(mockId, subject, series, date) {
  const scores = getMockScores();
  const existing = scores[mockId] || {};
  
  openModal(`${subject} — Series ${series}`, `
    <div class="mock-modal">
      <p class="mock-modal-date"><span class="material-symbols-rounded icon-sm">event</span> ${formatDate(date)}</p>
      <div class="form-group">
        <label>Score (out of 100)</label>
        <input type="number" id="mock-score-input" min="0" max="100" value="${existing.score || ''}" placeholder="Enter marks">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea id="mock-notes-input" rows="3" placeholder="Weak areas, what to revise...">${existing.notes || ''}</textarea>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn-primary" onclick="saveMockScoreFromModal('${mockId}')"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">save</span> Save Score</button>
        ${existing.score ? `<button class="btn-secondary" onclick="clearMockScoreFromModal('${mockId}')" style="flex: 0.5;"><span class="material-symbols-rounded icon-sm">delete</span> Clear</button>` : ''}
      </div>
    </div>
  `);
}

function saveMockScoreFromModal(mockId) {
  const score = document.getElementById('mock-score-input').value;
  const notes = document.getElementById('mock-notes-input').value;
  if (!score) { showToast('Please enter a score! <span class="material-symbols-rounded icon-sm" style="color:var(--error-color);">warning</span>'); return; }
  saveMockScore(mockId, score, notes);
  closeModal();
  renderExams();
  showToast('Score saved! <span class="material-symbols-rounded icon-sm" style="color:var(--success-color);">check_circle</span>');
}

function clearMockScoreFromModal(mockId) {
  const scores = getMockScores();
  delete scores[mockId];
  saveState({ mockScores: scores });
  closeModal();
  renderExams();
  showToast('Score cleared! <span class="material-symbols-rounded icon-sm" style="color:var(--error-color);">delete</span>');
}


function renderScoreChart() {
  const canvas = document.getElementById('score-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scores = getMockScores();
  const subjects = ['DT', 'IDT', 'IBS'];
  const colors = { DT: '#0a84ff', IDT: '#34c759', IBS: '#ff9f0a' };
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  const styles = getComputedStyle(document.documentElement);
  ctx.strokeStyle = styles.getPropertyValue('--chart-grid').trim() || '#2a2e3a';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 20 + (i * 40);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(380, y);
    ctx.stroke();
    ctx.fillStyle = styles.getPropertyValue('--chart-label').trim() || '#666';
    ctx.font = '10px Inter';
    ctx.fillText((100 - i * 25), 10, y + 4);
  }
  
  // Labels
  ctx.fillStyle = styles.getPropertyValue('--chart-label').trim() || '#888';
  ctx.font = '11px Inter';
  DYNAMIC_DATA.mocks.forEach((series, i) => {
    const label = 'S' + (i + 1);
    ctx.fillText(label, 100 + i * 120, 195);
  });
  
  // Draw lines for each subject
  subjects.forEach(subj => {
    const points = [];
    DYNAMIC_DATA.mocks.forEach((series, sIdx) => {
      const mock = series.tests.find(m => m.subject === subj);
      if (mock && scores[mock.id]) {
        points.push({ x: 100 + sIdx * 120, y: 180 - (scores[mock.id].score / 100 * 160) });
      }
    });
    
    if (points.length > 1) {
      ctx.strokeStyle = colors[subj];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
    
    points.forEach(p => {
      ctx.fillStyle = colors[subj];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  
  // Legend
  let legendX = 60;
  subjects.forEach(subj => {
    ctx.fillStyle = colors[subj];
    ctx.fillRect(legendX, 5, 12, 12);
    ctx.fillStyle = styles.getPropertyValue('--chart-legend').trim() || '#ccc';
    ctx.font = '10px Inter';
    ctx.fillText(subj, legendX + 16, 15);
    legendX += 70;
  });
}

// ═══════════════════════════════════════════
//  TIMETABLE
// ═══════════════════════════════════════════
function renderSchedule() {
  const schedule = DYNAMIC_DATA.schedules[state.activeSchedule];
  
  const container = document.getElementById('schedule-slots-container');
  container.innerHTML = '';
  
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  
  const todayResult = computeDayAdherence(getTodayStr());
  const slotResultsMap = {};
  todayResult.slotResults.forEach(r => { slotResultsMap[r.slot.id] = r; });
  
  schedule.slots.forEach((slot, idx) => {
    const [startStr] = slot.startRange.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + slot.duration;
    const isActive = currentMin >= startMin && currentMin < endMin;
    const durationStr = slot.duration >= 60 ? (slot.duration / 60) + ' hrs' : slot.duration + ' min';
    
    container.innerHTML += `
      <div class="schedule-slot glass-card slot-type-${slot.type} ${isActive ? 'slot-active' : ''}">
        
        ${isActive && !isEditMode ? '<div class="active-indicator"><span class="material-symbols-rounded icon-sm">circle</span> NOW</div>' : ''}
        <div class="slot-header" style="flex:1; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="material-symbols-rounded slot-icon">${(slot.icon || "").trim()}</span>
            ${!isEditMode ? `<span class="slot-label">${slot.label}</span>` : `<input type="text" class="inline-input" value="${slot.label}" onchange="updateScheduleSlot('${state.activeSchedule}', ${idx}, 'label', this.value)">`}
          </div>
          ${(!isEditMode && slot.type === 'study' && slotResultsMap[slot.id]) ? (() => {
            const st = slotResultsMap[slot.id].status;
            if (st === 'done') return `<div class="cons-slot-status cons-status-done">${_svgCheck}</div>`;
            if (st === 'partial') return `<div class="cons-slot-status cons-status-partial">${_svgPartial}<span>${_fmtMins(slotResultsMap[slot.id].actualMin)}</span></div>`;
            if (st === 'upcoming') return `<div class="cons-slot-status cons-status-upcoming">${_svgUpcoming}<span>Upcoming</span></div>`;
            return `<div class="cons-slot-status cons-status-missed">${_svgPartial}<span>Missed</span></div>`;
          })() : ''}
        </div>
        <div class="slot-details" style="${isEditMode ? 'display:flex; flex-direction:column; gap:4px; margin-right:10px;' : ''}">
          ${!isEditMode ? `
          <span class="slot-range">Start between: ${slot.startRange}</span>
          <span class="slot-duration">Duration: ${durationStr}</span>
          ` : `
          <input type="text" class="inline-input time-input" value="${slot.startRange}" onchange="updateScheduleSlot('${state.activeSchedule}', ${idx}, 'startRange', this.value)" placeholder="Start Time">
          <input type="number" class="inline-input num-input" value="${slot.duration}" onchange="updateScheduleSlot('${state.activeSchedule}', ${idx}, 'duration', parseInt(this.value))" placeholder="Duration (min)">
          `}
        </div>
        ${isEditMode ? `
        <div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('${state.activeSchedule}', ${idx}, -1)" ${idx===0 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_up</span></button>
    <button class="move-btn" onclick="event.stopPropagation(); moveScheduleSlot('${state.activeSchedule}', ${idx}, 1)" ${idx===DYNAMIC_DATA.schedules[state.activeSchedule].slots.length-1 ? 'disabled' : ''}><span class="material-symbols-rounded">keyboard_arrow_down</span></button>
    <button class="delete-btn" onclick="deleteScheduleSlot('${state.activeSchedule}', ${idx})"><span class="material-symbols-rounded icon-sm">delete</span></button>
  </div>
` : ''}
      </div>
    `;
  });
  if (isEditMode) {
    container.innerHTML += `<button class="add-item-btn" onclick="addScheduleSlot('${state.activeSchedule}')">+ Add Slot</button>`;
  }
  
  // Study rules
  const rulesList = document.getElementById('study-rules-list');
  rulesList.innerHTML = DYNAMIC_DATA.schedules.rules.map(r => `<li>${r}</li>`).join('');
  refreshConsistencyData();
}

// ═══════════════════════════════════════════
//  CONSISTENCY ENGINE
// ═══════════════════════════════════════════

/** Ensure DYNAMIC_DATA.consistency exists with all required fields */
function ensureConsistencyInit() {
  if (!DYNAMIC_DATA.consistency) {
    DYNAMIC_DATA.consistency = {
      currentStreak: 0,
      longestStreak: 0,
      lastCountedDate: null,
      dailyLog: {}
    };
  }
  if (!DYNAMIC_DATA.consistency.dailyLog) DYNAMIC_DATA.consistency.dailyLog = {};
}

/** Parse "HH:MM" to total minutes since midnight. Returns null if invalid. */
function parseHHMM(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Compute adherence for a given date against the active schedule.
 * Returns { adherencePct, actualMinutes, targetMinutes, slotResults }
 */
function computeDayAdherence(dateStr) {
  const schedule = DYNAMIC_DATA.schedules[state.activeSchedule];
  if (!schedule) return { adherencePct: 0, actualMinutes: 0, targetMinutes: 0, slotResults: [] };

  const studySlots = schedule.slots.filter(s => s.type === 'study');
  const targetMinutes = studySlots.reduce((sum, s) => sum + (s.duration || 0), 0);

  const rows = (DYNAMIC_DATA.journalEntries && DYNAMIC_DATA.journalEntries[dateStr] &&
                DYNAMIC_DATA.journalEntries[dateStr].rows) || [];

  // Pre-convert rows to { startMin, durationMin }
  const rowData = rows.map(r => ({
    startMin: parseHHMM(r.startTime),
    durationMin: (parseInt(r.durHH) || 0) * 60 + (parseInt(r.durMM) || 0)
  })).filter(r => r.durationMin > 0);

  const slotResults = [];
  // Old data compatibility: Day's total adherence uses ALL logged minutes, regardless of startTime mapping
  let totalActual = rowData.reduce((sum, r) => sum + r.durationMin, 0);

  const todayStr = getTodayStr();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // 2-Pass Assignment to handle delayed starts gracefully
  const unassignedRows = [...rowData];
  const slotAssignments = studySlots.map(slot => ({ slot, actualMin: 0 }));

  // Pass 1: Strict matches (session started within the planned startRange)
  slotAssignments.forEach(assign => {
    const rangeParts = assign.slot.startRange.split('-');
    const rangeStart = parseHHMM(rangeParts[0]);
    const rangeEnd = parseHHMM(rangeParts[1]);
    if (rangeStart === null) return;
    const rangeEndMin = rangeEnd !== null ? rangeEnd : rangeStart + 60;

    for (let i = unassignedRows.length - 1; i >= 0; i--) {
      const r = unassignedRows[i];
      if (r.startMin !== null && r.startMin >= rangeStart && r.startMin < rangeEndMin) {
        assign.actualMin += r.durationMin;
        unassignedRows.splice(i, 1); // consume
      }
    }
  });

  // Pass 2: Broad matches (session started late, but within the duration of the slot)
  slotAssignments.forEach(assign => {
    const rangeParts = assign.slot.startRange.split('-');
    const rangeStart = parseHHMM(rangeParts[0]);
    if (rangeStart === null) return;
    const rangeEnd = parseHHMM(rangeParts[1]);
    const rangeEndMin = rangeEnd !== null ? rangeEnd : rangeStart + 60;
    const broadEnd = rangeEndMin + (assign.slot.duration || 60);
    const broadStart = rangeStart - 60; // Allow starting 1 hour early

    for (let i = unassignedRows.length - 1; i >= 0; i--) {
      const r = unassignedRows[i];
      if (r.startMin !== null && r.startMin >= broadStart && r.startMin < broadEnd) {
        assign.actualMin += r.durationMin;
        unassignedRows.splice(i, 1); // consume
      }
    }
  });

  slotAssignments.forEach(assign => {
    const slot = assign.slot;
    const actualMin = assign.actualMin;
    const rangeParts = slot.startRange.split('-');
    const rangeStart = parseHHMM(rangeParts[0]);

    if (rangeStart === null) {
      slotResults.push({ slot, status: 'missed', actualMin: 0 });
      return;
    }

    const pct = slot.duration > 0 ? actualMin / slot.duration : 0;
    let status;
    if (pct >= 0.8) status = 'done';
    else if (pct > 0) status = 'partial';
    else if (dateStr === todayStr && nowMin < rangeStart) status = 'upcoming';
    else status = 'missed';

    slotResults.push({ slot, status, actualMin });
  });

  const adherencePct = targetMinutes > 0 ? Math.round((totalActual / targetMinutes) * 100) : 0;
  return { adherencePct, actualMinutes: totalActual, targetMinutes, slotResults };
}

/**
 * Walk all dates in journalEntries, rebuild consistency.dailyLog,
 * recompute currentStreak and longestStreak.
 */
function refreshConsistencyData() {
  ensureConsistencyInit();
  const c = DYNAMIC_DATA.consistency;
  const journal = DYNAMIC_DATA.journalEntries || {};

  const allDates = Object.keys(journal).filter(d => {
    const entry = journal[d];
    return entry && entry.rows && entry.rows.length > 0;
  }).sort();

  allDates.forEach(dateStr => {
    const result = computeDayAdherence(dateStr);
    c.dailyLog[dateStr] = {
      adherencePct: result.adherencePct,
      actualMinutes: result.actualMinutes,
      targetMinutes: result.targetMinutes
    };
  });

  const todayStr = getTodayStr();
  if (!c.dailyLog[todayStr]) {
    const result = computeDayAdherence(todayStr);
    c.dailyLog[todayStr] = {
      adherencePct: result.adherencePct,
      actualMinutes: result.actualMinutes,
      targetMinutes: result.targetMinutes
    };
  }

  // Current streak: consecutive days ending yesterday/today with adherencePct >= 80
  let streak = 0;
  const base = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    const log = c.dailyLog[dStr];
    if (dStr === todayStr) {
      // Today: count if done, else skip (in-progress — don't break streak)
      if (log && log.adherencePct >= 80) streak++;
      continue;
    }
    if (log && log.adherencePct >= 80) {
      streak++;
    } else {
      break;
    }
  }
  c.currentStreak = streak;
  if (streak > (c.longestStreak || 0)) c.longestStreak = streak;
  c.lastCountedDate = todayStr;
}

/**
 * Compute syllabus completion projection.
 * Returns null if < 7 days of dailyLog data exist.
 */
function computeProjection() {
  ensureConsistencyInit();
  const c = DYNAMIC_DATA.consistency;
  const dailyLog = c.dailyLog || {};
  const logDates = Object.keys(dailyLog).sort();
  if (logDates.length < 7) return null;

  const journal = DYNAMIC_DATA.journalEntries || {};
  let totalLoggedMinutes = 0;
  Object.values(journal).forEach(entry => {
    if (entry && entry.rows) {
      entry.rows.forEach(r => {
        totalLoggedMinutes += (parseInt(r.durHH) || 0) * 60 + (parseInt(r.durMM) || 0);
      });
    }
  });
  const totalLoggedHours = totalLoggedMinutes / 60;
  const currentPct = calculateOverallProgress();
  
  if (currentPct <= 0 || totalLoggedHours <= 0) return null;

  const hoursPerPercent = totalLoggedHours / currentPct;
  
  const remainingHours = (100 - currentPct) * hoursPerPercent;

  // Calculate average daily minutes over the last 14 CALENDAR days
  let last14Min = 0;
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    last14Min += (dailyLog[dStr]?.actualMinutes || 0);
  }
  const avgDailyHours = (last14Min / 14) / 60;
  if (avgDailyHours <= 0.1) return null; // Avoid divide by zero, need at least minimal activity

  const daysNeeded = remainingHours / avgDailyHours;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + Math.round(daysNeeded));

  let examDate = new Date(DYNAMIC_DATA.exam.date);
  if (DYNAMIC_DATA.finalExams && DYNAMIC_DATA.finalExams.length > 0) {
    const dates = DYNAMIC_DATA.finalExams.map(x => new Date(x.date)).filter(d => !isNaN(d.valueOf()));
    if (dates.length > 0) examDate = new Date(Math.min(...dates));
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysVsExam = Math.round((examDate - projectedDate) / msPerDay);
  const daysUntilExamVal = Math.round((examDate - new Date()) / msPerDay);
  const onTrack = daysVsExam >= 0;

  let nudgeHours = null;
  if (!onTrack && daysUntilExamVal > 0) {
    const requiredDaily = remainingHours / daysUntilExamVal;
    nudgeHours = Math.round((requiredDaily - avgDailyHours) * 10) / 10;
    if (nudgeHours < 0.1) nudgeHours = 0.1;
  }

  return {
    projectedDate,
    daysVsExam: Math.abs(daysVsExam),
    onTrack,
    nudgeHours,
    avgDailyHours: Math.round(avgDailyHours * 10) / 10
  };
}

function switchSchedule(type) {
  state.activeSchedule = type;
  document.getElementById('btn-early').classList.toggle('active', type === 'earlyMorning');
  document.getElementById('btn-late').classList.toggle('active', type === 'lateNight');
  saveState({ activeSchedule: type });
  renderSchedule();
  updateNotifToggleUI();
}

// ─── Consistency UI helpers ──────────────────────────────
const _svgCheck = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--success)" stroke-width="1.8"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const _svgPartial = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--warning)" stroke-width="1.8"/><path d="M12 8v5" stroke="var(--warning)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="var(--warning)"/></svg>`;
const _svgUpcoming = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--text-muted)" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const _svgTrendUp = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 17l6-6 4 4 8-8" stroke="var(--success)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7h6v6" stroke="var(--success)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const _svgWarn = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="var(--warning)" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5" stroke="var(--warning)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="var(--warning)"/></svg>`;
const _svgStar = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" fill="var(--primary)"/></svg>`;
const _svgWarnSm = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="var(--warning)" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5" stroke="var(--warning)" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="var(--warning)"/></svg>`;
const _svgBook = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13z" stroke="currentColor" stroke-width="1.8"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13z" stroke="currentColor" stroke-width="1.8"/></svg>`;

function _fmtMins(m) {
  const h = Math.floor(m / 60), mm = m % 60;
  if (h === 0) return mm + 'm';
  return h + 'h ' + (mm > 0 ? mm + 'm' : '');
}

/**
 * Render (or update) the compact Consistency widget on the Home tab.
 * The widget lives in #consistency-home-widget which is injected into index.html.
 */
function updateConsistencyWidget() {
  const el = document.getElementById('consistency-home-widget');
  if (!el) return;

  ensureConsistencyInit();
  const c = DYNAMIC_DATA.consistency;
  const todayStr = getTodayStr();
  const todayResult = computeDayAdherence(todayStr);
  const proj = computeProjection();
  const schedName = state.activeSchedule === 'earlyMorning' ? 'Early Morning' : 'Late Night';
  const adherePct = Math.min(todayResult.adherencePct, 100);
  const isGood = adherePct >= 80;

  const logDatesCount = Object.keys(c.dailyLog || {}).length;
  const currentPct = calculateOverallProgress();
  const showPace = (logDatesCount >= 7 && currentPct >= 10 && proj);

  // Pace pill
  let pillClass, pillIcon, pillLabel;
  if (!showPace) {
    pillClass = 'cons-pill-on';
    pillIcon = '<span class="material-symbols-rounded" style="font-size:14px; margin-right:4px;">hourglass_empty</span>';
    pillLabel = 'Building Profile';
  } else {
    pillClass = proj.onTrack ? 'cons-pill-on' : 'cons-pill-warn';
    pillIcon = proj.onTrack ? _svgStar : _svgWarnSm;
    pillLabel = proj.onTrack ? 'Exam-Ready Pace' : 'Behind Pace';
  }

  // Insight card
  let insightHtml = '';
  if (!showPace) {
    insightHtml = `<div class="cons-insight" style="background:transparent; border:1px dashed var(--glass-border); align-items:center;"><span class="material-symbols-rounded" style="color:var(--text-muted); font-size:18px;">hourglass_empty</span><p style="color:var(--text-muted); font-size:11.5px;">Building your pace profile &mdash; check back after a bit more progress.</p></div>`;
  } else {
    if (proj.onTrack) {
      insightHtml = `<div class="cons-insight cons-insight-good">${_svgTrendUp}<p>At this pace, your <b>syllabus</b> completes <b>${proj.daysVsExam} days before</b> your exam date.</p></div>`;
    } else {
      const nudgeStr = proj.nudgeHours !== null ? `<span class="cons-nudge">Increase daily average by ~${proj.nudgeHours} hrs to get back on track.</span>` : '';
      insightHtml = `<div class="cons-insight cons-insight-warn">${_svgWarn}<p>At this pace, syllabus completes <b>${proj.daysVsExam} days after</b> your exam date.${nudgeStr}</p></div>`;
    }
  }

  el.innerHTML = `
    <div class="cons-hw-top">
      <div>
        <div class="cons-pill ${pillClass}">${pillIcon}${pillLabel}</div>
        <div class="cons-streak-num">${c.currentStreak}<span>days consistent</span></div>
      </div>
      <div class="cons-best">Longest run<b>${c.longestStreak}</b></div>
    </div>
    <div class="cons-divider"></div>
    <div class="cons-adhere-row">
      <span class="cons-adhere-label">Today's Adherence</span>
      <span class="cons-adhere-val ${isGood ? 'cons-val-good' : 'cons-val-warn'}">${adherePct}%</span>
    </div>
    <div class="cons-bar-track"><div class="cons-bar-fill ${isGood ? 'cons-fill-primary' : 'cons-fill-warn'}" style="width:${adherePct}%"></div></div>
    <div class="cons-sub">${_fmtMins(todayResult.actualMinutes)} of ${_fmtMins(todayResult.targetMinutes)} · ${schedName} routine</div>
    ${insightHtml}
  `;
}



let lastNotifiedTime = '';

window.toggleNotifications = function() {
  if (state.activeNotificationSchedule === state.activeSchedule) {
    state.activeNotificationSchedule = null;
    saveState({ activeNotificationSchedule: null });
    updateNotifToggleUI();
    if (window.Capacitor) scheduleNativeAlarms(null);
  } else {
    const schedName = state.activeSchedule === 'earlyMorning' ? 'Early Morning' : 'Late Night';
    
    if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
      window.Capacitor.Plugins.LocalNotifications.requestPermissions().then(perm => {
        if (perm.display === 'granted') {
          state.activeNotificationSchedule = state.activeSchedule;
          saveState({ activeNotificationSchedule: state.activeSchedule });
          updateNotifToggleUI();
          scheduleNativeAlarms(state.activeSchedule);
          alert("Alerts are ON for " + schedName + ".");
        } else {
          alert("Notifications are blocked in your phone settings! Please allow notifications to use this feature.");
        }
      }).catch(err => {
        alert("Error requesting permissions: " + err);
      });
    } else if ("Notification" in window) {
      if (Notification.permission === "granted") {
        state.activeNotificationSchedule = state.activeSchedule;
        saveState({ activeNotificationSchedule: state.activeSchedule });
        updateNotifToggleUI();
        fireNotification("Notifications Enabled! 🚀", "Alerts are ON for " + schedName + ".");
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            state.activeNotificationSchedule = state.activeSchedule;
            saveState({ activeNotificationSchedule: state.activeSchedule });
            updateNotifToggleUI();
            fireNotification("Notifications Enabled! 🚀", "Alerts are ON for " + schedName + ".");
          }
        });
      } else {
        alert("Notifications are blocked in your browser! Please allow notifications in site settings to use this feature.");
      }
    } else {
      alert("Your browser does not support notifications.");
    }
  }
};

window.updateNotifToggleUI = function() {
  const toggle = document.getElementById('notif-toggle-switch');
  const iconBg = document.getElementById('notif-icon-bg');
  const icon = document.getElementById('notif-icon');
  const txt = document.getElementById('notif-text');
  if(!toggle) return;
  
  const isEnabled = state.activeNotificationSchedule === state.activeSchedule;
  toggle.checked = isEnabled;
  
  const schedName = state.activeSchedule === 'earlyMorning' ? 'Early Morning' : 'Late Night';
  if (isEnabled) {
    iconBg.style.background = 'rgba(52,199,89,0.1)';
    iconBg.style.color = 'var(--success-color)';
    icon.textContent = 'notifications_active';
    txt.textContent = 'Active for ' + schedName;
  } else {
    iconBg.style.background = 'rgba(255,255,255,0.05)';
    iconBg.style.color = 'var(--text-secondary)';
    icon.textContent = 'notifications_off';
    txt.textContent = 'Turn ON for ' + schedName;
  }
};

async function scheduleNativeAlarms(scheduleId) {
  if (!window.Capacitor || !window.Capacitor.Plugins.LocalNotifications) return;
  const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
  
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    if (!scheduleId) return;

    const scheduleData = DYNAMIC_DATA.schedules && DYNAMIC_DATA.schedules[scheduleId];
    if (!scheduleData || !scheduleData.slots) return;

    const notificationsToSchedule = [];
    let idCounter = 1;

    scheduleData.slots.forEach(slot => {
      if (!slot.startRange) return;
      const startStr = slot.startRange.split('-')[0].trim();
      const [hhStr, mmStr] = startStr.split(':');
      const hh = parseInt(hhStr, 10);
      const mm = parseInt(mmStr, 10);
      
      if (!isNaN(hh) && !isNaN(mm)) {
        notificationsToSchedule.push({
          id: idCounter++,
          title: "CA Study Tracker",
          body: `Time for: ${slot.label}`,
          schedule: {
            on: { hour: hh, minute: mm },
            allowWhileIdle: true
          }
        });
      }
    });

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
    }
  } catch (e) {
    console.error("Native scheduling failed", e);
  }
}

function fireNotification(title, body) {
  if (!("Notification" in window)) return;
  const options = {
    body: body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200]
  };

  if (Notification.permission === "granted") {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function(registration) {
        try {
          registration.showNotification(title, options).catch(e => {
            console.error("SW Notification failed, fallback to default", e);
            new Notification(title, options);
          });
        } catch(e) {
          new Notification(title, options);
        }
      }).catch(e => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  }
}

function checkScheduleNotifications() {
  if (!state.activeNotificationSchedule) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;
  
  if (lastNotifiedTime === currentTime) return;
  
  const scheduleData = DYNAMIC_DATA.schedules && DYNAMIC_DATA.schedules[state.activeNotificationSchedule];
  if (!scheduleData || !scheduleData.slots) return;
  
  scheduleData.slots.forEach(slot => {
    if (!slot.startRange) return;
    const startStr = slot.startRange.split('-')[0].trim();
    if (currentTime === startStr) {
      fireNotification("CA Study Tracker", `Time for: ${slot.label}`);
      lastNotifiedTime = currentTime;
    }
  });
}

// ═══════════════════════════════════════════
//  CALENDAR PLANNER
// ═══════════════════════════════════════════
function renderPlanner() {
  renderPlannerMockReminder();
  renderMiniCalendar();
  renderPlannerDay();
}

function renderPlannerMockReminder() {
  const nextMock = getNextMock();
  const el = document.getElementById('planner-mock-reminder');
  if (nextMock) {
    const days = daysUntil(nextMock.date);
    el.innerHTML = `<span class="pmr-icon"><span class="material-symbols-rounded icon-sm">track_changes</span></span> Next mock: <strong>${nextMock.subject}</strong> in <strong>${days} days</strong> (${formatDate(nextMock.date)})`;
    el.className = 'planner-mock-reminder glass-card' + (days <= 3 ? ' urgent' : '');
  } else {
    el.innerHTML = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle; color:var(--success-color);">task_alt</span> All mock tests done!';
  }
}

function renderMiniCalendar() {
  const date = state.calendarMonth;
  const year = date.getFullYear();
  const month = date.getMonth();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  document.getElementById('cal-month-label').textContent = months[month] + ' ' + year;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  
  const tasks = getPlannerTasks();
  let html = '';
  
  for (let i = 0; i < startDay; i++) {
    html += '<span class="cal-day empty"></span>';
  }
  
  // Build set of important dates for highlighting
  const mockDates = new Set();
  const examDates = new Set();
  DYNAMIC_DATA.mocks.flatMap(s => s.tests).forEach(m => mockDates.add(m.date));
  DYNAMIC_DATA.finalExams.forEach(e => examDates.add(e.date));
  
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayTasks = tasks[key] || [];
    const done = dayTasks.filter(t => t.done).length;
    const total = dayTasks.length;
    let dotClass = '';
    if (total > 0) {
      dotClass = done === total ? 'day-green' : (done > 0 ? 'day-yellow' : 'day-grey');
    }
    // Highlight mock test and exam dates
    const isMockDay = mockDates.has(key);
    const isExamDay = examDates.has(key);
    const mockClass = isMockDay ? 'day-mock' : '';
    const examClass = isExamDay ? 'day-exam' : '';
    const todayClass = isToday(new Date(year, month, d)) ? 'today' : '';
    const selectedClass = dateKey(state.plannerDate) === key ? 'selected' : '';
    
    // Get tooltip for special days
    let tooltip = '';
    if (isMockDay) {
      const mock = DYNAMIC_DATA.mocks.flatMap(s => s.tests).find(m => m.date === key);
      tooltip = `Mock: ${mock.subject}`;
    }
    if (isExamDay) {
      const exam = DYNAMIC_DATA.finalExams.find(e => e.date === key);
      tooltip = `EXAM: ${exam.subject}`;
    }
    
    html += `<span class="cal-day ${dotClass} ${mockClass} ${examClass} ${todayClass} ${selectedClass}" onclick="selectPlannerDay(${year}, ${month}, ${d})" title="${tooltip}">${d}</span>`;
  }
  
  document.getElementById('cal-days').innerHTML = html;
}

function changeMonth(delta) {
  state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + delta, 1);
  renderMiniCalendar();
}

function selectPlannerDay(year, month, day) {
  state.plannerDate = new Date(year, month, day);
  renderPlanner();
}

function changePlannerDay(delta) {
  state.plannerDate = new Date(state.plannerDate.getTime() + delta * 24 * 60 * 60 * 1000);
  state.calendarMonth = new Date(state.plannerDate);
  renderPlanner();
}

function renderPlannerDay() {
  const date = state.plannerDate;
  const label = isToday(date) ? 'Today — ' + formatDateFull(date) : formatDateFull(date);
  document.getElementById('planner-day-label').textContent = label;
  
  const tasks = getPlannerTasks();
  const key = dateKey(date);
  const dayTasks = tasks[key] || [];
  
  const primary = dayTasks.filter(t => t.category === 'primary');
  const secondary = dayTasks.filter(t => t.category === 'secondary');
  const quick = dayTasks.filter(t => t.category !== 'primary' && t.category !== 'secondary');
  
  document.getElementById('planner-primary-tasks').innerHTML = renderPlannerTaskList(primary, key);
  document.getElementById('planner-secondary-tasks').innerHTML = renderPlannerTaskList(secondary, key);
  document.getElementById('planner-quick-tasks').innerHTML = renderPlannerTaskList(quick, key);
}

function renderPlannerTaskList(tasks, dayKey) {
  if (tasks.length === 0) return '<div class="empty-tasks">No tasks yet — tap "+ Add Task"</div>';
  
  return tasks.map((task, idx) => `
    <div class="planner-task ${task.done ? 'task-done' : ''}" onclick="togglePlannerTask('${dayKey}', ${task.originalIndex})">
      <span class="task-check">${task.done ? '<span class="material-symbols-rounded icon-sm">check_box</span>' : '<span class="material-symbols-rounded icon-sm">check_box_outline_blank</span>'}</span>
      <div class="task-info">
        <div class="task-name">${task.name}</div>
        ${task.subject ? '<div class="task-subject">' + task.subject + '</div>' : ''}
      </div>
      <button class="task-delete" onclick="event.stopPropagation(); deletePlannerTask('${dayKey}', ${task.originalIndex})"><span class="material-symbols-rounded icon-sm">delete</span></button>
    </div>
  `).join('');
}

function togglePlannerTask(dayKey, taskIndex) {
  const tasks = getPlannerTasks();
  if (tasks[dayKey] && tasks[dayKey][taskIndex]) {
    const task = tasks[dayKey][taskIndex];
    task.done = !task.done;
    
    // Auto-sync to syllabus
    if (task.chapterId && task.activityType) {
      const progress = getSyllabusProgress();
      if (!progress[task.chapterId]) progress[task.chapterId] = {};
      progress[task.chapterId][task.activityType] = task.done;
      saveSyllabusProgress(progress);
    }
    
    savePlannerTasks(tasks);
    renderPlanner();
  }
}

function deletePlannerTask(dayKey, taskIndex) {
  const tasks = getPlannerTasks();
  if (tasks[dayKey]) {
    tasks[dayKey].splice(taskIndex, 1);
    // Re-index
    tasks[dayKey].forEach((t, i) => t.originalIndex = i);
    savePlannerTasks(tasks);
    renderPlanner();
    showToast('Task deleted! <span class="material-symbols-rounded icon-sm">delete</span>');
  }
}

function openAddTaskModal() {
  const flattenSubjects = (list) => {
    let res = [];
    (list || []).forEach(s => {
      if (s.type === 'folder' && s.children) res = res.concat(s.children);
      else res.push(s);
    });
    return res;
  };
  const subjects = flattenSubjects(DYNAMIC_DATA.syllabusSubjects).map(s => ({ value: s.id, label: s.name }));
  
  openModal('<span class="material-symbols-rounded icon-sm">add</span> Add Task', '<div class="form-group"><label>Date</label><input type="date" id="task-date" value="' + dateKey(state.plannerDate) + '"></div><div class="form-group"><label>Category</label><select id="task-category" onchange="onTaskCategoryChange()"><option value="primary">Primary Subject</option><option value="secondary">Secondary Subject</option><option value="quick">Quick Task</option></select></div><div id="task-study-fields"><div class="form-group"><label>Subject</label><select id="task-subject" onchange="onTaskSubjectChange()"><option value="">— Select —</option>' + subjects.map(s => '<option value="' + s.value + '">' + s.label + '</option>').join('') + '</select></div><div class="form-group" id="task-chapter-group" style="display:none;"><label>Chapter</label><select id="task-chapter" onchange="onTaskChapterChange()"><option value="">— Select —</option></select></div><div class="form-group" id="task-activity-group" style="display:none;"><label>Activity</label><select id="task-activity" onchange="onTaskChapterChange()"><option value="">— Select —</option><option value="conceptBook">Book (Concepts)</option><option value="questionBank">Question Bank</option><option value="revisionVideo">Revision Video</option></select></div></div><div class="form-group"><label>Task Description</label><input type="text" id="task-name" placeholder="e.g. Complete pending questions"></div><button class="btn-primary" onclick="addPlannerTask()">Add Task <span class="material-symbols-rounded icon-sm">check_circle</span></button>');
}

window.onTaskCategoryChange = function() {
  const cat = document.getElementById('task-category').value;
  const fields = document.getElementById('task-study-fields');
  if (fields) {
    if (cat === 'quick') {
      fields.style.display = 'none';
    } else {
      fields.style.display = 'block';
    }
  }
};

function onTaskSubjectChange() {
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
      chapters.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');
      
    if (subjectObj && (subjectObj.type === 'ibs' || subj.toLowerCase().startsWith('ibs-'))) {
      activityGroup.style.display = 'none';
    } else {
      activityGroup.style.display = 'block';
    }
  } else {
    chapterGroup.style.display = 'none';
    activityGroup.style.display = 'none';
  }
}

function onTaskChapterChange() {
  const chapterSelect = document.getElementById('task-chapter');
  const chapterId = chapterSelect.value;
  const chapterName = chapterSelect.options[chapterSelect.selectedIndex]?.text;
  
  const activitySelect = document.getElementById('task-activity');
  const activity = activitySelect.value;
  const activityName = activitySelect.options[activitySelect.selectedIndex]?.text;
  
  const taskName = document.getElementById('task-name');
  
  if (chapterId) {
    // Strip emojis for cleaner task name
    const cleanActivity = activityName ? activityName.replace(/[^a-zA-Z\\s\\(\\)]/g, '').trim() : '';
    taskName.value = chapterName + (cleanActivity ? ` — ${cleanActivity}` : '');
  }
}

function addPlannerTask() {
  const name = document.getElementById('task-name').value.trim();
  const category = document.getElementById('task-category').value;
  const subject = document.getElementById('task-subject').value;
  
  const chapterId = document.getElementById('task-chapter') ? document.getElementById('task-chapter').value : '';
  let activityType = document.getElementById('task-activity') ? document.getElementById('task-activity').value : '';
  
  // For IBS subjects (no activity dropdown), implicitly set activity to 'done'
  if (subject && subject.toLowerCase().startsWith('ibs-') && chapterId) {
    activityType = 'done';
  }
  
  if (category !== 'quick') {
    if (!subject) { showToast('Please select a Subject! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
    if (!chapterId) { showToast('Please select a Chapter! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
    if (!activityType) { showToast('Please select an Activity! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
  } else {
    // If it's a quick task, clear out subject/chapter/activity if any were selected before changing category
    document.getElementById('task-subject').value = '';
    if (document.getElementById('task-chapter')) document.getElementById('task-chapter').value = '';
    if (document.getElementById('task-activity')) document.getElementById('task-activity').value = '';
  }
  
  if (!name) { showToast('Please enter a task name! <span class="material-symbols-rounded icon-sm">warning</span>'); return; }
  
  const tasks = getPlannerTasks();
  const key = dateKey(state.plannerDate);
  if (!tasks[key]) tasks[key] = [];
  
  tasks[key].push({
    name,
    category,
    subject,
    chapterId,
    activityType,
    done: false,
    originalIndex: tasks[key].length
  });
  
  savePlannerTasks(tasks);
  closeModal();
  renderPlanner();
  showToast('Task added! <span class="material-symbols-rounded icon-sm">check_circle</span>');
}

function copyToTomorrow() {
  const tasks = getPlannerTasks();
  const todayKey = dateKey(state.plannerDate);
  const tomorrowDate = new Date(state.plannerDate.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowKey = dateKey(tomorrowDate);
  
  const todayTasks = tasks[todayKey] || [];
  if (todayTasks.length === 0) { showToast('No tasks to copy! Add tasks first.'); return; }
  
  tasks[tomorrowKey] = todayTasks.map((t, i) => ({ ...t, done: false, originalIndex: i }));
  savePlannerTasks(tasks);
  showToast('Copied to tomorrow!');
}

// ═══════════════════════════════════════════
//  SYLLABUS TRACKER
// ═══════════════════════════════════════════
function renderSyllabus() {
  if (state.syllabusView === 'detail' && state.activeSubject) {
    renderSyllabusDetail(state.activeSubject);
  } else {
    showSubjectsList();
  }
}

function showSubjectsList() {
  state.syllabusView = 'list';
  document.getElementById('syllabus-detail').style.display = 'none';
  
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
      return '<div class="subject-folder" data-idx="' + idx + '" style="margin-bottom:12px;">' +
        '<div class="subject-card glass-card folder-header" onclick="toggleFolder(\'' + subj.id + '\')" style="cursor:pointer; display:flex; align-items:center;">' +
          '' +
          '<div class="subj-info" style="flex: 1">' +
            (!isEditMode ? 
              '<div class="subj-name" style="font-weight:700; color:var(--primary-color)"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:4px;">folder</span> ' + subj.name + '</div>' +
              '<div class="subj-source">' + (subj.source || '') + '</div>'
            : 
              '<div class="subj-name"><input type="text" class="inline-input" value="' + subj.name.replace(/"/g, '&quot;') + '" onclick="event.stopPropagation()" onchange="updateSyllabusSubject(' + idx + ', this.value, null)"></div>'
            ) +
          '</div>' +
          (!isEditMode ? 
            '<div class="subj-progress"><span class="subj-pct">' + p + '%</span><div class="stat-bar"><div class="stat-bar-fill" style="width:' + p + '%"></div></div></div>' +
            '<span class="subj-arrow material-symbols-rounded" id="arrow-' + subj.id + '" style="margin-left:8px; font-size:20px;">expand_more</span>'
          : 
            '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
            '<button class="move-btn" onclick="event.stopPropagation(); toggleFolder(\'' + subj.id + '\')" title="Expand/Collapse"><span class="material-symbols-rounded" id="arrow-' + subj.id + '">expand_more</span></button>' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
            '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', 1)" ' + (idx === DYNAMIC_DATA.syllabusSubjects.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
            '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + idx + ', null)"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
          '</div>'
          ) +
        '</div>' +
        '<div class="folder-content" id="folder-' + subj.id + '" style="display: none; padding-left: 20px; border-left: 2px solid var(--border-color); margin-left: 10px; margin-top: 8px;">' +
          subj.children.map((child, cIdx) => renderSubjectCard(child, cIdx, idx)).join('') +
        '</div>';
    }
    
    return '<div class="subject-card glass-card ' + (!isNested ? 'draggable-item' : '') + '" style="' + (isNested ? 'margin-bottom:8px;' : '') + '" >' +
      (!isNested ? '' : '') +
      '<div class="subj-info" onclick="openSubjectDetail(\'' + subj.id + '\', \'' + subj.type + '\')" style="cursor:pointer; flex: 1">' +
        (!isEditMode ? 
          '<div class="subj-name"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:4px;">menu_book</span> ' + subj.name + '</div>' +
          '<div class="subj-source">' + (subj.source || '') + '</div>'
        : 
          '<div class="subj-name"><input type="text" class="inline-input" value="' + subj.name.replace(/"/g, '&quot;') + '" onclick="event.stopPropagation()" onchange="updateSyllabusSubject(' + (isNested ? parentIdx : idx) + ', this.value, ' + (isNested ? idx : 'null') + ')"></div>'
        ) +
      '</div>' +
      (!isEditMode ? 
      '<div class="subj-progress"><span class="subj-pct">' + p + '%</span><div class="stat-bar"><div class="stat-bar-fill" style="width:' + p + '%"></div></div></div>' +
      '<span class="subj-arrow">▶</span>'
      : 
      '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); openSubjectDetail(\'' + subj.id + '\', \'' + subj.type + '\')" title="Open Subject"><span class="material-symbols-rounded">arrow_forward</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', 1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === (isNested ? DYNAMIC_DATA.syllabusSubjects[parentIdx].children.length - 1 : DYNAMIC_DATA.syllabusSubjects.length - 1) ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusSubject(' + (isNested ? parentIdx : idx) + ', ' + (isNested ? idx : 'null') + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>'
      ) +
    '</div>';
  };
  
  container.innerHTML = subjects.map((subj, idx) => renderSubjectCard(subj, idx, null)).join('');
  
  if (isEditMode) {
    container.innerHTML += '<button class="add-item-btn" onclick="addSyllabusSubject()">+ Add Subject</button>';
  }
}

function openSubjectDetail(key, type) {
  state.syllabusView = 'detail';
  state.activeSubject = { key, type };
  document.getElementById('syllabus-subjects-list').style.display = 'none';
  document.getElementById('syllabus-detail').style.display = 'block';
  renderSyllabusDetail({ key, type });
}

function renderSyllabusDetail(subject) {
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
        return '<div class="st-row ' + (isEditMode ? 'is-edit' : '') + '">' +
          '' +
          (!isEditMode ? '<span class="st-num">' + (idx + 1) + '</span><div class="st-name">' + ch.name + '</div>' : 
            '<div class="st-name" style="flex:1; margin-right: 10px;">' +
              '<input type="text" class="inline-input" value="' + ch.name.replace(/"/g, '&quot;') + '" onclick="event.stopPropagation()" onchange="updateSyllabusChapter(\'' + key + '\', ' + idx + ', this.value)">' +
            '</div>'
          ) +
          (!isEditMode ? 
          '<span class="st-check"><input type="checkbox" ' + (chProgress.conceptBook ? 'checked' : '') + ' onchange="toggleSyllabusCheck(\'' + ch.id + '\', \'conceptBook\', this.checked)"></span>' +
          '<span class="st-check"><input type="checkbox" ' + (chProgress.questionBank ? 'checked' : '') + ' onchange="toggleSyllabusCheck(\'' + ch.id + '\', \'questionBank\', this.checked)"></span>' +
          '<span class="st-check"><input type="checkbox" ' + (chProgress.revisionVideo ? 'checked' : '') + ' onchange="toggleSyllabusCheck(\'' + ch.id + '\', \'revisionVideo\', this.checked)"></span>' 
          : 
          '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\'' + key + '\', ' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\'' + key + '\', ' + idx + ', 1)" ' + (idx === chapters.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\'' + key + '\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>'
          ) +
        '</div>';
      }).join('') +
    '</div>';
    
    if (isEditMode) {
      contentEl.innerHTML += '<button class="add-item-btn" onclick="addSyllabusChapter(\'' + key + '\')">+ Add Chapter</button>';
    }
  } else {
    // IBS: Simple checkbox
    contentEl.innerHTML = '<div class="syllabus-simple">' +
      chapters.map((ch, idx) => {
        const isDone = progress[ch.id]?.done || false;
        return '<div class="ss-row ' + (isDone ? 'done' : '') + '" ' + (!isEditMode ? 'onclick="toggleIbsCheck(\'' + ch.id + '\')"' : '') + '>' +
          '' +
          '<span class="ss-check">' + (isDone ? '<span class="material-symbols-rounded icon-sm">check_box</span>' : '<span class="material-symbols-rounded icon-sm">check_box_outline_blank</span>') + '</span>' +
          '<span class="ss-num">' + (!isEditMode ? (idx + 1) + '.' : '') + '</span>' +
          (!isEditMode ? '<span class="ss-name" style="flex:1">' + ch.name + '</span>' : 
          '<div class="ss-name" style="flex:1; margin-right:10px;">' +
            '<input type="text" class="inline-input" value="' + ch.name.replace(/"/g, '&quot;') + '" onclick="event.stopPropagation()" onchange="updateSyllabusChapter(\'' + key + '\', ' + idx + ', this.value)">' +
          '</div>' +
          '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\'' + key + '\', ' + idx + ', -1)" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +
      '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusChapter(\'' + key + '\', ' + idx + ', 1)" ' + (idx === chapters.length - 1 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_down</span></button>' +
      '<button class="delete-btn" onclick="event.stopPropagation(); deleteSyllabusChapter(\'' + key + '\', ' + idx + ')"><span class="material-symbols-rounded icon-sm">delete</span></button>' +
  '</div>'
          ) +
        '</div>';
      }).join('') +
    '</div>';
    
    if (isEditMode) {
      contentEl.innerHTML += '<button class="add-item-btn" onclick="addSyllabusChapter(\'' + key + '\')">+ Add Chapter</button>';
    }
  }
}

function toggleSyllabusCheck(chapterId, field, checked) {
  const progress = getSyllabusProgress();
  if (!progress[chapterId]) progress[chapterId] = {};
  progress[chapterId][field] = checked;
  saveSyllabusProgress(progress);
  
  // Update progress display without full re-render
  const pct = calculateSubjectProgress(state.activeSubject.key, state.activeSubject.type);
  const headerEl = document.getElementById('syllabus-detail-header');
  const barEl = headerEl.querySelector('.stat-bar-fill');
  const pctEl = headerEl.querySelector('.detail-progress span');
  if (barEl) barEl.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '% done';
}

function toggleIbsCheck(chapterId) {
  const progress = getSyllabusProgress();
  if (!progress[chapterId]) progress[chapterId] = {};
  progress[chapterId].done = !progress[chapterId].done;
  saveSyllabusProgress(progress);
  renderSyllabusDetail(state.activeSubject);
}

// ─── Progress Calculation ───────────────
function calculateSubjectProgress(key, type) {
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
}

function calculateOverallProgress() {
  if (!DYNAMIC_DATA.syllabusSubjects || DYNAMIC_DATA.syllabusSubjects.length === 0) return 0;
  
  let totalWeight = 0, weightedSum = 0;
  DYNAMIC_DATA.syllabusSubjects.forEach(s => {
    const pct = calculateSubjectProgress(s.id, s.type);
    const weight = s.type === 'main' ? 3 : 1;
    weightedSum += pct * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ═══════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════
function init() {
  // Initialize Themes
  initTheme();
  
  // Load dynamic data
  loadDynamicData();
  smartRepairSyllabusData();
  
  // Load saved schedule preference
  const saved = loadState();
  if (saved.activeSchedule) state.activeSchedule = saved.activeSchedule;
  if (saved.activeNotificationSchedule !== undefined) state.activeNotificationSchedule = saved.activeNotificationSchedule;
  
  // Render initial tab (updates UI state properly)
  switchTab(state.activeTab);
  updateNotifToggleUI();
  
  // Start countdown timer
  setInterval(updateCountdown, 1000);
  
  // Update current activity every minute
  setInterval(() => {
    updateCurrentActivity();
    checkScheduleNotifications();
  }, 60000);
  
  performDailyBackup(); // Auto-save daily backup
}

function performDailyBackup() {
  const today = getTodayStr();
  const lastBackup = localStorage.getItem('ca_last_backup_date');
  if (lastBackup !== today) {
    try {
      const rawData = localStorage.getItem(getStorageKey());
      const parsedTracker = JSON.parse(rawData || '{}');
      
      // Prevent overwriting a good backup with empty data (e.g. before cloud sync completes)
      if (Object.keys(parsedTracker).length === 0) {
        return; // Try again later when data is populated
      }
      
      const dataToBackup = {
        trackerData: parsedTracker,
        dynamicData: DYNAMIC_DATA
      };
      localStorage.setItem('ca_app_daily_backup_' + today, JSON.stringify(dataToBackup));
      localStorage.setItem('ca_last_backup_date', today);
      
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(k => k.startsWith('ca_app_daily_backup_')).sort();
      if (backupKeys.length > 7) {
        const keysToDelete = backupKeys.slice(0, backupKeys.length - 7);
        keysToDelete.forEach(k => localStorage.removeItem(k));
      }
      
      console.log("Daily local backup created successfully for " + today);
    } catch (e) {
      console.error("Failed to create daily backup:", e);
    }
  }
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init);

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });

}

// ═══════════════════════════════════════════
//  MENU, THEMES & DATA SHARING
// ═══════════════════════════════════════════
window.editCustomUsername = function() {
  const email = window.loggedUserEmail;
  if (!email) return alert("Please login first to edit your account name!");
  const curr = typeof window.getDisplayUsername === 'function' ? window.getDisplayUsername(email) : email.split('@')[0];
  const newName = prompt("Enter custom display name for account (" + email + "):", curr);
  if (newName !== null && newName.trim() !== "") {
    if (!DYNAMIC_DATA.customUsernames) DYNAMIC_DATA.customUsernames = {};
    const safeEmail = email.replace(/\./g, ','); // Firebase doesn't allow '.' in keys
    DYNAMIC_DATA.customUsernames[safeEmail] = newName.trim();
    saveDynamicData();
    if (typeof window.updateUserBadge === 'function') window.updateUserBadge();
    openMenuModal();
  }
};

window.openBackupModal = function() {
  closeModal(); // Close the main menu first
  
  const allKeys = Object.keys(localStorage);
  const backupKeys = allKeys.filter(k => k.startsWith('ca_app_daily_backup_')).sort().reverse();
  
  let backupOptions = backupKeys.map(k => {
    const dateStr = k.replace('ca_app_daily_backup_', '');
    return `<option value="${dateStr}">${dateStr}</option>`;
  }).join('');
  
  if (backupOptions === '') {
    backupOptions = '<option value="">No backups available</option>';
  }
  
  openModal('<div style="display:flex; align-items:center; gap:10px;"><button class="back-arrow-btn" onclick="openMenuModal()" title="Back to Menu"><span class="material-symbols-rounded" style="font-size:18px;">arrow_back</span></button><span>Data &amp; Backups</span></div>', `
    <div style="display:flex; flex-direction:column; gap:12px;">
      
      <div class="menu-section-tag" style="margin-top:4px;">Export / Share Progress</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button class="menu-btn btn-neutral" style="margin:0;" onclick="exportData()">
          <span class="material-symbols-rounded menu-btn-icon">data_object</span> JSON
        </button>
        <button class="menu-btn btn-neutral" style="margin:0;" onclick="shareProgressPDF('text')">
          <span class="material-symbols-rounded menu-btn-icon">content_copy</span> Clipboard
        </button>
        <button class="menu-btn btn-neutral" style="margin:0;" onclick="shareProgressPDF('html')">
          <span class="material-symbols-rounded menu-btn-icon">html</span> HTML File
        </button>
        <button class="menu-btn btn-neutral" style="margin:0;" onclick="shareProgressPDF('pdf')">
          <span class="material-symbols-rounded menu-btn-icon">picture_as_pdf</span> PDF
        </button>
      </div>

      <div class="menu-section-tag">Restore Backup</div>
      <div style="display:flex; gap:8px;">
        <select id="backup-date-select" class="inline-input" style="flex:1;">
          ${backupOptions}
        </select>
        <button class="menu-btn btn-warning" style="width:auto; padding:8px 12px; margin:0;" onclick="restoreDailyBackup()">
          <span class="material-symbols-rounded menu-btn-icon">history</span> Restore
        </button>
      </div>
      
      <div class="menu-section-tag">Import Custom Backup</div>
      <button class="menu-btn btn-warning" onclick="triggerImport()">
        <span class="material-symbols-rounded menu-btn-icon">download</span> Import JSON
      </button>
    </div>
  `);
};

window.restoreDailyBackup = function() {
  const sel = document.getElementById('backup-date-select');
  const dateToRestore = sel ? sel.value : null;
  if (!dateToRestore) return alert("No auto-backup found!");
  const backupStr = localStorage.getItem('ca_app_daily_backup_' + dateToRestore);
  if (!backupStr) return alert("Backup data missing!");
  if (confirm("Are you sure you want to overwrite current data with backup from " + dateToRestore + "? This will replace both cloud and local data.")) {
    try {
      const data = JSON.parse(backupStr);
      if (data.trackerData) localStorage.setItem(getStorageKey(), JSON.stringify(data.trackerData));
      if (data.dynamicData) {
        DYNAMIC_DATA = data.dynamicData;
        saveDynamicData();
      }
      showToast('Backup restored! Reloading...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      showToast('Failed to restore backup.');
    }
  }
};

function openMenuModal() {
  const uName = typeof window.getDisplayUsername === 'function' ? window.getDisplayUsername(window.loggedUserEmail) : (window.loggedUserEmail ? window.loggedUserEmail.split('@')[0].toUpperCase() : 'USER');
  openModal('<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">settings</span> Settings & Tools' + (window.isReadOnlyMode ? ' <span style="color:var(--error-color); font-size:12px; margin-left:10px;">(Read-Only)</span>' : ''), `
    
    <div class="menu-section-tag" style="margin-top:0;">Account</div>
    ${(window.isCloudLoggedIn) 
      ? `<div style="padding: 12px; margin-bottom: 12px; background: rgba(10,132,255,0.1); border: 1px solid rgba(10,132,255,0.3); border-radius: 12px; display:flex; align-items:center; justify-content:space-between;">
           <div>
             <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; font-weight:700;">Active Cloud Account</div>
             <div style="font-size:14px; color:var(--primary, #0a84ff); font-weight:700; margin-top:2px; display:flex; align-items:center; gap:6px;">
               <span>👤 ${uName}</span>
               <span style="font-size:11px; color:var(--text-secondary); font-weight:400;">(${window.isReadOnlyMode ? 'View Mode' : 'Admin Mode'})</span>
               ${!window.isReadOnlyMode ? `<button style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:0; display:flex;" onclick="editCustomUsername()" title="Edit Display Name"><span class="material-symbols-rounded" style="font-size:15px; color:var(--primary);">edit</span></button>` : ''}
             </div>
           </div>
           <button style="background:linear-gradient(135deg, #ff453a, #d63630); color:#fff; border:none; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;" onclick="confirmLogout()">Logout</button>
         </div>` 
      : `<button class="menu-btn" style="background: rgba(10,132,255,0.15); border-color: var(--primary); color: var(--primary);" onclick="closeModal(); document.getElementById('welcome-overlay').style.display='flex';">
          <span class="material-symbols-rounded menu-btn-icon">login</span> Login
         </button>`
    }
    
    <div class="menu-section-tag">Appearance</div>
    <button class="menu-btn" onclick="openThemeModal()">
      <span class="material-symbols-rounded menu-btn-icon">palette</span> Display
    </button>
    
    <div class="menu-section-tag">Data Safety</div>
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--card-light); padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid var(--border);">
      <div style="display:flex; align-items:center; gap:10px; font-weight:600; color:var(--text-primary); font-size:14px;">
        <span class="material-symbols-rounded icon-sm">edit</span> Edit Mode
      </div>
      <label class="switch">
        <input type="checkbox" id="editModeToggle" onchange="toggleEditMode();" ${isEditMode ? 'checked' : ''}>
        <span class="slider round"></span>
      </label>
    </div>
    
    <button class="menu-btn" onclick="openBackupModal()">
      <span class="material-symbols-rounded menu-btn-icon">folder_managed</span> Data & Backups
    </button>

    <div class="menu-section-tag">System</div>
    <button class="menu-btn btn-neutral" onclick="checkForUpdates()">
      <span class="material-symbols-rounded menu-btn-icon">system_update</span> 
      <span>Check for Updates</span>
    </button>
  `);
}

window.confirmLogout = function() {
  openModal('', `
    <div style="text-align:center; padding: 8px 0;">
      <div style="width:48px; height:48px; border-radius:50%; background:rgba(232,163,61,0.15); border:1px solid rgba(232,163,61,0.4); display:flex; align-items:center; justify-content:center; margin:0 auto 14px;">
        <span class="material-symbols-rounded" style="color:#e8a33d; font-size:22px;">logout</span>
      </div>
      <div style="font-size:16px; font-weight:800; margin-bottom:7px;">Log Out?</div>
      <div style="font-size:13px; color:var(--text-muted); line-height:1.55; margin-bottom:20px;">Your <b style="color:var(--text-secondary);">local data stays on this device</b>. Only the cloud sync connection will be removed.</div>
      <div style="display:flex; gap:10px;">
        <button class="menu-btn btn-neutral" style="flex:1; margin:0; text-align:center;" onclick="openMenuModal()">Cancel</button>
        <button class="menu-btn btn-warning" style="flex:1; margin:0; text-align:center;" onclick="closeModal(); if(typeof logoutFromCloud === 'function') logoutFromCloud();">Log Out</button>
      </div>
    </div>
  `);
};

function openThemeModal() {
  const currentTheme = localStorage.getItem('ca-theme') || 'default';
  const savedMode = localStorage.getItem('theme');
  
  let modeIcon, modeText, nextMode;
  if (savedMode === 'light') {
      modeIcon = 'dark_mode'; modeText = 'Switch to Dark Mode'; nextMode = 'dark';
  } else if (savedMode === 'dark') {
      modeIcon = 'brightness_auto'; modeText = 'Switch to System Auto'; nextMode = 'auto';
  } else {
      modeIcon = 'light_mode'; modeText = 'Switch to Light Mode'; nextMode = 'light';
  }

  const themes = [
    { id: 'default', label: 'Midnight Gold', color: '#C9A15B' },
    { id: 'navy',    label: 'Navy',          color: '#2C4A6E' },
    { id: 'espresso',label: 'Espresso',      color: '#6B4A34' },
    { id: 'bronze',  label: 'Bronze',        color: '#8C5A2E' },
    { id: 'slate',   label: 'Charcoal Slate',color: '#4A5560' },
    { id: 'platinum',label: 'Platinum',      color: '#AEB0B4' },
  ];

  const swatchesHtml = themes.map(t => `
    <div class="theme-item" onclick="setTheme('${t.id}', this.querySelector('.theme-circle'))">
      <div class="theme-circle ${currentTheme === t.id ? 'active' : ''}" style="background:${t.color}; width:42px; height:42px; border-radius:50%; cursor:pointer; border: 2px solid ${currentTheme === t.id ? 'var(--text-primary)' : 'transparent'}; transition:0.2s;"></div>
      <span class="theme-item-label">${t.label}</span>
    </div>
  `).join('');
  
  openModal(`<div style="display:flex; align-items:center; gap:10px;">
    <button class="back-arrow-btn" onclick="openMenuModal()" title="Back to Menu">
      <span class="material-symbols-rounded" style="font-size:18px;">arrow_back</span>
    </button>
    <span>Select Theme</span>
  </div>`, `
    <button class="menu-btn btn-neutral" style="margin-bottom: 16px; text-align: center; justify-content: center;" onclick="setMode('${nextMode}'); openThemeModal();">
      <span class="material-symbols-rounded menu-btn-icon" style="margin-right: 8px;">${modeIcon}</span> ${modeText}
    </button>
    <p style="text-align:center; color:var(--text-secondary); margin-bottom: 4px; font-size:13px;">Personalize your app colors</p>
    <div class="theme-grid">${swatchesHtml}</div>
  `);
}

function setTheme(themeName, element) {
  // Remove all theme classes
  document.body.classList.remove('theme-navy', 'theme-espresso', 'theme-bronze', 'theme-slate', 'theme-platinum');
  
  if (themeName !== 'default') {
    document.body.classList.add('theme-' + themeName);
  }
  localStorage.setItem('ca-theme', themeName);
  
  // Update swatch borders (inline-styled swatches need direct style update)
  document.querySelectorAll('.theme-circle').forEach(el => {
    el.classList.remove('active');
    el.style.border = '2px solid transparent';
  });
  if (element) {
    element.classList.add('active');
    element.style.border = '2px solid var(--text-primary)';
  }
  
  // Re-render chart if on Exams tab to update chart color
  if (state.activeTab === 'exams') {
    renderScoreChart();
  }
}

// ─── SYLLABUS EDIT HANDLERS ─────────────
function reorderSyllabusSubject(from, to) {
  reorderArray(DYNAMIC_DATA.syllabusSubjects, from, to);
}
window.updateSyllabusSubject = function(parentIdx, newName, childIdx) {
  if (childIdx !== null && childIdx !== undefined) {
    DYNAMIC_DATA.syllabusSubjects[parentIdx].children[childIdx].name = newName;
  } else {
    DYNAMIC_DATA.syllabusSubjects[parentIdx].name = newName;
  }
  saveDynamicData();
};
window.deleteSyllabusSubject = function(parentIdx, childIdx) {
  confirmDelete('this subject', () => {
    if (childIdx !== null && childIdx !== undefined) {
      DYNAMIC_DATA.syllabusSubjects[parentIdx].children.splice(childIdx, 1);
    } else {
      DYNAMIC_DATA.syllabusSubjects.splice(parentIdx, 1);
    }
    saveDynamicData();
    showSubjectsList();
  });
};
function addSyllabusSubject() {
  openFormModal('Add New Subject', [
    { label: 'Subject Name', type: 'text', placeholder: 'e.g., Paper 6: IBS' }
  ], (name) => {
    if (!name) return;
    const id = 'subj-' + Date.now();
    const type = confirm('Is this a Main Subject (with Book/QB/Video tracking)?\nClick OK for Main, Cancel for Simple (like IBS).') ? 'main' : 'ibs';
    DYNAMIC_DATA.syllabusSubjects.push({ id, name, source: '', type, chapters: [] });
    saveDynamicData();
    renderSyllabus();
  });
}

function reorderSyllabusChapter(from, to, subjectId) {
  const subj = DYNAMIC_DATA.syllabusSubjects.find(s => s.id === subjectId);
  if (subj) reorderArray(subj.chapters, from, to);
}
function updateSyllabusChapter(subjectId, idx, newName) {
  if (!newName) return;
  const subj = DYNAMIC_DATA.syllabusSubjects.find(s => s.id === subjectId);
  if (subj) {
    subj.chapters[idx].name = newName;
    saveDynamicData();
  }
}
function deleteSyllabusChapter(subjectId, idx) {
  const subj = DYNAMIC_DATA.syllabusSubjects.find(s => s.id === subjectId);
  if (subj) {
    confirmDelete(subj.chapters[idx].name, () => {
      subj.chapters.splice(idx, 1);
      saveDynamicData();
      renderSyllabusDetail({ key: subj.id, type: subj.type });
    });
  }
}
function addSyllabusChapter(subjectId) {
  const subj = DYNAMIC_DATA.syllabusSubjects.find(s => s.id === subjectId);
  if (subj) {
    openFormModal('Add Chapter', [
      { label: 'Chapter Name', type: 'text', placeholder: 'e.g., Chapter 1' }
    ], (name) => {
      if (!name) return;
      subj.chapters.push({ id: 'ch-' + Date.now(), name });
      saveDynamicData();
      renderSyllabusDetail({ key: subj.id, type: subj.type });
    });
  }
}

// ─── EXAMS EDIT HANDLERS ───────────────
function reorderMock(from, to, seriesKey) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  if (series) reorderArray(series.tests, from, to);
}
function updateMock(seriesKey, idx, field, value) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  if (!series) return;
  const mock = series.tests[idx];
  mock[field] = value;
  saveDynamicData();
}
function deleteMock(seriesKey, idx) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  confirmDelete(series.tests[idx].subject, () => {
    series.tests.splice(idx, 1);
    saveDynamicData();
    renderExams();
  });
}
function addMock(seriesKey) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesKey);
  openFormModal('Add Mock', [
    { label: 'Subject', type: 'text', placeholder: 'e.g., DT Full Syllabus' },
    { label: 'Date', type: 'date', value: '2026-08-01' }
  ], (subj, date) => {
    if (!subj || !date) return;
    series.tests.push({ id: 'm-new-' + Date.now(), subject: subj, date: date, series: series.name });
    saveDynamicData();
    renderExams();
  });
}

function reorderExam(from, to) {
  reorderArray(DYNAMIC_DATA.finalExams, from, to);
}
function updateExam(idx, field, value) {
  const exam = DYNAMIC_DATA.finalExams[idx];
  if (!exam) return;
  exam[field] = value;
  saveDynamicData();
}
function deleteExam(idx) {
  confirmDelete(DYNAMIC_DATA.finalExams[idx].subject, () => {
    DYNAMIC_DATA.finalExams.splice(idx, 1);
    saveDynamicData();
    renderExams();
  });
}
function addExam() {
  openFormModal('Add Final Exam', [
    { label: 'Subject', type: 'text', placeholder: 'e.g., Paper 6: IBS' },
    { label: 'Date', type: 'date', value: '2026-11-01' }
  ], (subj, date) => {
    if (!subj || !date) return;
    DYNAMIC_DATA.finalExams.push({ id: 'final-new-' + Date.now(), subject: subj, date: date });
    saveDynamicData();
    renderExams();
  });
}

function updateTargetAttempt(attempt) {
  state.targetAttempt = attempt;
  saveState({ targetAttempt: attempt });
  
  const hs = document.getElementById('header-subtitle');
  if(hs) hs.textContent = `${attempt}`;
  
  // Generate tentative schedule for the selected attempt
  const isMay = attempt.startsWith('May');
  const year = parseInt(attempt.split(' ')[1]);
  const monthStr = isMay ? '05' : '11';
  
  if (state.activeGroup === 'group1') {
    DYNAMIC_DATA.finalExams = [
      { subject: "Paper 1: FR", date: `${year}-${monthStr}-02T14:00:00+05:30` },
      { subject: "Paper 2: AFM", date: `${year}-${monthStr}-04T14:00:00+05:30` },
      { subject: "Paper 3: Audit", date: `${year}-${monthStr}-06T14:00:00+05:30` }
    ];
  } else {
    DYNAMIC_DATA.finalExams = [
      { subject: "Paper 4: DT & International Tax", date: `${year}-${monthStr}-09T14:00:00+05:30` },
      { subject: "Paper 5: IDT (GST + Customs)", date: `${year}-${monthStr}-11T14:00:00+05:30` },
      { subject: "Paper 6: IBS (Case Study)", date: `${year}-${monthStr}-13T14:00:00+05:30` }
    ];
  }
  
  DYNAMIC_DATA.exam.date = `${year}-${monthStr}-01`;
  saveDynamicData();
  renderExams();
  alert(`Switched to ${attempt}. A tentative datesheet has been generated.`);
}

async function syncOfficialDates() {
  const btn = document.querySelector('.final-datesheet .add-item-btn');
  const oldText = btn.innerHTML;
  btn.innerHTML = '⏳ Syncing...';
  btn.disabled = true;
  
  try {
    const res = await fetch('datesheets.json?t=' + Date.now());
    if (!res.ok) throw new Error('Could not fetch datesheets');
    const data = await res.json();
    
    if (data[state.targetAttempt]) {
      const officialDates = data[state.targetAttempt][state.activeGroup];
      if (officialDates && officialDates.length > 0) {
        DYNAMIC_DATA.finalExams = officialDates;
        // set exam date to the day before the first exam
        const firstExam = new Date(officialDates[0].date);
        firstExam.setDate(firstExam.getDate() - 1);
        DYNAMIC_DATA.exam.date = firstExam.toISOString().split('T')[0];
        
        saveDynamicData();
        renderExams();
        alert(`Success! Official ICAI dates for ${state.targetAttempt} have been synced.`);
      } else {
        alert(`Official dates for your group in ${state.targetAttempt} are not available yet. Keep preparing!`);
      }
    } else {
      alert(`Official ICAI dates for ${state.targetAttempt} are not announced yet. The current schedule is tentative.`);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to check for official dates. Please check your internet connection.');
  } finally {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }
}

// ─── SCHEDULE EDIT HANDLERS ─────────────
function reorderScheduleSlot(from, to, scheduleKey) {
  reorderArray(DYNAMIC_DATA.schedules[scheduleKey].slots, from, to);
}
function updateScheduleSlot(scheduleKey, idx, field, value) {
  const slot = DYNAMIC_DATA.schedules[scheduleKey].slots[idx];
  if (!slot) return;
  slot[field] = value;
  saveDynamicData();
}
function deleteScheduleSlot(scheduleKey, idx) {
  confirmDelete(DYNAMIC_DATA.schedules[scheduleKey].slots[idx].label, () => {
    DYNAMIC_DATA.schedules[scheduleKey].slots.splice(idx, 1);
    saveDynamicData();
    renderSchedule();
  });
}
function addScheduleSlot(scheduleKey) {
  openFormModal('Add Schedule Slot', [
    { label: 'Label', type: 'text', placeholder: 'e.g., Break / Revision' },
    { label: 'Start - End Time', type: 'text', placeholder: 'e.g., 14:00-15:00' },
    { label: 'Duration (minutes)', type: 'number', value: 60 }
  ], (label, range, dur) => {
    if (!label) return;
    DYNAMIC_DATA.schedules[scheduleKey].slots.push({ id: 's-new-' + Date.now(), label, startRange: range, duration: parseInt(dur) || 60, type: 'study', icon: '<span class="material-symbols-rounded icon-sm">edit_document</span>' });
    saveDynamicData();
    renderSchedule();
  });
}

function initTheme() {
  const savedTheme = localStorage.getItem('ca-theme') || 'default';
  setTheme(savedTheme);
}

// ─── Data Export / Import ───
async function exportData() {
  try {
    const data = localStorage.getItem(getStorageKey()) || '{}';
    const exportPayload = { trackerData: JSON.parse(data), dynamicData: DYNAMIC_DATA };
    const jsonString = JSON.stringify(exportPayload, null, 2);
    
    const isNativeApp = window.Capacitor && window.Capacitor.isNativePlatform();
    
    if (isNativeApp) {
      const fileName = `ca-progress-${state.activeGroup}.json`;
      
      // Log available plugins for debugging
      console.log('Available Capacitor Plugins:', Object.keys(window.Capacitor.Plugins || {}));
      
      const FS = window.Capacitor.Plugins.Filesystem;
      const SH = window.Capacitor.Plugins.Share;
      
      // Method 1: Native Filesystem write + Share (requires new APK with plugins)
      if (FS && SH) {
        try {
          const writeResult = await FS.writeFile({
            path: fileName,
            data: btoa(unescape(encodeURIComponent(jsonString))),
            directory: 'CACHE'
          });
          
          await SH.share({
            title: 'CA Progress Backup',
            url: writeResult.uri,
            dialogTitle: 'Save or Share Backup'
          });
          
          showToast('Backup shared!');
          return;
        } catch (e) {
          console.error('Filesystem/Share plugin error:', e);
        }
      }
      
      // Method 2: Copy to clipboard (always works)
      try {
        await navigator.clipboard.writeText(jsonString);
        showToast('Backup copied to clipboard! Paste it in Notes or WhatsApp to save.');
        return;
      } catch (e) {
        console.error('Clipboard error:', e);
      }
      
      // Method 3: Show data in modal for manual copy
      openModal('Backup Data', `
        <div style="font-size:13px; color:var(--text-secondary); margin-bottom:10px; text-align:center;">
          Could not auto-share. Long press below to select all and copy:
        </div>
        <textarea readonly style="width:100%; height:200px; font-size:11px; background:var(--card); color:var(--text-primary); border:1px solid var(--border); border-radius:8px; padding:10px; font-family:monospace;">${jsonString.substring(0, 5000)}...</textarea>
      `);
      return;
    }

    // Direct download for PWA / Web Browser
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ca-progress-${state.activeGroup}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    showToast('Backup downloaded! <span class="material-symbols-rounded icon-sm">download</span>');
  } catch (err) {
    console.error("Export error:", err);
    showToast('Export failed!', 'error');
  }
}

function triggerImport() {
  document.getElementById('import-file').click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data && typeof data === 'object') {
        if (data.trackerData) {
            localStorage.setItem(getStorageKey(), JSON.stringify(data.trackerData));
        } else {
            localStorage.setItem(getStorageKey(), JSON.stringify(data));
        }
        if (data.dynamicData) {
            DYNAMIC_DATA = data.dynamicData;
            saveDynamicData();
        }
        if (typeof showToast === 'function') showToast('Data restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      console.error(err);
      alert('Invalid backup file! Make sure you selected the correct .json file.');
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // reset input
}

// ─── PDF Generation ───
async function shareProgressPDF(exportType = 'pdf') {
  const overallPct = calculateOverallProgress();
  
  let subjectsHtml = '';
  if (DYNAMIC_DATA && DYNAMIC_DATA.syllabusSubjects) {
    DYNAMIC_DATA.syllabusSubjects.forEach(s => {
      if (s.type === 'folder' && s.children) {
        s.children.forEach(child => {
          const pct = calculateSubjectProgress(child.id, child.type);
          subjectsHtml += `<div class="print-row"><span>${child.name}</span> <strong>${pct}%</strong></div>
          <div class="print-bar" style="margin-bottom:15px"><div class="print-bar-fill" style="width:${pct}%"></div></div>`;
        });
      } else {
        const pct = calculateSubjectProgress(s.id, s.type);
        subjectsHtml += `<div class="print-row"><span>${s.name}</span> <strong>${pct}%</strong></div>
        <div class="print-bar" style="margin-bottom:15px"><div class="print-bar-fill" style="width:${pct}%"></div></div>`;
      }
    });
  }

  const scores = getMockScores();
  let mocksHtml = '';
  let sortedMocks = [];
  if (DYNAMIC_DATA && DYNAMIC_DATA.mocks) {
    DYNAMIC_DATA.mocks.forEach(series => {
      series.tests.forEach(test => {
         const scoreEntry = scores[test.id];
         if (scoreEntry) {
           sortedMocks.push({
             name: test.name + ' (' + series.name + ')',
             score: scoreEntry.score,
             date: scoreEntry.date ? new Date(scoreEntry.date) : new Date(0)
           });
         }
      });
    });
  }
  
  sortedMocks.sort((a,b) => a.date - b.date);
  
  if (sortedMocks.length > 0) {
    mocksHtml += `<table style="width:100%; border-collapse:collapse; margin-bottom:15px; font-size:14px;">
      <tr style="border-bottom:1px solid #ddd; text-align:left;">
        <th style="padding:8px; font-weight:600;">Mock Name</th>
        <th style="padding:8px; font-weight:600; text-align:right;">Score</th>
        <th style="padding:8px; font-weight:600; text-align:center;">Trend</th>
      </tr>`;
    
    for (let i = 0; i < sortedMocks.length; i++) {
      let trendStr = '-';
      let trendColor = '#666';
      if (i > 0) {
        const diff = sortedMocks[i].score - sortedMocks[i-1].score;
        if (diff > 0) { trendStr = '↑ +' + diff; trendColor = '#30d158'; }
        else if (diff < 0) { trendStr = '↓ ' + diff; trendColor = '#ff453a'; }
      }
      mocksHtml += `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:8px;">${sortedMocks[i].name}</td>
        <td style="padding:8px; text-align:right; font-weight:bold;">${sortedMocks[i].score}/100</td>
        <td style="padding:8px; text-align:center; color:${trendColor}; font-weight:600;">${trendStr}</td>
      </tr>`;
    }
    mocksHtml += '</table>';
  } else {
    mocksHtml = '<p style="color:#666">No mock scores recorded yet.</p>';
  }
  
  // Stats Calculation
  let totalMins = 0;
  let streak = 0;
  
  // Calculate total hours
  let allJournalEntries = [];
  if (DYNAMIC_DATA && DYNAMIC_DATA.journalEntries) {
    Object.keys(DYNAMIC_DATA.journalEntries).forEach(dateKey => {
      const dayData = DYNAMIC_DATA.journalEntries[dateKey];
      if (dayData && dayData.rows) {
        dayData.rows.forEach(e => allJournalEntries.push({ ...e, date: dateKey }));
      }
    });
  }
  
  allJournalEntries.forEach(e => totalMins += ((parseInt(e.durHH)||0) * 60 + (parseInt(e.durMM)||0)));
  let totalHoursStr = `${Math.floor(totalMins / 60)}:${String(totalMins % 60).padStart(2, '0')}`;
  
  // Calculate streak
  const trackerStr = localStorage.getItem(getStorageKey());
  const parsedTracker = JSON.parse(trackerStr || '{}');
  if (parsedTracker.consistency) streak = parsedTracker.consistency.currentStreak || 0;
  
  // 14 day avg
  const today = new Date();
  let minsIn14 = 0;
  let daysWithData = 0;
  for(let i = 0; i < 14; i++) {
     let d = new Date(today);
     d.setDate(d.getDate() - i);
     // Format to YYYY-MM-DD
     let year = d.getFullYear();
     let month = String(d.getMonth() + 1).padStart(2, '0');
     let day = String(d.getDate()).padStart(2, '0');
     let dStr = `${year}-${month}-${day}`;
     
     let dayMins = 0;
     allJournalEntries.filter(e => e.date === dStr).forEach(e => dayMins += ((parseInt(e.durHH)||0) * 60 + (parseInt(e.durMM)||0)));
     minsIn14 += dayMins;
     if (dayMins > 0) daysWithData++;
  }
  let avgMins = daysWithData > 0 ? Math.floor(minsIn14 / 14) : 0;
  let avgStr = `${Math.floor(avgMins / 60)}:${String(avgMins % 60).padStart(2, '0')}`;
  let avgHoursFloat = avgMins / 60;
  
  // Exam countdown
  let examCountdownHtml = '';
  try {
    const examDate = new Date(DYNAMIC_DATA.exam ? DYNAMIC_DATA.exam.date : null);
    if (!isNaN(examDate)) {
      const diffDays = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24));
      examCountdownHtml = `<div style="display:flex; justify-content:space-between; align-items:center; background:#faf3e7; border:1px solid #e6d3ae; border-radius:8px; padding:10px 16px; margin-bottom:18px; font-family:-apple-system,sans-serif;">
        <span style="font-size:11px; color:#b8863f; font-weight:700; text-transform:uppercase;">Exam Countdown</span>
        <span style="font-size:16px; font-weight:800; color:#1a1a1a;">${diffDays > 0 ? diffDays + ' days remaining' : 'Exam day!'}</span>
      </div>`;
    }
  } catch(e) {}
  
  // Consistency section
  let consistencyHtml = '';
  try {
    const cons = DYNAMIC_DATA.consistency || {};
    const currentStreak = cons.currentStreak || streak;
    const longestStreak = cons.longestStreak || 0;
    const paceLabel = avgHoursFloat >= 8 ? 'Excellent Pace 🔥' : avgHoursFloat >= 5 ? 'Good Pace ✅' : avgHoursFloat >= 2 ? 'Moderate Pace' : 'Needs Improvement';
    consistencyHtml = `<div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:8px;">
      <div style="flex:1; min-width:80px; border:1px solid #e2e2e2; border-radius:8px; padding:10px; text-align:center;">
        <div style="font-size:20px; font-weight:800;">${currentStreak}</div>
        <div style="font-size:9px; color:#888; text-transform:uppercase; margin-top:2px;">Current Streak</div>
      </div>
      <div style="flex:1; min-width:80px; border:1px solid #e2e2e2; border-radius:8px; padding:10px; text-align:center;">
        <div style="font-size:20px; font-weight:800;">${longestStreak}</div>
        <div style="font-size:9px; color:#888; text-transform:uppercase; margin-top:2px;">Longest Run</div>
      </div>
      <div style="flex:1; min-width:80px; border:1px solid #e2e2e2; border-radius:8px; padding:10px; text-align:center;">
        <div style="font-size:11px; font-weight:800; color:#333;">${paceLabel}</div>
        <div style="font-size:9px; color:#888; text-transform:uppercase; margin-top:2px;">Current Pace</div>
      </div>
    </div>`;
  } catch(e) {}
  
  const uName = typeof window.getDisplayUsername === 'function' ? window.getDisplayUsername(window.loggedUserEmail) : (window.loggedUserEmail ? window.loggedUserEmail.split('@')[0] : 'User');
  const today2 = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const html = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #1a1a1a; padding-bottom:12px; margin-bottom:16px; font-family:-apple-system,sans-serif;">
      <div>
        <div style="font-size:18px; font-weight:900; font-family:Georgia,serif;">CA Final Progress Report</div>
        <div style="font-size:11px; color:#666; margin-top:3px;">Generated ${today2}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:14px; font-weight:800; color:#1a1a1a;">${uName}</div>
        <div style="font-size:10px; color:#888;">Exam: Nov 2026</div>
      </div>
    </div>
    
    ${examCountdownHtml}
    
    <div class="print-card">
      <h3 style="margin-bottom:10px; font-family:Georgia,serif;">Overall Syllabus Completion</h3>
      <div style="font-size:32px; font-weight:900; text-align:center">${overallPct}%</div>
      <div class="print-bar"><div class="print-bar-fill" style="width:${overallPct}%"></div></div>
    </div>
    
    <div class="print-card">
      <h3 style="margin-bottom:10px; font-family:Georgia,serif;">Subject-wise Breakdown</h3>
      ${subjectsHtml}
    </div>

    <div class="print-card">
      <h3 style="margin-bottom:10px; font-family:Georgia,serif;">Study Activity</h3>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
        <div style="border:1px solid #e2e2e2; border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:18px; font-weight:800;">${totalHoursStr}</div>
          <div style="font-size:9px; color:#888; text-transform:uppercase; margin-top:2px;">Total Logged</div>
        </div>
        <div style="border:1px solid #e2e2e2; border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:18px; font-weight:800;">${avgStr}</div>
          <div style="font-size:9px; color:#888; text-transform:uppercase; margin-top:2px;">Daily Avg (14d)</div>
        </div>
        <div style="border:1px solid #e2e2e2; border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:18px; font-weight:800;">${streak}</div>
          <div style="font-size:9px; color:#888; text-transform:uppercase; margin-top:2px;">Day Streak</div>
        </div>
      </div>
    </div>
    
    <div class="print-card">
      <h3 style="margin-bottom:10px; font-family:Georgia,serif;">Consistency</h3>
      ${consistencyHtml}
    </div>
    
    <div class="print-card">
      <h3 style="margin-bottom:10px; font-family:Georgia,serif;">Mock Test Performance</h3>
      ${mocksHtml}
    </div>
    
    <p style="text-align:center; color:#888; margin-top:20px; font-size:10px; font-family:-apple-system,sans-serif;">Generated via CA Final Study Companion PWA</p>
  `;
  const isNativeApp = window.Capacitor && window.Capacitor.isNativePlatform();
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>CA Progress Report</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:20px;background:#fff;color:#1a1a1a;max-width:600px;margin:0 auto;}.print-card{border:1px solid #e2e2e2;border-radius:12px;padding:16px;margin-bottom:16px;}.print-row{display:flex;justify-content:space-between;padding:6px 0;}.print-bar{height:8px;background:#eee;border-radius:4px;overflow:hidden;}.print-bar-fill{height:100%;background:linear-gradient(90deg,#6C3CE1,#3B82F6);border-radius:4px;}</style></head><body>${html}</body></html>`;

  if (exportType === 'text') {
    try {
      let textSummary = `CA Final Progress Report (${state.activeGroup === 'group1' ? 'Group 1' : 'Group 2'})\nOverall: ${overallPct}%\nLogged: ${totalHoursStr} | Avg: ${avgStr}/day | Streak: ${streak}\n\n`;
      if (DYNAMIC_DATA && DYNAMIC_DATA.syllabusSubjects) {
        DYNAMIC_DATA.syllabusSubjects.forEach(s => {
          if (s.type === 'folder' && s.children) {
            s.children.forEach(c => { textSummary += `- ${c.name}: ${calculateSubjectProgress(c.id, c.type)}%\n`; });
          } else {
            textSummary += `- ${s.name}: ${calculateSubjectProgress(s.id, s.type)}%\n`;
          }
        });
      }
      await navigator.clipboard.writeText(textSummary);
      closeModal();
      showToast('Progress report copied to clipboard! Paste it anywhere to share.');
    } catch (e) {
      console.error('Clipboard error:', e);
      showToast('Failed to copy. ' + e.message, 'error');
    }
    return;
  }

  if (exportType === 'html') {
    const fileName = `ca-progress-report-${new Date().toISOString().slice(0,10)}.html`;
    if (isNativeApp && window.Capacitor.Plugins.Filesystem && window.Capacitor.Plugins.Share) {
      try {
        const result = await window.Capacitor.Plugins.Filesystem.writeFile({
          path: fileName,
          data: btoa(unescape(encodeURIComponent(fullHtml))),
          directory: 'CACHE'
        });
        await window.Capacitor.Plugins.Share.share({
          title: 'CA Progress Report',
          url: result.uri,
          dialogTitle: 'Share HTML Report'
        });
        closeModal();
        showToast('HTML Report shared!');
      } catch (e) {
        console.error('Native share error:', e);
        showToast('Native share failed: ' + e.message, 'error');
      }
    } else {
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      closeModal();
      showToast('HTML Report downloaded.');
    }
    return;
  }

  if (exportType === 'pdf') {
    if (typeof html2pdf !== 'undefined') {
      showToast('Generating PDF... please wait.', 'info');
      
      const pdfContent = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:20px;background:#fff;color:#1a1a1a;width:100%;max-width:750px;margin:0 auto;box-sizing:border-box;">
          <style>
            .print-card{border:1px solid #e2e2e2;border-radius:12px;padding:16px;margin-bottom:16px;}
            .print-row{display:flex;justify-content:space-between;padding:6px 0;}
            .print-bar{height:8px;background:#eee;border-radius:4px;overflow:hidden;}
            .print-bar-fill{height:100%;background:linear-gradient(90deg,#6C3CE1,#3B82F6);border-radius:4px;}
          </style>
          ${html}
        </div>
      `;
      
      const opt = {
        margin: 0.5,
        filename: `ca-progress-report-${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      if (isNativeApp && window.Capacitor.Plugins.Filesystem && window.Capacitor.Plugins.Share) {
        html2pdf().set(opt).from(pdfContent).outputPdf('datauristring').then(async (pdfString) => {
          try {
            const base64data = pdfString.split(',')[1];
            const result = await window.Capacitor.Plugins.Filesystem.writeFile({
              path: opt.filename,
              data: base64data,
              directory: 'CACHE'
            });
            await window.Capacitor.Plugins.Share.share({
              title: 'CA Progress Report',
              url: result.uri,
              dialogTitle: 'Share PDF Report'
            });
            closeModal();
            showToast('PDF Report shared!');
          } catch(e) {
            console.error('PDF share error:', e);
            showToast('PDF share failed: ' + e.message, 'error');
          }
        });
      } else {
        html2pdf().set(opt).from(pdfContent).save().then(() => {
          closeModal();
          showToast('PDF downloaded.');
        });
      }
      return;
    } else {
      // Fallback (Print dialog) if library didn't load
      document.getElementById('print-section').innerHTML = html;
      closeModal();
      setTimeout(() => window.print(), 500);
      return;
    }
  }

}

// ─── Test Series Managers ─────────────────────
function addMockSeries() {
  openFormModal('Add Test Series', [
    { label: 'Series Name', type: 'text', placeholder: 'e.g., ICAI MTPs' }
  ], (name) => {
    if (!name) return;
    const id = 'series_' + Date.now();
    DYNAMIC_DATA.mocks.push({ id, name, tests: [] });
    saveDynamicData();
    renderExams();
  });
}

function updateMockSeries(idx, name) {
  if (!name) return;
  DYNAMIC_DATA.mocks[idx].name = name;
  saveDynamicData();
}

function deleteMockSeries(idx) {
  if (confirm(`Delete series "${DYNAMIC_DATA.mocks[idx].name}" and all its mocks?`)) {
    DYNAMIC_DATA.mocks.splice(idx, 1);
    saveDynamicData();
    renderExams();
  }
}


window.setMode = function(mode) {
    if (mode === 'auto') {
        localStorage.removeItem('theme');
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.body.setAttribute('data-theme', mode);
        localStorage.setItem('theme', mode);
    }
}
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    window.setMode(currentTheme === 'light' ? 'dark' : 'light');
}
function updateSystemTheme(e) {
    if (!localStorage.getItem('theme')) {
        document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSystemTheme);
});


window.moveSubjectUp = function(idx) {
  event.stopPropagation();
  if (idx > 0) {
    const temp = DYNAMIC_DATA.syllabusSubjects[idx];
    DYNAMIC_DATA.syllabusSubjects[idx] = DYNAMIC_DATA.syllabusSubjects[idx - 1];
    DYNAMIC_DATA.syllabusSubjects[idx - 1] = temp;
    saveDynamicData();
    renderSyllabus();
  }
};
window.moveSubjectDown = function(idx) {
  event.stopPropagation();
  if (idx < DYNAMIC_DATA.syllabusSubjects.length - 1) {
    const temp = DYNAMIC_DATA.syllabusSubjects[idx];
    DYNAMIC_DATA.syllabusSubjects[idx] = DYNAMIC_DATA.syllabusSubjects[idx + 1];
    DYNAMIC_DATA.syllabusSubjects[idx + 1] = temp;
    saveDynamicData();
    renderSyllabus();
  }
};

window.toggleFolder = function(id) {
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

window.moveSyllabusSubject = function(idx, dir, parentIdx) {
  if (parentIdx !== null && parentIdx !== 'null' && parentIdx !== undefined) {
    const parent = DYNAMIC_DATA.syllabusSubjects[parentIdx];
    if (parent && parent.children) {
      if (idx + dir < 0 || idx + dir >= parent.children.length) return;
      reorderArray(parent.children, idx, idx + dir);
      saveDynamicData();
      showSubjectsList();
    }
  } else {
    if (idx + dir < 0 || idx + dir >= DYNAMIC_DATA.syllabusSubjects.length) return;
    reorderArray(DYNAMIC_DATA.syllabusSubjects, idx, idx + dir);
    saveDynamicData();
    showSubjectsList();
  }
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

window.moveMock = function(seriesId, idx, dir) {
  const series = DYNAMIC_DATA.mocks.find(s => s.id === seriesId);
  if (series && series.tests) {
    if (idx + dir < 0 || idx + dir >= series.tests.length) return;
    reorderArray(series.tests, idx, idx + dir);
    saveDynamicData();
    renderExams();
  }
}

function moveScheduleSlot(scheduleKey, idx, dir) {
  const slots = DYNAMIC_DATA.schedules[scheduleKey].slots;
  if (idx + dir < 0 || idx + dir >= slots.length) return;
  reorderArray(slots, idx, idx + dir);
  saveDynamicData();
  renderSchedule();
}


// ==========================================
// LIVE STUDY TRACKER
// ==========================================

var trackerState = {
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedTime: 0,
  pauseStart: null,
  intervalId: null,
  subject: '',
  topic: '',
  task: ''
};

function restoreTrackerState() {
  try {
    var saved = localStorage.getItem('ca_study_tracker_state');
    if (saved) {
      var s = JSON.parse(saved);
      if (s.isRunning || s.isPaused) {
        trackerState.startTime = s.startTime;
        trackerState.pausedTime = s.pausedTime || 0;
        trackerState.subject = s.subject || '';
        trackerState.topic = s.topic || '';
        trackerState.task = s.task || '';
        if (s.isPaused) {
          trackerState.isPaused = true;
          trackerState.pauseStart = s.pauseStart;
          if (trackerState.intervalId) { clearInterval(trackerState.intervalId); trackerState.intervalId = null; }
          updateTrackerUI('paused');
          updateTimerDisplay();
        } else {
          trackerState.isRunning = true;
          updateTrackerUI('running');
          if (trackerState.intervalId) clearInterval(trackerState.intervalId);
          trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
        }
        var subSel = document.getElementById('st-subject');
        if (subSel) subSel.value = trackerState.subject;
        onTrackerSubjectChange(true);
        var topSel = document.getElementById('st-topic');
        if (topSel) topSel.value = trackerState.topic;
        var taskInp = document.getElementById('st-task-desc');
        if (taskInp) taskInp.value = trackerState.task;
      }
    } else {
      trackerState.isRunning = false;
      trackerState.isPaused = false;
      trackerState.startTime = null;
      trackerState.pausedTime = 0;
      trackerState.pauseStart = null;
      if (trackerState.intervalId) { clearInterval(trackerState.intervalId); trackerState.intervalId = null; }
      updateTrackerUI('idle');
      var el = document.getElementById('st-timer-value');
      if (el) el.textContent = '00:00:00';
    }
  } catch(e) { console.error('restoreTrackerState', e); }
}

function saveTrackerState() {
  try {
    if (trackerState.isRunning || trackerState.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify({
        isRunning: trackerState.isRunning, isPaused: trackerState.isPaused,
        startTime: trackerState.startTime, pausedTime: trackerState.pausedTime,
        pauseStart: trackerState.pauseStart, subject: trackerState.subject,
        topic: trackerState.topic, task: trackerState.task
      }));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
  } catch(e) {}
}

function populateTrackerSubjects() {
  var sel = document.getElementById('st-subject');
  if (!sel) return;
  sel.innerHTML = '<option value="">Select Subject</option>';
  var subjects = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    subjects.push(s);
    if (s.type === 'folder' && s.children) subjects = subjects.concat(s.children);
  });
  subjects.forEach(function(s) {
    var opt = document.createElement('option');
    opt.value = s.name; opt.textContent = s.name;
    sel.appendChild(opt);
  });
  var customOpt = document.createElement('option');
  customOpt.value = '__custom__'; customOpt.textContent = 'Other...';
  sel.appendChild(customOpt);
}

function onTrackerSubjectChange(restoring) {
  var subSel = document.getElementById('st-subject');
  var topSel = document.getElementById('st-topic');
  if (!subSel || !topSel) return;
  var subj = subSel.value;
  topSel.innerHTML = '<option value="">Select Topic</option>';
  if (subj === '__custom__') {
    var name = prompt('Enter subject name:');
    if (name) {
      var opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
      subSel.value = name;
    } else { subSel.value = ''; return; }
  }
  if (subj && subj !== '__custom__') {
    var subjects = [];
    (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
      subjects.push(s);
    if (s.type === 'folder' && s.children) subjects = subjects.concat(s.children);
    });
    var sData = subjects.find(function(s) { return s.name === subj; });
    if (sData) {
      let arr = sData.chapters || sData.children || [];
      arr.forEach(function(ch) {
        var opt = document.createElement('option');
        opt.value = ch.name; opt.textContent = ch.name;
        topSel.appendChild(opt);
      });
    }
  }
  if (!restoring) { trackerState.subject = subSel.value; saveTrackerState(); }
}

function onTrackerTopicChange() {
  trackerState.topic = document.getElementById('st-topic').value;
  saveTrackerState();
}

function getElapsedMs() {
  if (!trackerState.startTime) return 0;
  var now = (typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  var elapsed = now - trackerState.startTime - trackerState.pausedTime;
  if (trackerState.isPaused && trackerState.pauseStart) elapsed -= (now - trackerState.pauseStart);
  return Math.max(0, elapsed);
}

function formatElapsed(ms) {
  var totalSec = Math.floor(ms / 1000);
  var hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  var mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  var ss = String(totalSec % 60).padStart(2, '0');
  return hh + ':' + mm + ':' + ss;
}

function updateTimerDisplay() {
  var el = document.getElementById('st-timer-value');
  if (el) el.textContent = formatElapsed(getElapsedMs());
}

function updateTrackerUI(mode) {
  var timerDisp = document.getElementById('st-timer-display');
  var btnStart = document.getElementById('st-btn-start');
  var btnPause = document.getElementById('st-btn-pause');
  var btnResume = document.getElementById('st-btn-resume');
  var btnStop = document.getElementById('st-btn-stop');
  var statusEl = document.getElementById('st-status');
  var subSel = document.getElementById('st-subject');
  var topSel = document.getElementById('st-topic');
  var taskInp = document.getElementById('st-task-desc');
  if (!timerDisp) return;
  timerDisp.className = 'st-timer-display';
  if (mode === 'idle') {
    btnStart.style.display = 'flex'; btnPause.style.display = 'none';
    btnResume.style.display = 'none'; btnStop.style.display = 'none';
    subSel.disabled = false; topSel.disabled = false; taskInp.disabled = false;
    statusEl.textContent = '';
  } else if (mode === 'running') {
    timerDisp.classList.add('running');
    btnStart.style.display = 'none'; btnPause.style.display = 'flex';
    btnResume.style.display = 'none'; btnStop.style.display = 'flex';
    subSel.disabled = true; topSel.disabled = true; taskInp.disabled = false;
    statusEl.innerHTML = '<span class="material-symbols-rounded icon-sm" style="color:var(--success-color); vertical-align:middle; font-size:16px;">radio_button_checked</span> Studying...';
  } else if (mode === 'paused') {
    timerDisp.classList.add('paused');
    btnStart.style.display = 'none'; btnPause.style.display = 'none';
    btnResume.style.display = 'flex'; btnStop.style.display = 'flex';
    subSel.disabled = true; topSel.disabled = true; taskInp.disabled = false;
    statusEl.textContent = '⏸️ Paused';
  }
}

function trackerStart() {
  var subj = document.getElementById('st-subject').value;
  if (!subj) {
    document.getElementById('st-status').innerHTML = '<span class="material-symbols-rounded icon-sm" style="color:var(--accent); vertical-align:middle; font-size:16px;">warning</span> Please select a subject first';
    return;
  }
  trackerState.isRunning = true; trackerState.isPaused = false;
  trackerState.startTime = (typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now()); trackerState.pausedTime = 0; trackerState.pauseStart = null;
  trackerState.subject = document.getElementById('st-subject').value;
  trackerState.topic = document.getElementById('st-topic').value;
  trackerState.task = document.getElementById('st-task-desc').value;
  updateTrackerUI('running');
  trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
  saveTrackerState();
}

function trackerPause() {
  trackerState.isRunning = false; trackerState.isPaused = true;
  trackerState.pauseStart = (typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now());
  clearInterval(trackerState.intervalId);
  updateTrackerUI('paused'); saveTrackerState();
}

function trackerResume() {
  if (trackerState.pauseStart) trackerState.pausedTime += ((typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now()) - trackerState.pauseStart);
  trackerState.pauseStart = null; trackerState.isRunning = true; trackerState.isPaused = false;
  updateTrackerUI('running');
  trackerState.intervalId = setInterval(updateTimerDisplay, 1000);
  saveTrackerState();
}

function trackerStop() {
  if (trackerState.isPaused && trackerState.pauseStart) {
    trackerState.pausedTime += ((typeof window.getGlobalTime === 'function' ? window.getGlobalTime() : Date.now()) - trackerState.pauseStart);
    trackerState.pauseStart = null;
  }
  var elapsedMs = getElapsedMs();
  var totalMinutes = Math.round(elapsedMs / 60000);
  var hh = Math.floor(totalMinutes / 60);
  var mm = totalMinutes % 60;
  clearInterval(trackerState.intervalId);
  var subject = trackerState.subject || document.getElementById('st-subject').value;
  var topic = trackerState.topic || document.getElementById('st-topic').value;
  var task = document.getElementById('st-task-desc').value;
  
  // Capture startTime BEFORE nulling trackerState (format: "HH:MM")
  var sessionStartTime = '';
  if (trackerState.startTime) {
    var st = new Date(trackerState.startTime);
    sessionStartTime = String(st.getHours()).padStart(2,'0') + ':' + String(st.getMinutes()).padStart(2,'0');
  }
  
  // Reset tracker state BEFORE saving to prevent Firebase triggering an active tracker
  trackerState.isRunning = false; trackerState.isPaused = false;
  trackerState.startTime = null; trackerState.pausedTime = 0; trackerState.pauseStart = null;
  updateTrackerUI('idle');
  document.getElementById('st-timer-value').textContent = '00:00:00';
  saveTrackerState();

  if (totalMinutes >= 1) {
    var today = new Date();
    var todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
    if (!DYNAMIC_DATA.journalEntries[todayStr]) {
      DYNAMIC_DATA.journalEntries[todayStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
    }
    if (!DYNAMIC_DATA.journalEntries[todayStr].rows) { DYNAMIC_DATA.journalEntries[todayStr].rows = []; }
    DYNAMIC_DATA.journalEntries[todayStr].rows.push({
      subject: subject, topic: topic, tasks: task,
      durHH: String(hh), durMM: String(mm), status: 'Done',
      startTime: sessionStartTime
    });
    saveDynamicData();
    renderTodaysLog();
    document.getElementById('st-status').innerHTML = '<span class="material-symbols-rounded icon-sm" style="color:var(--success-color); vertical-align:middle; font-size:16px;">check_circle</span> Saved ' + hh + 'h ' + mm + 'm to journal';
  } else {
    document.getElementById('st-status').textContent = 'Session too short (< 1 min), not saved';
  }
  
  setTimeout(function() {
    var st = document.getElementById('st-status');
    if (st) st.textContent = '';
  }, 4000);
}


// ==========================================

window.openPlannerPickerModal = function(target = 'tracker') {
  const dateStr = getTodayStr();
  const tasksObj = getPlannerTasks();
  const todayTasks = tasksObj[dateStr] || [];
  
  const pending = todayTasks.filter(t => !t.done);
  if (pending.length === 0) {
    alert("No pending tasks in today's planner!");
    return;
  }
  
  let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
  pending.forEach((t, idx) => {
    let subjName = t.subject || '';
    let topicName = t.chapterId || '';
    
    const sObj = findSubj(t.subject);
    if (sObj) {
      subjName = sObj.name;
      if (t.chapterId && sObj.chapters) {
        const cObj = sObj.chapters.find(c => c.id === t.chapterId);
        if (cObj) topicName = cObj.name;
      }
    }
    
    const subj = subjName.replace(/'/g, "\\'");
    const topic = topicName.replace(/'/g, "\\'");
    const name = (t.name || '').replace(/'/g, "\\'");
    
    html += `
      <div class="glass-card" style="padding:10px; cursor:pointer; border:1px solid rgba(10,132,255,0.2);" onclick="pickPlannerTask('${subj}', '${topic}', '${name}', '${target}')">
        <div style="font-weight:600; font-size:14px;">${t.name}</div>
        <div style="font-size:12px; color:var(--text-secondary);">${subjName || 'No Subject'} ${topicName ? '— ' + topicName : ''}</div>
      </div>
    `;
  });
  html += '</div>';
  
  openModal('Select a Task', html);
};

window.pickPlannerTask = function(subj, topic, taskName, target) {
  closeModal();
  
  const isManual = (target === 'manual');
  const subjId = isManual ? 'ml-subj' : 'st-subject';
  const topicId = isManual ? 'ml-topic' : 'st-topic';
  const taskId = isManual ? 'ml-task' : 'st-task-desc';
  
  if (isManual) {
    openManualLogModal();
    setTimeout(() => populateFields(), 50);
  } else {
    populateFields();
  }
  
  function populateFields() {
    const subSel = document.getElementById(subjId);
    if (subj && subSel.querySelector(`option[value="${subj}"]`)) {
      subSel.value = subj;
    } else if (subj) {
      const opt = document.createElement('option');
      opt.value = subj; opt.textContent = subj;
      subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
      subSel.value = subj;
    }
    
    if (isManual) onManualLogSubjChange();
    else onTrackerSubjectChange(true);
    
    const topSel = document.getElementById(topicId);
    if (topic && topSel.querySelector(`option[value="${topic}"]`)) {
      topSel.value = topic;
    } else if (topic) {
      const opt = document.createElement('option');
      opt.value = topic; opt.textContent = topic;
      topSel.appendChild(opt);
      topSel.value = topic;
    }
    
    document.getElementById(taskId).value = taskName;
    
    if (!isManual) {
      trackerState.subject = subSel.value;
      trackerState.topic = topSel.value;
      trackerState.task = taskName;
      saveTrackerState();
    }
  }
};

// ==========================================
// TODAY'S LOG FEATURE (Simplified Journal)
// ==========================================

window.viewLogsDate = null;

function changeLogsDate() {
  const dp = document.getElementById('tl-date-picker');
  if (dp && dp.value) {
    window.viewLogsDate = dp.value;
    renderTodaysLog();
  }
}

function getTodayStr() {
  const dateObj = new Date();
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function renderTodaysLog() {
  const container = document.getElementById('tl-list');
  const totalEl = document.getElementById('tl-total-time');
  if (!container) return;
  
  if (!window.viewLogsDate) window.viewLogsDate = getTodayStr();
  
  const dp = document.getElementById('tl-date-picker');
  if (dp && !dp.value) dp.value = window.viewLogsDate;
  
  const targetDate = window.viewLogsDate;
  let entries = (DYNAMIC_DATA.journalEntries && DYNAMIC_DATA.journalEntries[targetDate] && DYNAMIC_DATA.journalEntries[targetDate].rows) || [];
  
  container.innerHTML = '';
  let totalMinutes = 0;
  
  if (entries.length === 0) {
    let emptyMsg = targetDate === getTodayStr() ? 'No logs today yet. Start studying!' : `No logs found for ${targetDate}.`;
    container.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">${emptyMsg}</div>`;
    totalEl.textContent = 'Total: 0h 0m';
    return;
  }
  
  entries.forEach((row, idx) => {
    let durText = '';
    const h = parseInt(row.durHH) || 0;
    const m = parseInt(row.durMM) || 0;
    totalMinutes += (h * 60) + m;
    
    if (h > 0) durText += h + 'h ';
    if (m > 0 || h === 0) durText += m + 'm';
    
    const div = document.createElement('div');
    div.style.background = 'rgba(255,255,255,0.03)';
    div.style.border = '1px solid var(--border-color)';
    div.style.borderRadius = '8px';
    div.style.padding = '10px';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'flex-start';
    
    div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600; font-size:14px; color:var(--text-primary);">${row.subject}</div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${row.topic}</div>
        ${row.tasks ? '<div style="font-size:12px; color:var(--text-muted); margin-top:4px;"><i>' + row.tasks + '</i></div>' : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px; font-weight:600; color:var(--primary); background:rgba(10,132,255,0.1); padding:2px 6px; border-radius:6px; display:inline-block;">${durText}</div>
        <div style="margin-top:6px; display:flex; gap:4px; justify-content:flex-end;">
          <button class="icon-btn" style="padding:4px;" onclick="openManualLogModal(${idx})" title="Edit Log"><span class="material-symbols-rounded" style="font-size:16px; color:var(--primary);">edit</span></button>
          <button class="icon-btn" style="padding:4px;" onclick="deleteTodaysLog(${idx})" title="Delete Log"><span class="material-symbols-rounded" style="font-size:16px; color:#ff453a;">delete</span></button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
  
  const totH = Math.floor(totalMinutes / 60);
  const totM = totalMinutes % 60;
  totalEl.textContent = `Total: ${totH}h ${totM}m`;
}

window.deleteTodaysLog = function(idx) {
  if(confirm('Are you sure you want to delete this log?')) {
    const targetDate = window.viewLogsDate || getTodayStr();
    if (DYNAMIC_DATA.journalEntries[targetDate] && DYNAMIC_DATA.journalEntries[targetDate].rows) {
      DYNAMIC_DATA.journalEntries[targetDate].rows.splice(idx, 1);
      saveDynamicData();
      renderTodaysLog();
    }
  }
};

window.openManualLogModal = function(idx) {
  const body = document.getElementById('modal-body');
  const isEditing = typeof idx === 'number';
  
  let subjValue = '', topicValue = '', taskValue = '', hhValue = 0, mmValue = 0;
  let dateValue = window.viewLogsDate || getTodayStr();
  
  window.editingLogIdx = undefined;
  window.editingLogDate = undefined;
  
  if (isEditing) {
    const row = DYNAMIC_DATA.journalEntries[dateValue].rows[idx];
    if (row) {
      subjValue = row.subject || '';
      topicValue = row.topic || '';
      taskValue = row.tasks || '';
      hhValue = parseInt(row.durHH) || 0;
      mmValue = parseInt(row.durMM) || 0;
      window.editingLogIdx = idx;
      window.editingLogDate = dateValue;
    }
  }

  document.getElementById('modal-title').innerHTML = isEditing ? 'Edit Manual Log' : 'Add Manual Log ' +
    '<button class="icon-btn" style="background: rgba(255,149,0,0.1); color: var(--accent); width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-left: 10px; vertical-align: middle;" title="Pick Mock" onclick="openMockPickerModal(\'manual\')"><span class="material-symbols-rounded" style="font-size:18px;">quiz</span></button>' +
    '<button class="icon-btn" style="background: rgba(10,132,255,0.1); color: var(--primary); width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-left: 6px; vertical-align: middle;" title="Pick from Planner" onclick="openPlannerPickerModal(\'manual\')"><span class="material-symbols-rounded" style="font-size:18px;">playlist_add</span></button>';
  
  let subjOptions = '<option value="">Select Subject</option>';
  let subjectsArray = [];
  (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
    subjectsArray.push(s);
    if (s.type === 'folder' && s.children) subjectsArray = subjectsArray.concat(s.children);
  });
  subjectsArray.forEach(s => {
    subjOptions += `<option value="${s.name}" ${s.name === subjValue ? 'selected' : ''}>${s.name}</option>`;
  });
  
  // Pre-fill startTime: current time for new entry, existing value for edit
  let startTimeValue = '';
  if (isEditing) {
    const editRow = DYNAMIC_DATA.journalEntries[dateValue] && DYNAMIC_DATA.journalEntries[dateValue].rows[idx];
    startTimeValue = (editRow && editRow.startTime) || '';
  } else {
    const nowT = new Date();
    startTimeValue = String(nowT.getHours()).padStart(2,'0') + ':' + String(nowT.getMinutes()).padStart(2,'0');
  }

  body.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <select id="ml-subj" class="st-select" onchange="onManualLogSubjChange()">${subjOptions}<option value="__custom__">Other...</option></select>
      <select id="ml-topic" class="st-select"><option value="${topicValue}">${topicValue || 'Select Topic'}</option></select>
      <input type="text" id="ml-task" class="st-input" placeholder="Task Description" value="${taskValue}">
      <input type="date" id="ml-date" class="st-input" value="${dateValue}" style="font-family:inherit;">
      <div style="display:flex; gap:10px;">
        <div style="flex:1"><label style="font-size:12px; color:var(--text-secondary);">Start Time</label><input type="time" id="ml-starttime" class="st-input" value="${startTimeValue}" style="margin-bottom:0; font-family:inherit;"></div>
        <div style="flex:1"><label style="font-size:12px; color:var(--text-secondary);">Hours</label><input type="number" id="ml-hh" class="st-input" min="0" value="${hhValue}" style="margin-bottom:0;"></div>
        <div style="flex:1"><label style="font-size:12px; color:var(--text-secondary);">Minutes</label><input type="number" id="ml-mm" class="st-input" min="0" max="59" value="${mmValue}" style="margin-bottom:0;"></div>
      </div>
      <button class="btn-primary" style="margin-top:10px; border-radius:10px;" onclick="saveManualLog()">${isEditing ? 'Update Log' : 'Save Log'}</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('show');
  
  if (isEditing && subjValue) {
    onManualLogSubjChange(topicValue);
  }
};

window.onManualLogSubjChange = function(prefillTopic) {
  const subSel = document.getElementById('ml-subj');
  const topSel = document.getElementById('ml-topic');
  if (!subSel || !topSel) return;
  const subj = subSel.value;
  topSel.innerHTML = '<option value="">Select Topic</option>';
  
  if (subj === '__custom__') {
    const name = prompt('Enter subject name:');
    if (name) {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      subSel.insertBefore(opt, subSel.querySelector('[value="__custom__"]'));
      subSel.value = name;
    } else { subSel.value = ''; return; }
  }
  
  if (subj && subj !== '__custom__') {
    let subjects = [];
    (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
      subjects.push(s);
    if (s.type === 'folder' && s.children) subjects = subjects.concat(s.children);
    });
    const sData = subjects.find(s => s.name === subj);
    if (sData && sData.chapters) {
      sData.chapters.forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch.name; opt.textContent = ch.name;
        if (typeof prefillTopic === 'string' && prefillTopic === ch.name) opt.selected = true;
        topSel.appendChild(opt);
      });
    }
  }
};

window.saveManualLog = function() {
  const subj = document.getElementById('ml-subj').value;
  const topic = document.getElementById('ml-topic').value;
  const task = document.getElementById('ml-task').value;
  const dateVal = document.getElementById('ml-date').value;
  const hh = parseInt(document.getElementById('ml-hh').value) || 0;
  const mm = parseInt(document.getElementById('ml-mm').value) || 0;
  const startTimeEl = document.getElementById('ml-starttime');
  const startTime = startTimeEl ? startTimeEl.value : '';
  
  if (!subj) { alert('Please select a subject'); return; }
  if (hh === 0 && mm === 0) { alert('Please enter duration'); return; }
  
  const targetDateStr = dateVal || getTodayStr();
  
  if (window.editingLogIdx !== undefined && window.editingLogDate) {
    if (DYNAMIC_DATA.journalEntries[window.editingLogDate] && DYNAMIC_DATA.journalEntries[window.editingLogDate].rows) {
      DYNAMIC_DATA.journalEntries[window.editingLogDate].rows.splice(window.editingLogIdx, 1);
    }
  }
  
  if (!DYNAMIC_DATA.journalEntries) DYNAMIC_DATA.journalEntries = {};
  if (!DYNAMIC_DATA.journalEntries[targetDateStr]) {
    DYNAMIC_DATA.journalEntries[targetDateStr] = { sleep: '', breaks: '', wasted: '', feeling: '', rows: [] };
  }
  
  if (!DYNAMIC_DATA.journalEntries[targetDateStr].rows) { DYNAMIC_DATA.journalEntries[targetDateStr].rows = []; }
  
  DYNAMIC_DATA.journalEntries[targetDateStr].rows.push({
    subject: subj,
    topic: topic,
    tasks: task,
    durHH: String(hh),
    durMM: String(mm),
    status: 'Done',
    startTime: startTime
  });
  
  saveDynamicData();
  closeModal();
  renderTodaysLog();
  
  window.editingLogIdx = undefined;
  window.editingLogDate = undefined;
};


// ==========================================
// ONBOARDING TUTORIAL
// ==========================================
window.startTutorial = function() {
  if (typeof driver === 'undefined' || !window.driver) {
    console.error("Driver.js is not loaded.");
    return;
  }
  
  const driverObj = window.driver.js.driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    steps: [
      {
        element: '.app-header h1',
        popover: {
          title: 'Select CA Final Group',
          description: 'Tap on the title to switch between CA Final Group 1 and Group 2. Your syllabus, planner, and schedule will update automatically.',
          side: "bottom", align: 'start'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#menuBtn',
        popover: {
          title: 'Settings & Tools',
          description: 'Access the Menu to change Theme colors, Export/Import backups, or turn on Edit Mode.',
          side: "bottom", align: 'end'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#editModeBtn',
        popover: {
          title: 'Edit Mode (Crucial!)',
          description: 'Turn this ON to edit your syllabus subjects, delete wrong logs, or customize planner tasks. Turn it OFF to prevent accidental clicks.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          switchTab('dashboard'); 
          openMenuModal(); 
          return new Promise(resolve => setTimeout(resolve, 100)); 
        }
      },
      {
        element: '#study-tracker-card',
        popover: {
          title: 'Live Study Tracker',
          description: 'Select your subject & topic, then hit Start to track your study sessions live. You can also pick directly from today\'s Planner tasks.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#tl-list',
        popover: {
          title: "Today's Log",
          description: 'Your saved sessions appear here. You can also add manual logs if you forgot to start the timer.',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { closeModal(); switchTab('dashboard'); }
      },
      {
        element: '#tab-planner .planner-actions',
        popover: {
          title: 'Daily Planner',
          description: 'Add your goals for the day. You can even copy unfinished tasks to tomorrow!',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('planner');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-syllabus .tab-header',
        popover: {
          title: 'Track Syllabus',
          description: 'Mark chapters as done when you finish Concepts, Q-Bank, or Revision Videos.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('syllabus');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-schedule .schedule-toggle',
        popover: {
          title: 'Master Schedule (Routines)',
          description: 'We have 2 schedules built-in: "Early Morning" for Early Birds, and "Late Night" for Night Owls. Switch between them here!',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('schedule');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-schedule .tab-header',
        popover: {
          title: 'Macro Timetable',
          description: 'Plan your long-term timeline, including your first pass, revisions, and mock periods down here.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('schedule');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '#tab-exams .tab-header',
        popover: {
          title: 'Mock Exams',
          description: 'Log your mock test scores and analyze your performance across different attempts.',
          side: "bottom", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('exams');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        element: '.bottom-nav',
        popover: {
          title: 'Navigation Tabs',
          description: 'Switch between Dashboard, Planner, Syllabus, Timetable, and Exams anytime. You are ready to crush your CA Finals!',
          side: "top", align: 'center'
        },
        onHighlightStarted: () => { 
          closeModal();
          switchTab('dashboard');
          return new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    ]
  });
  
  driverObj.drive();
};



function normalizeForHash(data) {
  if (Array.isArray(data)) {
    const arr = data.map(normalizeForHash).filter(v => v !== undefined && v !== null);
    return arr.length > 0 ? arr : undefined;
  } else if (typeof data === 'object' && data !== null) {
    const newObj = {};
    let hasKeys = false;
    const keys = Object.keys(data).sort();
    for (let k of keys) {
      const val = normalizeForHash(data[k]);
      if (val !== undefined && val !== null) {
        newObj[k] = val;
        hasKeys = true;
      }
    }
    return hasKeys ? newObj : undefined;
  }
  return data;
}

window.reloadAppFromCloud = function(cloudData) {
  if (!cloudData) return;
  
  let newDynamic = cloudData.dynamic || cloudData;
  let newState = cloudData.state || {};
  let newTracker = cloudData.tracker || {};
  
  const cleanTracker = {
    isRunning: !!newTracker.isRunning,
    isPaused: !!newTracker.isPaused,
    startTime: newTracker.startTime || null,
    pausedTime: newTracker.pausedTime || 0,
    pauseStart: newTracker.pauseStart || null,
    subject: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.subject || '') : '',
    topic: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.topic || '') : '',
    task: (newTracker.isRunning || newTracker.isPaused) ? (newTracker.task || '') : ''
  };

  const cleanLocalTracker = {
    isRunning: !!trackerState.isRunning,
    isPaused: !!trackerState.isPaused,
    startTime: trackerState.startTime || null,
    pausedTime: trackerState.pausedTime || 0,
    pauseStart: trackerState.pauseStart || null,
    subject: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.subject || '') : '',
    topic: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.topic || '') : '',
    task: (trackerState.isRunning || trackerState.isPaused) ? (trackerState.task || '') : ''
  };

  const localHash = JSON.stringify(normalizeForHash(DYNAMIC_DATA)) + JSON.stringify(normalizeForHash(loadState())) + JSON.stringify(normalizeForHash(cleanLocalTracker));
  const cloudHash = JSON.stringify(normalizeForHash(newDynamic)) + JSON.stringify(normalizeForHash(newState)) + JSON.stringify(normalizeForHash(cleanTracker));
  
  if (localHash !== cloudHash) {
    console.log("Cloud data differs. Applying sync...");
    localStorage.setItem(getDynamicDataKey(), JSON.stringify(newDynamic));
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
    
    if (cleanTracker.isRunning || cleanTracker.isPaused) {
      localStorage.setItem('ca_study_tracker_state', JSON.stringify(cleanTracker));
    } else {
      localStorage.removeItem('ca_study_tracker_state');
    }
    
    // Soft reload to apply changes without refreshing the browser
    loadDynamicData();
    loadState();
    restoreTrackerState();
    switchTab(state.activeTab);
    
    if (typeof showToast === 'function') {
      showToast("Data synced from cloud! <span class='material-symbols-rounded icon-sm' style='vertical-align:middle'>cloud_done</span>");
    }
  }

};


function smartRepairSyllabusData() {
  if (!DYNAMIC_DATA.syllabusSubjects) return;
  
  if (state.activeGroup === 'group1') {
    // Group 1 should NOT have DT, IDT, or IBS
    DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => {
      // Keep only fr, afm, audit
      return ['fr', 'afm', 'audit'].includes(s.id);
    });
    
    // Enforce full chapters for Group 1
    const g1Flat = DYNAMIC_DATA.syllabusSubjects;
    const enforceG1 = (id, defaultObj) => {
      let subj = g1Flat.find(s => s && s.id === id);
      if (!subj) {
        subj = JSON.parse(JSON.stringify(defaultObj));
        DYNAMIC_DATA.syllabusSubjects.push(subj);
      } else {
        subj.chapters = JSON.parse(JSON.stringify(defaultObj.chapters || []));
        subj.type = defaultObj.type; // Force restore type to 'main'
      }
    };
    
    enforceG1('fr', { id: 'fr', name: 'Paper 1: Financial Reporting', type: 'main', chapters: APP_DATA.group1.syllabusSubjects.find(s => s.id === 'fr').chapters });
    enforceG1('afm', { id: 'afm', name: 'Paper 2: AFM', type: 'main', chapters: APP_DATA.group1.syllabusSubjects.find(s => s.id === 'afm').chapters });
    enforceG1('audit', { id: 'audit', name: 'Paper 3: Advanced Auditing', type: 'main', chapters: APP_DATA.group1.syllabusSubjects.find(s => s.id === 'audit').chapters });

    saveDynamicData();
    return;
  }

  // Force reset DT and IDT chapters to match exactly with full APP_DATA lists
  let flat = [];
  const flatten = (arr) => {
    arr.forEach(s => {
      if (s.type === 'folder' && s.children) flatten(s.children);
      else flat.push(s);
    });
  };
  flatten(DYNAMIC_DATA.syllabusSubjects);
  
  const enforceSubject = (id, defaultObj) => {
    let subj = flat.find(s => s && s.id === id);
    if (!subj) {
      subj = JSON.parse(JSON.stringify(defaultObj));
      DYNAMIC_DATA.syllabusSubjects.push(subj);
    } else {
      subj.chapters = JSON.parse(JSON.stringify(defaultObj.chapters || []));
      subj.type = defaultObj.type; // Force restore type
      subj.name = defaultObj.name; // Force restore name to clear emojis
    }
  };

  enforceSubject('dt', { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: APP_DATA.group2.dtChapters });
  enforceSubject('idt', { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: APP_DATA.group2.idtChapters });
  
  ['fr', 'afm', 'audit', 'law', 'scpm'].forEach(key => {
    let nameMap = { fr: 'IBS — FR', afm: 'IBS — AFM', audit: 'IBS — Audit', law: 'IBS — Law (SPOM A)', scpm: 'IBS — SC&PM (SPOM B)' };
    enforceSubject('ibs-' + key, { id: 'ibs-' + key, name: nameMap[key], source: '', type: 'ibs', chapters: APP_DATA.group2.ibsSubjects[key].chapters });
  });

  DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => {
    if (s.id === 'ibs') return false; 
    return true;
  });

  const ibsOrder = ['ibs-fr', 'ibs-afm', 'ibs-audit', 'ibs-law', 'ibs-scpm'];
  
  // Find top-level ibs items if any (migration)
  const topLevelIbs = DYNAMIC_DATA.syllabusSubjects.filter(s => (s.type === 'ibs' || (s.id && s.id.startsWith('ibs-') && !s.children)));
  
  let folder = DYNAMIC_DATA.syllabusSubjects.find(s => s.id === 'ibs-folder');
  if (!folder) {
    folder = { id: 'ibs-folder', name: 'Paper 6: IBS (MCS)', source: 'Multidisciplinary Case Study', type: 'folder', children: [] };
    DYNAMIC_DATA.syllabusSubjects.push(folder);
  }
  
  // Move any top level ibs into folder
  if (topLevelIbs.length > 0) {
    topLevelIbs.forEach(item => {
      if (!folder.children.find(c => c.id === item.id)) folder.children.push(item);
    });
    DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || (s.id && s.id.startsWith('ibs-') && !s.children)));
  }
  
  // Force strict ordering by re-creating the array
  if (folder.children && folder.children.length > 0) {
    const newChildren = [];
    ibsOrder.forEach(id => {
      const child = folder.children.find(c => c.id === id);
      if (child) newChildren.push(child);
    });
    folder.children = newChildren;
  }

  saveDynamicData();
}


window.openMockPickerModal = function(target) {
  let html = '<div style="max-height: 60vh; overflow-y: auto;">';
  const mocks = DYNAMIC_DATA.mocks || [];
  if (mocks.length === 0) {
    html += '<div style="text-align:center; color:var(--text-secondary); padding:20px;">No Mock Series found in Exams tab.</div>';
  } else {
    mocks.forEach(series => {
      html += '<div style="margin-bottom: 15px;">' +
        '<h4 style="margin-top:0; margin-bottom: 8px; color:var(--primary-color);">' + series.name + '</h4>' +
        '<div style="display:flex; flex-direction:column; gap:8px;">';
      (series.tests || []).forEach(ex => {
        html += '<div class="glass-card" style="display:flex; justify-content:space-between; align-items:center; padding: 10px;">' +
          '<div>' +
            '<div style="font-weight:600; font-size:14px;">' + ex.subject + '</div>' +
            '<div style="font-size:12px; color:var(--text-secondary);">' + formatDateFull(new Date(ex.date)) + '</div>' +
          '</div>' +
          '<button class="btn-primary" style="padding:6px 12px; font-size:12px; border-radius:6px;" onclick="pickMockTask(\'' + series.name + '\', \'' + ex.subject + '\', \'' + target + '\')">Select</button>' +
        '</div>';
      });
      html += '</div></div>';
    });
  }
  html += '</div>';
  openModal('Select Mock', html);
};

window.pickMockTask = function(seriesName, mockSubject, target) {
  closeModal();
  const mockTaskName = mockSubject + ' Mock';
  const mockTopic = seriesName;
  
  if (target === 'tracker') {
    const subSel = document.getElementById('st-subject');
    const topSel = document.getElementById('st-topic');
    const descInput = document.getElementById('st-task-desc');
    
    let actualSubjName = mockSubject;
    let flat = [];
    (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
       flat.push(s);
       if (s.type === 'folder' && s.children) flat = flat.concat(s.children);
    });
    let matchedSubj = flat.find(s => s.name.toLowerCase().includes(mockSubject.toLowerCase()));
    if (matchedSubj) actualSubjName = matchedSubj.name;
    
    if (!Array.from(subSel.options).some(o => o.value === actualSubjName)) {
      const opt = document.createElement('option');
      opt.value = actualSubjName;
      opt.textContent = actualSubjName;
      subSel.appendChild(opt);
    }
    subSel.value = actualSubjName;
    onTrackerSubjectChange();
    
    if (!Array.from(topSel.options).some(o => o.value === mockTopic)) {
      const tOpt = document.createElement('option');
      tOpt.value = mockTopic;
      tOpt.textContent = mockTopic;
      topSel.appendChild(tOpt);
    }
    topSel.value = mockTopic;
    onTrackerTopicChange();
    
    descInput.value = mockTaskName;
    trackerState.taskDesc = mockTaskName;
    saveTrackerState();
    
  } else if (target === 'manual') {
    openManualLogModal();
    
    setTimeout(() => {
      const subSel = document.getElementById('ml-subj');
      const topSel = document.getElementById('ml-topic');
      const taskInput = document.getElementById('ml-task');
      
      let actualSubjName = mockSubject;
      let flat = [];
      (DYNAMIC_DATA.syllabusSubjects || []).forEach(s => {
         flat.push(s);
       if (s.type === 'folder' && s.children) flat = flat.concat(s.children);
      });
      let matchedSubj = flat.find(s => s.name.toLowerCase().includes(mockSubject.toLowerCase()));
      if (matchedSubj) actualSubjName = matchedSubj.name;
      
      if (!Array.from(subSel.options).some(o => o.value === actualSubjName)) {
        const opt = document.createElement('option');
        opt.value = actualSubjName;
        opt.textContent = actualSubjName;
        subSel.insertBefore(opt, subSel.querySelector('option[value="__custom__"]'));
      }
      subSel.value = actualSubjName;
      onManualLogSubjChange();
      
      if (!Array.from(topSel.options).some(o => o.value === mockTopic)) {
        const tOpt = document.createElement('option');
        tOpt.value = mockTopic;
        tOpt.textContent = mockTopic;
        topSel.appendChild(tOpt);
      }
      topSel.value = mockTopic;
      taskInput.value = mockTaskName;
    }, 50);
  }
};


window.switchLogModalTab = function(tabName) {
  document.getElementById('log-tab-stats').classList.toggle('active', tabName === 'stats');
  document.getElementById('log-tab-history').classList.toggle('active', tabName === 'history');
  
  document.getElementById('log-modal-stats').style.display = tabName === 'stats' ? 'block' : 'none';
  document.getElementById('log-modal-history').style.display = tabName === 'history' ? 'block' : 'none';
};

window.renderHistoryForDate = function(dateStr) {
  const container = document.getElementById('log-history-list');
  if (!dateStr) {
    container.innerHTML = '<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">Please select a date.</div>';
    return;
  }
  
  const d = new Date(dateStr);
  const formattedDate = formatDate(d); // e.g. "Mon, 22 Jul 2026"
  const isoDate = d.toISOString().split('T')[0]; // "2026-07-22"
  
  // DYNAMIC_DATA.journalEntries uses strings like "Mon, 22 Jul 2026" or similar format from getTodayStr()
  // Wait, getTodayStr() returns formatDate(new Date())! So the key is formattedDate.
  
  let entries = (DYNAMIC_DATA.journalEntries && DYNAMIC_DATA.journalEntries[formattedDate] && DYNAMIC_DATA.journalEntries[formattedDate].rows) || [];
  
  if (entries.length === 0) {
    // Try iso date as fallback just in case
    entries = (DYNAMIC_DATA.journalEntries && DYNAMIC_DATA.journalEntries[isoDate] && DYNAMIC_DATA.journalEntries[isoDate].rows) || [];
  }
  
  container.innerHTML = '';
  let totalMinutes = 0;
  
  if (entries.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">No logs found for this date.</div>';
    document.getElementById('log-history-total').textContent = 'Total: 0h 0m';
    return;
  }
  
  entries.forEach((row) => {
    let durText = '';
    const h = parseInt(row.durHH) || 0;
    const m = parseInt(row.durMM) || 0;
    totalMinutes += (h * 60) + m;
    
    if (h > 0) durText += h + 'h ';
    if (m > 0 || h === 0) durText += m + 'm';
    
    const div = document.createElement('div');
    div.style.background = 'rgba(255,255,255,0.03)';
    div.style.border = '1px solid var(--border-color)';
    div.style.borderRadius = '8px';
    div.style.padding = '10px';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'flex-start';
    
    div.innerHTML = `
      <div style="flex:1;">
        <div style="font-weight:600; font-size:14px; color:var(--text-primary);">${row.subject}</div>
        <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${row.topic}</div>
        ${row.taskDesc ? `<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">${row.taskDesc}</div>` : ''}
      </div>
      <div style="font-size:13px; font-weight:bold; color:var(--primary-color); white-space:nowrap; margin-left:10px;">${durText}</div>
    `;
    container.appendChild(div);
  });
  
  const th = Math.floor(totalMinutes / 60);
  const tm = totalMinutes % 60;
  document.getElementById('log-history-total').textContent = `Total: ${th}h ${tm}m`;
};

window.updateDailyAverage = function(newDateStr, totalMins, fromUser = false) {
  if (fromUser && newDateStr) {
    DYNAMIC_DATA.studyStartDate = newDateStr;
    saveDynamicData();
  }
  if (!newDateStr) return;
  
  const startDt = new Date(newDateStr);
  startDt.setHours(0,0,0,0);
  const nowDt = new Date();
  nowDt.setHours(0,0,0,0);
  
  const diffTime = nowDt.getTime() - startDt.getTime();
  const totalDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  
  const avgMins = Math.round(totalMins / totalDays);
  const ah = Math.floor(avgMins / 60);
  const am = avgMins % 60;
  
  const valEl = document.getElementById('stats-daily-avg-val');
  const daysEl = document.getElementById('stats-daily-avg-days');
  if (valEl) valEl.textContent = `${ah}h ${am}m / day`;
  if (daysEl) daysEl.textContent = `over ${totalDays} day${totalDays > 1 ? 's' : ''}`;
};

window.openLogHistoryModal = function() {
  const subjectStats = {};
  let totalMinutes = 0;
  
  // Aggregate stats
  if (DYNAMIC_DATA.journalEntries) {
    Object.keys(DYNAMIC_DATA.journalEntries).forEach(dateKey => {
      const dayData = DYNAMIC_DATA.journalEntries[dateKey];
      if (dayData && dayData.rows) {
        dayData.rows.forEach(row => {
          const h = parseInt(row.durHH) || 0;
          const m = parseInt(row.durMM) || 0;
          const mins = (h * 60) + m;
          
          totalMinutes += mins;
          
          let aggSubject = row.subject;
          if (aggSubject && (aggSubject.toLowerCase().startsWith('ibs') || aggSubject.toLowerCase().includes('paper 6'))) {
            aggSubject = 'Paper 6: IBS (Integrated Business Solutions)';
          }
          
          if (!subjectStats[aggSubject]) subjectStats[aggSubject] = 0;
          subjectStats[aggSubject] += mins;
        });
      }
    });
  }
  
  // Build stats HTML
  let statsHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
  
  function getSubjWeight(name) {
    const n = name.toLowerCase();
    if (n.includes('direct tax') || n === 'dt' || n.includes('paper 4')) return 1;
    if (n.includes('indirect tax') || n === 'idt' || n.includes('paper 5')) return 2;
    if (n.includes('ibs') || n.includes('paper 6')) return 3;
    return 99;
  }
  
  const sortedSubjects = Object.keys(subjectStats).sort((a, b) => {
    const wa = getSubjWeight(a);
    const wb = getSubjWeight(b);
    if (wa !== wb) return wa - wb;
    return subjectStats[b] - subjectStats[a]; // then by time descending
  });
  
  if (sortedSubjects.length === 0) {
    statsHtml += '<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">No study data logged yet.</div>';
  } else {
    sortedSubjects.forEach(subj => {
      const mins = subjectStats[subj];
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      statsHtml += `
        <div class="glass-card" style="padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:600; font-size:13px; color:var(--text-primary);">${subj}</div>
          <div style="font-weight:bold; font-size:13px; color:var(--primary-color);">${h}h ${m}m</div>
        </div>
      `;
    });
  }
  
  const gh = Math.floor(totalMinutes / 60);
  const gm = totalMinutes % 60;
  
  let startDateIso = DYNAMIC_DATA.studyStartDate;
  if (!startDateIso) {
    let earliestTs = Infinity;
    if (DYNAMIC_DATA.journalEntries) {
      Object.keys(DYNAMIC_DATA.journalEntries).forEach(dateKey => {
        const dData = DYNAMIC_DATA.journalEntries[dateKey];
        if (dData && dData.rows && dData.rows.length > 0) {
          const dt = new Date(dateKey);
          if (!isNaN(dt.getTime()) && dt.getTime() < earliestTs) {
            earliestTs = dt.getTime();
          }
        }
      });
    }
    if (earliestTs !== Infinity) {
      startDateIso = new Date(earliestTs).toISOString().split('T')[0];
    } else {
      startDateIso = new Date().toISOString().split('T')[0];
    }
  }
  
  statsHtml += `
    <div class="glass-card" style="margin-top:15px; padding:12px; border: 1px solid var(--border-color); border-radius:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; color:var(--text-secondary); margin-bottom:12px;">
        <span style="font-weight:600;">Study Start Date:</span>
        <input type="date" id="stats-start-date" class="st-input" style="width:140px; padding:4px 8px; font-size:12px; margin-bottom:0; border-radius:6px;" value="${startDateIso}" onchange="updateDailyAverage(this.value, ${totalMinutes}, true)">
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        <div style="padding:10px; background: rgba(52,199,89,0.1); border: 1px solid var(--success-color); border-radius: 8px; text-align:center;">
          <div style="font-size:11px; color:var(--success-color); text-transform:uppercase; font-weight:bold; letter-spacing:0.5px;">All-Time Total</div>
          <div style="font-size:18px; font-weight:bold; color:var(--text-primary); margin-top:5px;">${gh}h ${gm}m</div>
        </div>
        <div style="padding:10px; background: rgba(10,132,255,0.1); border: 1px solid var(--primary-color); border-radius: 8px; text-align:center;">
          <div style="font-size:11px; color:var(--primary-color); text-transform:uppercase; font-weight:bold; letter-spacing:0.5px;">Daily Average</div>
          <div id="stats-daily-avg-val" style="font-size:18px; font-weight:bold; color:var(--text-primary); margin-top:5px;">0h 0m / day</div>
          <div id="stats-daily-avg-days" style="font-size:10px; color:var(--text-muted); margin-top:2px;">over 0 days</div>
        </div>
      </div>
    </div>
  </div>`;
  
  // Build Calendar HTML
  const tDt = new Date();
  const yr = tDt.getFullYear();
  const mo = tDt.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay(); // 0(Sun) to 6(Sat)
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const calMonthName = new Date(yr, mo).toLocaleString('default', { month: 'long', year: 'numeric' });
  const cData = DYNAMIC_DATA.consistency || { dailyLog: {} };
  const tStr = getTodayStr();
  
  // Build History HTML
  window.currentHistoryDate = new Date().toISOString().split('T')[0];
  window.currentHistoryMonth = new Date().getMonth();
  window.currentHistoryYear = new Date().getFullYear();

  const historyHtml = `
    <div id="log-history-calendar-container"></div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);" id="log-history-selected-date-label">Today</span>
      <span id="log-history-total" style="font-size: 13px; font-weight: 600; color: var(--primary-color);">Total: 0h 0m</span>
    </div>
    <div id="log-history-list" style="display:flex; flex-direction:column; gap:8px;"></div>
  `;
  const html = `
    <div style="display:flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
      <button id="log-tab-stats" class="st-tab-btn active" style="flex:1; padding:8px; border:none; background:transparent; color:var(--text-primary); font-weight:600; cursor:pointer;" onclick="switchLogModalTab('stats')">All-Time Stats</button>
      <button id="log-tab-history" class="st-tab-btn" style="flex:1; padding:8px; border:none; background:transparent; color:var(--text-secondary); font-weight:600; cursor:pointer;" onclick="switchLogModalTab('history')">Daily History</button>
    </div>
    
    <div id="log-modal-stats" style="max-height: 55vh; overflow-y: auto;">
      ${statsHtml}
    </div>
    
    <div id="log-modal-history" style="display:none; max-height: 55vh; overflow-y: auto;">
      <div id="log-history-calendar-container"></div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);" id="log-history-selected-date-label">Today</span>
        <span id="log-history-total" style="font-size: 13px; font-weight: 600; color: var(--primary-color);">Total: 0h 0m</span>
      </div>
      <div id="log-history-list" style="display:flex; flex-direction:column; gap:8px;">
      </div>
    </div>
  `;
  
  openModal('Log History & Stats', html);
  
  const styleId = 'log-tabs-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .st-tab-btn.active { border-bottom: 2px solid var(--primary-color) !important; color: var(--primary-color) !important; }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    window.renderHistoryCalendar(window.currentHistoryYear, window.currentHistoryMonth);
    window.selectHistoryDate(window.currentHistoryDate);
    const startEl = document.getElementById('stats-start-date');
    if (startEl) updateDailyAverage(startEl.value, totalMinutes, false);
  }, 50);
};

window.changeHistoryMonth = function(offset) {
  window.currentHistoryMonth += offset;
  if (window.currentHistoryMonth < 0) {
    window.currentHistoryMonth = 11;
    window.currentHistoryYear--;
  } else if (window.currentHistoryMonth > 11) {
    window.currentHistoryMonth = 0;
    window.currentHistoryYear++;
  }
  window.renderHistoryCalendar(window.currentHistoryYear, window.currentHistoryMonth);
};

window.selectHistoryDate = function(dStr) {
  window.currentHistoryDate = dStr;
  window.renderHistoryCalendar(window.currentHistoryYear, window.currentHistoryMonth);
  renderHistoryForDate(dStr);
  
  const lbl = document.getElementById('log-history-selected-date-label');
  if (lbl) {
    const tStr = getTodayStr();
    if (dStr === tStr) lbl.innerText = 'Today';
    else {
      const parts = dStr.split('-');
      lbl.innerText = new Date(parts[0], parts[1]-1, parts[2]).toLocaleDateString('default', { month:'short', day:'numeric' });
    }
  }
};

window.renderHistoryCalendar = function(yr, mo) {
  const container = document.getElementById('log-history-calendar-container');
  if (!container) return;
  
  const firstDay = new Date(yr, mo, 1).getDay(); // 0(Sun) to 6(Sat)
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const calMonthName = new Date(yr, mo).toLocaleString('default', { month: 'long', year: 'numeric' });
  const cData = DYNAMIC_DATA.consistency || { dailyLog: {} };
  const tStr = getTodayStr();
  
  let calHtml = `
    <div style="background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:10px; padding:12px; margin-bottom:15px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <button onclick="changeHistoryMonth(-1)" class="icon-btn" style="padding:4px;"><span class="material-symbols-rounded" style="font-size:20px;">chevron_left</span></button>
        <div style="font-weight:600; font-size:14px; color:var(--primary-color);">
          ${calMonthName}
        </div>
        <button onclick="changeHistoryMonth(1)" class="icon-btn" style="padding:4px;"><span class="material-symbols-rounded" style="font-size:20px;">chevron_right</span></button>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center; margin-bottom:6px;">
        <div style="font-size:10px; color:var(--text-muted); padding:2px;">Su</div>
        <div style="font-size:10px; color:var(--text-muted); padding:2px;">Mo</div>
        <div style="font-size:10px; color:var(--text-muted); padding:2px;">Tu</div>
        <div style="font-size:10px; color:var(--text-muted); padding:2px;">We</div>
        <div style="font-size:10px; color:var(--text-muted); padding:2px;">Th</div>
        <div style="font-size:10px; color:var(--text-muted); padding:2px;">Fr</div>
        <div style="font-size:10px; color:var(--text-muted); padding:2px;">Sa</div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center;">
  `;
  for (let i = 0; i < firstDay; i++) calHtml += `<div></div>`;
  
  for (let day = 1; day <= daysInMo; day++) {
    const dStr = yr + '-' + String(mo+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
    const log = cData.dailyLog[dStr];
    const pct = log ? log.adherencePct : 0;
    const isFuture = dStr > tStr;
    const isSelected = dStr === window.currentHistoryDate;
    
    let bg = 'rgba(255,255,255,0.03)';
    let border = '1px solid rgba(255,255,255,0.05)';
    let color = 'var(--text-secondary)';
    
    if (!isFuture) {
      if (pct >= 80) { bg = 'var(--success)'; border = '1px solid var(--success)'; color = '#fff'; }
      else if (pct > 0) { bg = 'var(--warning)'; border = '1px solid var(--warning)'; color = '#12141e'; }
      else if (dStr < tStr) {
        color = 'var(--text-muted)';
      }
    }
    
    if (isSelected) {
      border = '1.5px solid var(--primary)';
      if (bg === 'rgba(255,255,255,0.03)') {
         bg = 'var(--purple-glow)'; 
         color = 'var(--text-primary)';
      }
    }
    
    calHtml += `<div onclick="selectHistoryDate('${dStr}')" style="background:${bg}; border:${border}; color:${color}; font-size:12px; padding:6px 0; border-radius:4px; cursor:pointer; font-weight:500; transition:all 0.2s ease;" title="${dStr}">${day}</div>`;
  }
  calHtml += `</div></div>`;
  
  container.innerHTML = calHtml;
};

// --- OTA UPDATES VIA CAPGO ---
async function checkForUpdates() {
  try {
    showToast('Checking for updates...', 'info');
    
    // Check if we are running in Capacitor Native Environment
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.CapacitorUpdater) {
      showToast('App is running in browser. Use browser refresh to update.', 'warning');
      return;
    }

    const { CapacitorUpdater } = window.Capacitor.Plugins;

    // 1. Fetch latest release from GitHub API
    const response = await fetch('https://api.github.com/repos/carajat/ca-study-app/releases/latest');
    if (!response.ok) throw new Error('Failed to fetch release info');
    
    const release = await response.json();
    const latestVersion = release.tag_name; // e.g., 'v20230808123456'
    
    // Find update.zip asset
    const zipAsset = release.assets.find(a => a.name === 'update.zip');
    if (!zipAsset) {
      showToast('No update package found in the latest release.', 'error');
      return;
    }

    // Check current version — use localStorage as the single source of truth
    // BUILD_VERSION is set at build time in version.js, but after OTA it won't change
    // So we always trust localStorage over BUILD_VERSION
    const installedOtaVersion = localStorage.getItem('app_ota_version');
    const buildVer = typeof BUILD_VERSION !== 'undefined' && BUILD_VERSION !== 'unknown' ? BUILD_VERSION : null;
    const currentVersion = installedOtaVersion || buildVer || null;
    
    // If we already have this version, we're up to date
    if (currentVersion && currentVersion === latestVersion) {
      showToast('App is already up to date! ✓', 'success');
      return;
    }

    // New version available! Prompt user.
    openModal('', `
      <div style="text-align:center; padding: 8px 0;">
        <div style="width:48px; height:48px; border-radius:50%; background:rgba(48,209,88,0.15); border:1px solid rgba(48,209,88,0.4); display:flex; align-items:center; justify-content:center; margin:0 auto 14px;">
          <span class="material-symbols-rounded" style="color:#30d158; font-size:22px;">system_update</span>
        </div>
        <div style="font-size:16px; font-weight:800; margin-bottom:7px;">Update Available</div>
        <div style="font-size:13px; color:var(--text-muted); line-height:1.55; margin-bottom:20px;">Version <b style="color:var(--text-primary);">${latestVersion}</b> is ready to install. This will restart the app.</div>
        <div style="display:flex; gap:10px;">
          <button class="menu-btn btn-neutral" style="flex:1; margin:0; text-align:center;" onclick="closeModal()">Later</button>
          <button class="menu-btn" style="flex:1; margin:0; text-align:center; background:var(--primary); color:var(--on-primary); border:none;" onclick="applyOTAUpdate('${latestVersion}', '${zipAsset.browser_download_url}')">Install Now</button>
        </div>
      </div>
    `);

  } catch (error) {
    console.error('Update Error:', error);
    showToast('Failed to check for updates', 'error');
  }
}

window.applyOTAUpdate = async function(latestVersion, downloadUrl) {
  closeModal();
  showToast('Downloading update...', 'info');
  try {
    const { CapacitorUpdater } = window.Capacitor.Plugins;
    const bundle = await CapacitorUpdater.download({
      url: downloadUrl,
      version: latestVersion
    });
    
    // Save version BEFORE applying so it persists across reload
    localStorage.setItem('app_ota_version', latestVersion);
    
    await CapacitorUpdater.set({ id: bundle.id });
    showToast('Update installed. Restarting...', 'success');
    setTimeout(async () => {
      await CapacitorUpdater.reload();
    }, 1000);
  } catch(e) {
    console.error(e);
    // Rollback the version if install failed
    localStorage.removeItem('app_ota_version');
    showToast('Update failed to install: ' + e.message, 'error');
  }
};


// Notify Capgo that the app loaded successfully (prevents auto-rollback)
document.addEventListener('DOMContentLoaded', () => {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater) {
    // Small delay to ensure app is truly loaded and stable
    setTimeout(() => {
      window.Capacitor.Plugins.CapacitorUpdater.notifyAppReady();
    }, 3000);
  }
});

