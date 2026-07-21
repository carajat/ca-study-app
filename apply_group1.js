const fs = require('fs');

// 1. DATA.JS
let data = fs.readFileSync('data.js', 'utf8');
data = data.replace('const APP_DATA = {', 'const APP_DATA_GROUP2 = {');
data += `
const APP_DATA_GROUP1 = {
  exam: {
    name: "CA Final Group 1",
    date: "2026-05-01T14:00:00+05:30",
    scheme: "New Scheme"
  },
  schedules: APP_DATA_GROUP2.schedules,
  mocks: [],
  finalExams: [],
  syllabusSubjects: [],
  quotes: APP_DATA_GROUP2.quotes
};

const APP_DATA = {
  group1: APP_DATA_GROUP1,
  group2: APP_DATA_GROUP2
};
`;
fs.writeFileSync('data.js', data);


// 2. APP.JS
let app = fs.readFileSync('app.js', 'utf8');

// Add activeGroup to state
app = app.replace(
  "activeTab: 'dashboard',",
  "activeGroup: localStorage.getItem('ca_app_prefs_group') || 'group2',\n  activeTab: 'dashboard',"
);

// Add dynamic keys and switch function
const dynamicKeys = `
function getDynamicDataKey() { return state.activeGroup === 'group2' ? 'ca_dynamic_data' : 'ca_dynamic_data_group1'; }
function getStorageKey() { return state.activeGroup === 'group2' ? 'ca_final_tracker' : 'ca_final_tracker_group1'; }

function switchGroup(groupId) {
  state.activeGroup = groupId;
  localStorage.setItem('ca_app_prefs_group', groupId);
  loadDynamicData();
  switchTab('dashboard'); // This will also re-render everything
}
`;

app = app.replace('function loadDynamicData() {', dynamicKeys + '\nfunction loadDynamicData() {');

// Fix loadDynamicData
app = app.replace(
  "const savedData = localStorage.getItem('ca_dynamic_data');",
  "const savedData = localStorage.getItem(getDynamicDataKey());"
);
app = app.replace(
  "DYNAMIC_DATA = JSON.parse(JSON.stringify(APP_DATA));",
  "DYNAMIC_DATA = JSON.parse(JSON.stringify(APP_DATA[state.activeGroup]));"
);
app = app.replace(
  "for (let key in APP_DATA) {",
  "for (let key in APP_DATA[state.activeGroup]) {"
);
app = app.replace(
  "DYNAMIC_DATA[key] = JSON.parse(JSON.stringify(APP_DATA[key]));",
  "DYNAMIC_DATA[key] = JSON.parse(JSON.stringify(APP_DATA[state.activeGroup][key]));"
);

// Fix syllabus migration in loadDynamicData
const oldMigration = `if (!DYNAMIC_DATA.syllabusSubjects) {
    DYNAMIC_DATA.syllabusSubjects = [
      { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: DYNAMIC_DATA.dtChapters || APP_DATA.dtChapters },
      { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: DYNAMIC_DATA.idtChapters || APP_DATA.idtChapters },
      { id: 'ibs-afm', name: 'IBS — AFM', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.afm) ? DYNAMIC_DATA.ibsSubjects.afm.chapters : APP_DATA.ibsSubjects.afm.chapters },
      { id: 'ibs-fr', name: '📋 IBS — FR', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.fr) ? DYNAMIC_DATA.ibsSubjects.fr.chapters : APP_DATA.ibsSubjects.fr.chapters },
      { id: 'ibs-audit', name: 'IBS — Audit', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.audit) ? DYNAMIC_DATA.ibsSubjects.audit.chapters : APP_DATA.ibsSubjects.audit.chapters },
      { id: 'ibs-law', name: '⚖️ IBS — Law (SPOM A)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.law) ? DYNAMIC_DATA.ibsSubjects.law.chapters : APP_DATA.ibsSubjects.law.chapters },
      { id: 'ibs-scpm', name: 'IBS — SC&PM (SPOM B)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.scpm) ? DYNAMIC_DATA.ibsSubjects.scpm.chapters : APP_DATA.ibsSubjects.scpm.chapters }
    ];
    saveDynamicData();
  }`;

const newMigration = `if (!DYNAMIC_DATA.syllabusSubjects) {
    if (state.activeGroup === 'group2') {
      DYNAMIC_DATA.syllabusSubjects = [
        { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: DYNAMIC_DATA.dtChapters || APP_DATA.group2.dtChapters },
        { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: DYNAMIC_DATA.idtChapters || APP_DATA.group2.idtChapters },
        { id: 'ibs-afm', name: 'IBS — AFM', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.afm) ? DYNAMIC_DATA.ibsSubjects.afm.chapters : APP_DATA.group2.ibsSubjects.afm.chapters },
        { id: 'ibs-fr', name: '📋 IBS — FR', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.fr) ? DYNAMIC_DATA.ibsSubjects.fr.chapters : APP_DATA.group2.ibsSubjects.fr.chapters },
        { id: 'ibs-audit', name: 'IBS — Audit', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.audit) ? DYNAMIC_DATA.ibsSubjects.audit.chapters : APP_DATA.group2.ibsSubjects.audit.chapters },
        { id: 'ibs-law', name: '⚖️ IBS — Law (SPOM A)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.law) ? DYNAMIC_DATA.ibsSubjects.law.chapters : APP_DATA.group2.ibsSubjects.law.chapters },
        { id: 'ibs-scpm', name: 'IBS — SC&PM (SPOM B)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.scpm) ? DYNAMIC_DATA.ibsSubjects.scpm.chapters : APP_DATA.group2.ibsSubjects.scpm.chapters }
      ];
    } else {
      DYNAMIC_DATA.syllabusSubjects = [];
    }
    saveDynamicData();
  }`;

