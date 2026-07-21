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

const loadDynamicDataNew = `function loadDynamicData() {
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
      { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: DYNAMIC_DATA.dtChapters || APP_DATA.dtChapters },
      { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: DYNAMIC_DATA.idtChapters || APP_DATA.idtChapters },
      { id: 'ibs-afm', name: 'IBS — AFM', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.afm) ? DYNAMIC_DATA.ibsSubjects.afm.chapters : APP_DATA.ibsSubjects.afm.chapters },
      { id: 'ibs-fr', name: '📋 IBS — FR', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.fr) ? DYNAMIC_DATA.ibsSubjects.fr.chapters : APP_DATA.ibsSubjects.fr.chapters },
      { id: 'ibs-audit', name: 'IBS — Audit', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.audit) ? DYNAMIC_DATA.ibsSubjects.audit.chapters : APP_DATA.ibsSubjects.audit.chapters },
      { id: 'ibs-law', name: '⚖️ IBS — Law (SPOM A)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.law) ? DYNAMIC_DATA.ibsSubjects.law.chapters : APP_DATA.ibsSubjects.law.chapters },
      { id: 'ibs-scpm', name: 'IBS — SC&PM (SPOM B)', source: '', type: 'ibs', chapters: (DYNAMIC_DATA.ibsSubjects && DYNAMIC_DATA.ibsSubjects.scpm) ? DYNAMIC_DATA.ibsSubjects.scpm.chapters : APP_DATA.ibsSubjects.scpm.chapters }
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
       DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || s.id.startsWith('ibs-') && !s.children));
       DYNAMIC_DATA.syllabusSubjects.push(folder);
       saveDynamicData();
    }
  }
}`;
replaceFunction('loadDynamicData', loadDynamicDataNew);

fs.writeFileSync('app.js', app);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v63/g, 'v64');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=63/g, 'v=64');
fs.writeFileSync('index.html', html);
