const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

// 1. Restore Grip Handles where Up/Down arrows were
app = app.replace(
  /<div class="order-controls"[^>]*>[\s\S]*?<\/div>/g,
  '<span class="drag-handle material-symbols-rounded">drag_indicator</span>'
);
app = app.replace(/<span class="drag-handle">::<\/span>/g, '<span class="drag-handle material-symbols-rounded">drag_indicator</span>');

// 2. Add Sortable Initialization helper
const sortableHelper = `
window.activeSortables = [];
function initSortable(containerId, arrayRef, saveCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (isEditMode) {
    const s = new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: function(evt) {
        if (evt.oldIndex !== evt.newIndex) {
          const item = arrayRef.splice(evt.oldIndex, 1)[0];
          arrayRef.splice(evt.newIndex, 0, item);
          saveCallback();
        }
      }
    });
    window.activeSortables.push(s);
  }
}
function clearSortables() {
  if (window.activeSortables) {
    window.activeSortables.forEach(s => s.destroy());
    window.activeSortables = [];
  }
}
`;
if (!app.includes('window.activeSortables')) {
  app = app.replace('let draggedItemIndex = null;', sortableHelper + '\nlet draggedItemIndex = null;');
}

// 3. Inject initSortable into render functions (Syllabus List)
app = app.replace(
  "document.getElementById('syllabus-subjects-list');",
  "document.getElementById('syllabus-subjects-list');\n  clearSortables();"
);

// We need to inject initSortable at the END of showSubjectsList
app = app.replace(
  "function openSubjectDetail(id, type) {",
  "  initSortable('syllabus-subjects-list', DYNAMIC_DATA.syllabusSubjects, saveDynamicData);\n}\n\nfunction openSubjectDetail(id, type) {"
);

// For planner: inject into renderPlannerTasks AFTER rendering tasks
// We need to find the exact end of renderPlannerTasks
app = app.replace(
  "const dateLabel = date.toLocaleDateString('en-GB', {",
  `  clearSortables();
  const dateLabel = date.toLocaleDateString('en-GB', {`
);

// Let's inject the initialization right after `renderPlannerSection('planner-quick-tasks', ...);`
app = app.replace(
  "renderPlannerSection('planner-quick-tasks', tasks.quick || [], isPast);",
  `renderPlannerSection('planner-quick-tasks', tasks.quick || [], isPast);
  
  if (!isPast) {
    initSortable('planner-primary-tasks', tasks.primary, () => saveState({ plannerTasks: tasks }));
    initSortable('planner-secondary-tasks', tasks.secondary, () => saveState({ plannerTasks: tasks }));
    initSortable('planner-quick-tasks', tasks.quick, () => saveState({ plannerTasks: tasks }));
  }`
);

fs.writeFileSync('app.js', app);

// 4. Update style.css
let css = fs.readFileSync('style.css', 'utf8');
if (!css.includes('.sortable-ghost')) {
  css += `\n
/* Sortable JS styles */
.drag-handle { color: var(--text-secondary); cursor: grab; display: none; vertical-align: middle; margin-right: 12px; }
.edit-mode-active .drag-handle { display: inline-block; }
.sortable-ghost { opacity: 0.4; }
.edit-mode-active .subject-card { cursor: default; }
`;
  fs.writeFileSync('style.css', css);
}

// 5. Add Sortable to index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('Sortable.min.js')) {
  html = html.replace(
    '<script src="data.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>\n  <script src="data.js"></script>'
  );
  fs.writeFileSync('index.html', html);
}

// 6. Bump SW
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v44/g, 'ca-tracker-v45');
fs.writeFileSync('sw.js', sw);

console.log('Sortable integrated fully');