app = app.replace(oldMigration, newMigration);

// Fix saveDynamicData
app = app.replace(
  "localStorage.setItem('ca_dynamic_data', JSON.stringify(DYNAMIC_DATA));",
  "localStorage.setItem(getDynamicDataKey(), JSON.stringify(DYNAMIC_DATA));"
);

// Fix loadState and saveState
app = app.replace(
  "const STORAGE_KEY = 'ca_final_tracker';",
  "" // we already put getStorageKey above
);
app = app.replace(
  "const saved = localStorage.getItem(STORAGE_KEY);",
  "const saved = localStorage.getItem(getStorageKey());"
);
app = app.replace(
  "localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));",
  "localStorage.setItem(getStorageKey(), JSON.stringify(merged));"
);

// Fix data export/import to respect the current group
app = app.replace(
  "const data = localStorage.getItem(STORAGE_KEY) || '{}';",
  "const data = localStorage.getItem(getStorageKey()) || '{}';"
);

// For exportData we also export ca_dynamic_data
app = app.replace(
  "const blob = new Blob([data], { type: 'application/json' });",
  "const exportPayload = { trackerData: JSON.parse(data), dynamicData: DYNAMIC_DATA };\n  const blob = new Blob([JSON.stringify(exportPayload)], { type: 'application/json' });"
);

// Wait, the original import/export didn't export dynamicData! It only exported STORAGE_KEY!
// Wait! Let's check original exportData:
// async function exportData() {
//   const data = localStorage.getItem(STORAGE_KEY) || '{}';
//   const blob = new Blob([data], { type: 'application/json' });
// Actually we should just export the whole payload and import it.
// I will not overcomplicate the replace string, I'll just rewrite export/import functions.

const newExportImport = `
async function exportData() {
  const trackerData = loadState();
  const exportPayload = { trackerData, dynamicData: DYNAMIC_DATA, group: state.activeGroup };
  const blob = new Blob([JSON.stringify(exportPayload)], { type: 'application/json' });
  const file = new File([blob], 'ca-progress-' + state.activeGroup + '.json', { type: 'application/json' });
  
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'CA Progress Backup',
        text: 'Here is my CA Final progress backup for ' + state.activeGroup
      });
    } catch(e) { downloadFile(file); }
  } else { downloadFile(file); }
  closeModal();
}

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url);
}

function triggerImport() { document.getElementById('import-file').click(); closeModal(); }

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.trackerData && parsed.dynamicData) {
        // New format
        localStorage.setItem(getStorageKey(), JSON.stringify(parsed.trackerData));
        localStorage.setItem(getDynamicDataKey(), JSON.stringify(parsed.dynamicData));
      } else {
        // Old format
        localStorage.setItem(getStorageKey(), JSON.stringify(parsed));
      }
      showToast('Backup restored successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch(err) {
      showToast('Error restoring backup. Invalid file.');
    }
  };
  reader.readAsText(file);
}
`;

// Replace all of exportData/triggerImport/handleImportFile
// We'll just strip the old ones and append the new ones.
// I'll assume they are at the end of the file. Let's just find and replace using regex.
app = app.replace(/async function exportData\(\) \{[\s\S]*?reader\.readAsText\(file\);\n\}/, newExportImport.trim());

fs.writeFileSync('app.js', app);


// 3. INDEX.HTML
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<h1 style="margin:0;">CA Final Group 2</h1>',
  `<select id="group-selector" style="margin:0; font-size: 24px; font-weight: bold; background: transparent; border: none; color: inherit; appearance: none; outline: none; font-family: inherit; cursor: pointer;" onchange="switchGroup(this.value)">
              <option value="group2" style="color: #333">CA Final Group 2</option>
              <option value="group1" style="color: #333">CA Final Group 1</option>
            </select>`
);

// Add init logic to set the dropdown value
app = fs.readFileSync('app.js', 'utf8');
app = app.replace(
  "loadDynamicData();",
  "loadDynamicData();\n  const groupSel = document.getElementById('group-selector');\n  if (groupSel) groupSel.value = state.activeGroup;"
);
fs.writeFileSync('app.js', app);


// 4. SW.JS
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v48/g, 'ca-tracker-v49');
fs.writeFileSync('sw.js', sw);

console.log('Group 1 support injected.');
