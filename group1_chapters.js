const fs = require('fs');
let dataJs = fs.readFileSync('data.js', 'utf8');

// Replace the mock Group 1 chapters with references to the full lists from APP_DATA_GROUP2
dataJs = dataJs.replace(
  /syllabusSubjects: \[\s*\{\s*id: "fr",[\s\S]*?quotes: APP_DATA_GROUP2\.quotes/,
  `syllabusSubjects: [
    { id: 'fr', name: 'Paper 1: Financial Reporting', type: 'subject', chapters: APP_DATA_GROUP2.ibsSubjects.fr.chapters },
    { id: 'afm', name: 'Paper 2: AFM', type: 'subject', chapters: APP_DATA_GROUP2.ibsSubjects.afm.chapters },
    { id: 'audit', name: 'Paper 3: Advanced Auditing', type: 'subject', chapters: APP_DATA_GROUP2.ibsSubjects.audit.chapters }
  ],
  quotes: APP_DATA_GROUP2.quotes`
);

fs.writeFileSync('data.js', dataJs);

let appJs = fs.readFileSync('app.js', 'utf8');
const group1EnforceCode = `
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
      }
    };
    
    enforceG1('fr', { id: 'fr', name: 'Paper 1: Financial Reporting', type: 'subject', chapters: APP_DATA.group1.syllabusSubjects.find(s => s.id === 'fr').chapters });
    enforceG1('afm', { id: 'afm', name: 'Paper 2: AFM', type: 'subject', chapters: APP_DATA.group1.syllabusSubjects.find(s => s.id === 'afm').chapters });
    enforceG1('audit', { id: 'audit', name: 'Paper 3: Advanced Auditing', type: 'subject', chapters: APP_DATA.group1.syllabusSubjects.find(s => s.id === 'audit').chapters });

    saveDynamicData();
    return;
  }
`;

appJs = appJs.replace(
  /if \(state\.activeGroup === 'group1'\) \{[\s\S]*?return;\n  \}/,
  group1EnforceCode.trim()
);

fs.writeFileSync('app.js', appJs);
console.log('data.js and app.js patched!');
