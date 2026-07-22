const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const forceRepairCode = `
function smartRepairSyllabusData() {
  if (!DYNAMIC_DATA.syllabusSubjects) return;
  
  // Force reset DT and IDT chapters to match exactly with full APP_DATA lists
  // This preserves progress because progress is stored separately in DYNAMIC_DATA.progress
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
      // Overwrite chapters completely to remove the truncated 14-chapter junk
      subj.chapters = JSON.parse(JSON.stringify(defaultObj.chapters || []));
    }
  };

  enforceSubject('dt', { id: 'dt', name: 'Paper 4: DT & International Tax', source: 'CA Aarish Khan', type: 'main', chapters: APP_DATA.group2.dtChapters });
  enforceSubject('idt', { id: 'idt', name: 'Paper 5: IDT (GST + Customs)', source: 'VB Sir', type: 'main', chapters: APP_DATA.group2.idtChapters });
  
  ['afm', 'fr', 'audit', 'law', 'scpm'].forEach(key => {
    let nameMap = { afm: 'IBS — AFM', fr: '📋 IBS — FR', audit: 'IBS — Audit', law: '⚖️ IBS — Law (SPOM A)', scpm: 'IBS — SC&PM (SPOM B)' };
    enforceSubject('ibs-' + key, { id: 'ibs-' + key, name: nameMap[key], source: '', type: 'ibs', chapters: APP_DATA.group2.ibsSubjects[key].chapters });
  });

  // Remove the rogue 'ibs' subject that came from the old hardcoded array
  DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => {
    if (s.id === 'ibs') return false; 
    return true;
  });

  // Group IBS subjects into folder
  const ibsItems = DYNAMIC_DATA.syllabusSubjects.filter(s => (s.type === 'ibs' || (s.id && s.id.startsWith('ibs-') && !s.children)));
  if (ibsItems.length > 0) {
     const folder = { id: 'ibs-folder', name: 'Paper 6: IBS (MCS)', source: 'Multidisciplinary Case Study', type: 'folder', children: ibsItems };
     DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => !(s.type === 'ibs' || (s.id && s.id.startsWith('ibs-') && !s.children)));
     DYNAMIC_DATA.syllabusSubjects = DYNAMIC_DATA.syllabusSubjects.filter(s => s.id !== 'ibs-folder');
     DYNAMIC_DATA.syllabusSubjects.push(folder);
  }

  saveDynamicData();
}
`;

appJs = appJs.replace(/function smartRepairSyllabusData\(\) \{[\s\S]*?saveDynamicData\(\);\n\}/, forceRepairCode.trim());
fs.writeFileSync('app.js', appJs);
console.log('Force repair injected!');
