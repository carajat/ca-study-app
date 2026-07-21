const fs = require('fs');

// 1. Add SortableJS to index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('Sortable.min.js')) {
  html = html.replace(
    '<script src="data.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>\n  <script src="data.js"></script>'
  );
  fs.writeFileSync('index.html', html);
}

// 2. Modify app.js
let app = fs.readFileSync('app.js', 'utf8');

// Remove the order controls and put back the drag handle
const orderControlsRegex = /<div class="order-controls"[\s\S]*?<\/div>/;
app = app.replace(orderControlsRegex, '<span class="drag-handle material-symbols-rounded" style="color:var(--text-secondary); cursor:grab; margin-right:12px; display:${isEditMode ? \'block\' : \'none\'};">drag_indicator</span>');

// Actually, in showSubjectsList, we need to initialize Sortable AFTER rendering
const renderSyllabusHook = `
  container.innerHTML = subjects.map((subj, idx) => {
`;

const sortableInit = `
  if (isEditMode) {
    if (window.syllabusSortable) {
      window.syllabusSortable.destroy();
    }
    window.syllabusSortable = new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: function (evt) {
        const itemEl = evt.item;
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;
        if (oldIndex !== newIndex) {
          const movedItem = DYNAMIC_DATA.syllabusSubjects.splice(oldIndex, 1)[0];
          DYNAMIC_DATA.syllabusSubjects.splice(newIndex, 0, movedItem);
          saveDynamicData();
          // Do not re-render immediately, let Sortable keep DOM state
          // showSubjectsList(); // Calling this will cause loss of input focus if dragging while focused
        }
      }
    });
  } else if (window.syllabusSortable) {
    window.syllabusSortable.destroy();
    window.syllabusSortable = null;
  }
`;

// Insert the Sortable initialization at the end of showSubjectsList
app = app.replace(
  'function openSubjectDetail(id, type) {',
  sortableInit + '\n}\n\nfunction openSubjectDetail(id, type) {'
);

fs.writeFileSync('app.js', app);

// Bump SW version to v45
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v44/g, 'ca-tracker-v45');
fs.writeFileSync('sw.js', sw);

console.log('Sortable JS integrated successfully');
