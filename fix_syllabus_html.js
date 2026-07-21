const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// 1. In loadDynamicData, add a sanitizer for syllabusSubjects
const sanitizeLogic = `
  if (DYNAMIC_DATA.syllabusSubjects) {
    DYNAMIC_DATA.syllabusSubjects.forEach(s => {
      if (s.name) {
        // Remove HTML tags and fix broken attributes string
        s.name = s.name.replace(/<[^>]*>?/gm, '');
        // Clean up any leaked attributes from the bug
        s.name = s.name.replace(/onclick="[^"]*"/g, '');
        s.name = s.name.replace(/onchange="[^"]*"/g, '');
        s.name = s.name.replace(/class="[^"]*"/g, '');
        s.name = s.name.replace(/menu_book /g, '');
        s.name = s.name.replace(/auto_stories /g, '');
        s.name = s.name.replace(/"/g, '');
        s.name = s.name.trim();
        // Fallbacks if empty
        if (!s.name || s.name === '') {
          if (s.id === 'dt') s.name = 'Paper 4: DT & International Tax';
          else if (s.id === 'idt') s.name = 'Paper 5: IDT (GST + Customs)';
          else s.name = 'Syllabus Subject';
        }
      }
    });
    localStorage.setItem('ca_dynamic_data', JSON.stringify(DYNAMIC_DATA));
  }
`;
app = app.replace('if (DYNAMIC_DATA.plannerTasks) {', sanitizeLogic + '\n  if (DYNAMIC_DATA.plannerTasks) {');

// 2. In default APP_DATA definitions (lines 62-68 approx), remove HTML
app = app.replace(/<span class="material-symbols-rounded icon-sm">menu_book<\/span> /g, '');
app = app.replace(/<span class="material-symbols-rounded icon-sm">auto_stories<\/span> /g, '');

// 3. In showSubjectsList, add the icon to the display (but not the input)
app = app.replace(
  '<div class="subj-name">${subj.name}</div>',
  '<div class="subj-name"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:4px;">menu_book</span> ${subj.name}</div>'
);

// Ensure the input field doesn't get messed up if there are any lingering quotes
app = app.replace(
  '<input type="text" class="inline-input" value="${subj.name}"',
  '<input type="text" class="inline-input" value="${subj.name.replace(/\"/g, \'&quot;\')}"'
);

// 4. In renderSyllabusDetail, add the icon to the title
app = app.replace(
  '<h3>${title}</h3>',
  '<h3><span class="material-symbols-rounded icon-sm" style="vertical-align:middle; margin-right:6px;">menu_book</span> ${title}</h3>'
);

fs.writeFileSync('app.js', app);

// Bump SW version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v39/g, 'ca-tracker-v40');
fs.writeFileSync('sw.js', sw);

console.log('Syllabus HTML bug fixed');
