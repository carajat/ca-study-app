const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const smartRepairCode = `
function smartRepairSyllabusData() {
  if (!DYNAMIC_DATA.syllabusSubjects) return;
  let flat = [];
  const flatten = (arr) => {
    arr.forEach(s => {
      if (s.type === 'folder' && s.children) flatten(s.children);
      else flat.push(s);
    });
  };
  flatten(DYNAMIC_DATA.syllabusSubjects);
  
  const mergeChapters = (subj, defaultChapters) => {
    if (!subj.chapters || !Array.isArray(subj.chapters)) {
      subj.chapters = [];
    }
    
    // Clean up nulls
    subj.chapters = subj.chapters.filter(c => c && c.id);
    
    const existingIds = new Set(subj.chapters.map(c => c.id));
    
    let added = false;
    defaultChapters.forEach(defCh => {
      if (!existingIds.has(defCh.id)) {
        subj.chapters.push(JSON.parse(JSON.stringify(defCh)));
        added = true;
      }
    });
    
    if (added) {
      subj.chapters.sort((a, b) => {
        let idxA = defaultChapters.findIndex(c => c.id === a.id);
        let idxB = defaultChapters.findIndex(c => c.id === b.id);
        if (idxA === -1) idxA = 9999;
        if (idxB === -1) idxB = 9999;
        return idxA - idxB;
      });
    }
  };

  const ensureSubject = (id, defaultObj) => {
    let subj = flat.find(s => s && s.id === id);
    if (!subj) {
      subj = JSON.parse(JSON.stringify(defaultObj));
      DYNAMIC_DATA.syllabusSubjects.push(subj);
      flat.push(subj);
    }
    mergeChapters(subj, defaultObj.chapters || []);
  };

  ensureSubject('dt', { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: APP_DATA.dtChapters });
  ensureSubject('idt', { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: APP_DATA.idtChapters });
  
  ['afm', 'fr', 'audit', 'law', 'scpm'].forEach(key => {
    let nameMap = { afm: 'IBS — AFM', fr: '📋 IBS — FR', audit: 'IBS — Audit', law: '⚖️ IBS — Law (SPOM A)', scpm: 'IBS — SC&PM (SPOM B)' };
    ensureSubject('ibs-' + key, { id: 'ibs-' + key, name: nameMap[key], source: '', type: 'ibs', chapters: APP_DATA.ibsSubjects[key].chapters });
  });

  saveDynamicData();
}
`;

// Replace the old repairSyllabusData with the smart one
appJs = appJs.replace(/function repairSyllabusData\(\) \{[\s\S]*?saveDynamicData\(\);\n\}/, smartRepairCode.trim());

// Also change the call in init
appJs = appJs.replace(`repairSyllabusData();`, `smartRepairSyllabusData();`);

fs.writeFileSync('app.js', appJs);
console.log("Injected smartRepairSyllabusData with null safety");
