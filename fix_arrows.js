const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// Fix 1: Remove HTML5 drag and drop events from the div
app = app.replace(
  'draggable="${isEditMode}" ondragstart="handleDragStart(event, ${idx})" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${idx}, \'syllabus-subject\')" ondragend="handleDragEnd(event)"',
  ''
);

// Fix 2: Replace drag-handle with order controls
const orderControls = `\${isEditMode ? \`
  <div class="order-controls" style="display:flex; flex-direction:column; justify-content:center; margin-right:12px; gap:8px; z-index:10;">
    <button onclick="moveSubjectUp(\${idx})" style="background:transparent; border:none; color:var(--text-secondary); padding:4px; line-height:0; cursor:pointer;"><span class="material-symbols-rounded">expand_less</span></button>
    <button onclick="moveSubjectDown(\${idx})" style="background:transparent; border:none; color:var(--text-secondary); padding:4px; line-height:0; cursor:pointer;"><span class="material-symbols-rounded">expand_more</span></button>
  </div>
\` : ''}`;

app = app.replace('<span class="drag-handle">::</span>', orderControls);

fs.writeFileSync('app.js', app);

// Bump SW version to v44
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v43/g, 'ca-tracker-v44');
fs.writeFileSync('sw.js', sw);

console.log('Fixed arrow controls');
