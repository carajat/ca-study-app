const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// Fix the buggy filter in loadDynamicData()
appJs = appJs.replace(
  `DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || s.id.startsWith('ibs-') && !s.children));`,
  `DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || (s.id.startsWith('ibs-') && !s.children)));`
);

const repairCode = `
function repairSyllabusData() {
  if (!DYNAMIC_DATA.syllabusSubjects) return;
  let flat = [];
  const flatten = (arr) => {
    arr.forEach(s => {
      if (s.type === 'folder' && s.children) flatten(s.children);
      else flat.push(s);
    });
  };
  flatten(DYNAMIC_DATA.syllabusSubjects);
  
  const ensureSubject = (id, defaultObj) => {
    let subj = flat.find(s => s.id === id);
    if (!subj) {
      subj = JSON.parse(JSON.stringify(defaultObj));
      DYNAMIC_DATA.syllabusSubjects.push(subj);
      flat.push(subj);
    }
    if (!subj.chapters || subj.chapters.length === 0) {
      subj.chapters = JSON.parse(JSON.stringify(defaultObj.chapters || []));
    }
  };

  ensureSubject('dt', { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: APP_DATA.dtChapters });
  ensureSubject('idt', { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: APP_DATA.idtChapters });
  
  ['afm', 'fr', 'audit', 'law', 'scpm'].forEach(key => {
    let nameMap = { afm: 'IBS — AFM', fr: '📋 IBS — FR', audit: 'IBS — Audit', law: '⚖️ IBS — Law (SPOM A)', scpm: 'IBS — SC&PM (SPOM B)' };
    ensureSubject('ibs-' + key, { id: 'ibs-' + key, name: nameMap[key], source: '', type: 'ibs', chapters: APP_DATA.ibsSubjects[key].chapters });
  });

  // Re-run the folder logic to ensure they are grouped properly
  const ibsItems = DYNAMIC_DATA.syllabusSubjects.filter(s => (s.type === 'ibs' || (s.id.startsWith('ibs-') && !s.children)));
  if (ibsItems.length > 0) {
     const folder = { id: 'ibs-folder', name: 'Paper 6: IBS (MCS)', source: 'Multidisciplinary Case Study', type: 'folder', children: ibsItems };
     DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || (s.id.startsWith('ibs-') && !s.children)));
     
     // Remove existing ibs-folder if it exists to avoid duplicates
     DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => s.id !== 'ibs-folder');
     
     DYNAMIC_DATA.syllabusSubjects.push(folder);
  }
  
  // Final deduplication just in case
  let uniqueIds = new Set();
  DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => {
    if(uniqueIds.has(s.id)) return false;
    uniqueIds.add(s.id);
    return true;
  });

  saveDynamicData();
}
`;

// Inject into init()
if (!appJs.includes('repairSyllabusData();')) {
  appJs = appJs.replace(
    `loadDynamicData();`,
    `loadDynamicData();\n  repairSyllabusData();`
  );
  appJs = appJs + '\n' + repairCode;
}

fs.writeFileSync('app.js', appJs);
console.log("Injected repairSyllabusData and fixed filter");
