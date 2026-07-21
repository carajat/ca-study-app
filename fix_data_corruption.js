const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const sanitizeLogic = `
  // --- SANITIZE BROKEN HTML IN LOCALSTORAGE ---
  if (DYNAMIC_DATA.syllabusSubjects) {
    let changed = false;
    DYNAMIC_DATA.syllabusSubjects.forEach(s => {
      if (s.name && (s.name.includes('<') || s.name.includes('menu_book') || s.name.includes('auto_stories') || s.name.includes('class='))) {
        // Strip everything that looks like an HTML tag
        s.name = s.name.replace(/<[^>]*>?/gm, '');
        // Clean up leaked attributes
        s.name = s.name.replace(/onclick="[^"]*"/g, '');
        s.name = s.name.replace(/onchange="[^"]*"/g, '');
        s.name = s.name.replace(/class="[^"]*"/g, '');
        s.name = s.name.replace(/menu_book /g, '');
        s.name = s.name.replace(/auto_stories /g, '');
        s.name = s.name.replace(/"/g, '');
        s.name = s.name.trim();
        
        // Final fallback if name became empty
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
`;

app = app.replace('// Migrate to unified syllabusSubjects if not present', sanitizeLogic + '\n  // Migrate to unified syllabusSubjects if not present');

fs.writeFileSync('app.js', app);

// Bump SW version to v41 to force update
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v40/g, 'ca-tracker-v41');
fs.writeFileSync('sw.js', sw);

console.log('Sanitizer logic added successfully!');
