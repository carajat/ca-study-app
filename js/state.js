// ========================================
// state.js — App State & localStorage
// ========================================

import { showToast } from './utils.js';

// ─── State ──────────────────────────────
export let state = {
  activeGroup: localStorage.getItem('ca_app_prefs_group') || 'group1',
  activeTab: 'dashboard',
  activeSchedule: 'earlyMorning',
  plannerDate: new Date(),
  calendarMonth: new Date(),
  syllabusView: 'list', // 'list' or 'detail'
  activeSubject: null
};

// ─── Dynamic Data State ─────────────────
export let DYNAMIC_DATA = null;
export let isEditMode = false;

export function setEditMode(val) { isEditMode = val; }

export function getDynamicDataKey() { return state.activeGroup === 'group2' ? 'ca_dynamic_data' : 'ca_dynamic_data_group1'; }
export function getStorageKey() { return state.activeGroup === 'group2' ? 'ca_final_tracker' : 'ca_final_tracker_group1'; }

export function switchGroup(groupId) {
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


  if (typeof window.smartRepairSyllabusData === 'function') window.smartRepairSyllabusData();
  const groupSel = document.getElementById('group-selector');
  if (groupSel) groupSel.value = state.activeGroup;
  if (typeof window.switchTab === 'function') window.switchTab('dashboard'); // This will also re-render everything
}

export function loadDynamicData() {
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
      if (!window.APP_DATA[state.activeGroup]) throw new Error("APP_DATA missing group");
      DYNAMIC_DATA = JSON.parse(JSON.stringify(window.APP_DATA[state.activeGroup]));
    } catch(e) {
      console.error(e);
      DYNAMIC_DATA = JSON.parse(JSON.stringify(window.APP_DATA.group2 || window.APP_DATA));
    }
  
  } else {
    DYNAMIC_DATA = parsedData;
    for (let key in window.APP_DATA[state.activeGroup]) {
      if (!(key in DYNAMIC_DATA)) {
        DYNAMIC_DATA[key] = JSON.parse(JSON.stringify(window.APP_DATA[state.activeGroup][key]));
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
      if (window.APP_DATA.group1.mocks && Array.isArray(window.APP_DATA.group1.mocks)) {
         // Need to run the new structure
      }
      
      const newMocks = [];
      if (!Array.isArray(window.APP_DATA.group1.mocks)) {
         Object.keys(window.APP_DATA.group1.mocks).forEach((key, idx) => {
            newMocks.push({ id: key, name: 'Series ' + (idx + 1), tests: window.APP_DATA.group1.mocks[key] });
         });
      } else {
         newMocks.push(...window.APP_DATA.group1.mocks);
      }
      
      DYNAMIC_DATA.mocks = newMocks.length > 0 ? newMocks : DYNAMIC_DATA.mocks;
      if (window.APP_DATA.group1.finalExams.length > 0) DYNAMIC_DATA.finalExams = JSON.parse(JSON.stringify(window.APP_DATA.group1.finalExams));
      if (window.APP_DATA.group1.syllabusSubjects.length > 0) DYNAMIC_DATA.syllabusSubjects = JSON.parse(JSON.stringify(window.APP_DATA.group1.syllabusSubjects));
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

  if (!DYNAMIC_DATA.syllabusSubjects || DYNAMIC_DATA.syllabusSubjects.length === 0) {
    DYNAMIC_DATA.syllabusSubjects = [
      { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: DYNAMIC_DATA.dtChapters || window.APP_DATA.group2.dtChapters },
      { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: DYNAMIC_DATA.idtChapters || window.APP_DATA.group2.idtChapters },
      { id: 'ibs-fr', name: 'IBS — FR', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.fr) ? DYNAMIC_DATA.ibsSubjects.fr.chapters : window.APP_DATA.group2.ibsSubjects.fr.chapters },
      { id: 'ibs-afm', name: 'IBS — AFM', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.afm) ? DYNAMIC_DATA.ibsSubjects.afm.chapters : window.APP_DATA.group2.ibsSubjects.afm.chapters },
      { id: 'ibs-audit', name: 'IBS — Audit', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.audit) ? DYNAMIC_DATA.ibsSubjects.audit.chapters : window.APP_DATA.group2.ibsSubjects.audit.chapters },
      { id: 'ibs-law', name: 'IBS — Law (SPOM A)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.law) ? DYNAMIC_DATA.ibsSubjects.law.chapters : window.APP_DATA.group2.ibsSubjects.law.chapters },
      { id: 'ibs-scpm', name: 'IBS — SC&PM (SPOM B)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.scpm) ? DYNAMIC_DATA.ibsSubjects.scpm.chapters : window.APP_DATA.group2.ibsSubjects.scpm.chapters }
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
}

export function saveDynamicData() {
  if (window.isReadOnlyMode) { if(typeof showToast === "function") showToast("Read-Only Mode: Changes will not be saved."); return; }
  localStorage.setItem(getDynamicDataKey(), JSON.stringify(DYNAMIC_DATA));
  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud({ dynamic: DYNAMIC_DATA, state: loadState(), tracker: (window.trackerState || {}) });
  }

}

// ─── Storage Helper ─────────────────────

export function loadState() {
  try {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Load error:', e); }
  return {};
}

export function saveState(data) {
  try {
    const existing = loadState();
    const merged = { ...existing, ...data };
    localStorage.setItem(getStorageKey(), JSON.stringify(merged));
  if (typeof window.syncToCloud === 'function') {
    window.syncToCloud({ dynamic: DYNAMIC_DATA, state: loadState(), tracker: (window.trackerState || {}) });
  }

  } catch (e) { console.error('Save error:', e); }
}

export function getSyllabusProgress() {
  return loadState().syllabusProgress || {};
}

export function saveSyllabusProgress(progress) {
  saveState({ syllabusProgress: progress });
}

export function getMockScores() {
  return loadState().mockScores || {};
}

export function saveMockScore(mockId, score, notes) {
  const scores = getMockScores();
  scores[mockId] = { score: parseInt(score), notes, date: new Date().toISOString() };
  saveState({ mockScores: scores });
}

export function getPlannerTasks() {
  return loadState().plannerTasks || {};
}

export function savePlannerTasks(tasks) {
  saveState({ plannerTasks: tasks });
}

// ─── Window Attachments ─────────────────
window.switchGroup = switchGroup;
window.saveDynamicData = saveDynamicData;
