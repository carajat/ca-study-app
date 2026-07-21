const fs = require('fs');

// --- APP.JS FIXES ---
let app = fs.readFileSync('app.js', 'utf8');

// Fix 1: Change '% complete' to '% done'
app = app.replace(/% complete/g, '% done');

// Fix 2: Remove HTML5 drag and drop, add Up/Down arrows
// Replace draggable-item and events in showSubjectsList
const dragRegex = /draggable="\$\{isEditMode\}" ondragstart="[^"]+" ondragover="[^"]+" ondrop="[^"]+" ondragend="[^"]+"/;
app = app.replace(dragRegex, '');

// Replace drag-handle with order controls
const handleRegex = /<span class="drag-handle">::<\/span>/;
const orderControls = `\${isEditMode ? \`
  <div class="order-controls" style="display:flex; flex-direction:column; margin-right:12px; gap:4px;">
    <button onclick="moveSubjectUp(\${idx})" style="background:transparent; border:none; color:var(--text-secondary); padding:0; line-height:0;"><span class="material-symbols-rounded">expand_less</span></button>
    <button onclick="moveSubjectDown(\${idx})" style="background:transparent; border:none; color:var(--text-secondary); padding:0; line-height:0;"><span class="material-symbols-rounded">expand_more</span></button>
  </div>
\` : ''}`;
app = app.replace(handleRegex, orderControls);

// Add moveSubjectUp and moveSubjectDown functions globally
const orderFunctions = `
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
`;
app += '\n' + orderFunctions;

// Make sure the inline input has no margin issues, and stop propagation
app = app.replace('onclick="event.stopPropagation()" onchange="updateSyllabusSubject(${idx}, this.value)">', 'onclick="event.stopPropagation()" onchange="updateSyllabusSubject(${idx}, this.value)">');

fs.writeFileSync('app.js', app);

// Bump SW version to v42
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v41/g, 'ca-tracker-v42');
fs.writeFileSync('sw.js', sw);

console.log('Fixes applied successfully');
