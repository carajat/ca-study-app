const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// Fix initSortable to accept elements directly
app = app.replace(
  'function initSortable(containerId, arrayRef, saveCallback) {',
  'function initSortable(containerIdOrEl, arrayRef, saveCallback) {\n  const container = typeof containerIdOrEl === "string" ? document.getElementById(containerIdOrEl) : containerIdOrEl;'
);
app = app.replace(
  'const container = document.getElementById(containerId);',
  ''
);

// Fix Syllabus Detail selectors
app = app.replace(
  "initSortable('syllabus-detail-content .syllabus-table', subjData.chapters, saveDynamicData);",
  "initSortable(document.querySelector('#syllabus-detail-content .syllabus-table'), subjData.chapters, saveDynamicData);"
);
app = app.replace(
  "initSortable('syllabus-detail-content .syllabus-simple', subjData.chapters, saveDynamicData);",
  "initSortable(document.querySelector('#syllabus-detail-content .syllabus-simple'), subjData.chapters, saveDynamicData);"
);

// Fix Exams
app = app.replace(
  "container.innerHTML += `<button class=\"add-item-btn\" style=\"margin-bottom: 20px\" onclick=\"addMockSeries()\">+ Add New Test Series</button>`;\n  }",
  "container.innerHTML += `<button class=\"add-item-btn\" style=\"margin-bottom: 20px\" onclick=\"addMockSeries()\">+ Add New Test Series</button>`;\n  }\n  document.querySelectorAll('.mock-list').forEach((el, i) => {\n    if (DYNAMIC_DATA.mocks[i]) initSortable(el, DYNAMIC_DATA.mocks[i].tests, saveDynamicData);\n  });"
);

// Fix Schedule
app = app.replace(
  "rulesList.innerHTML = DYNAMIC_DATA.schedules.rules.map(r => `<li>${r}</li>`).join('');\n}",
  "rulesList.innerHTML = DYNAMIC_DATA.schedules.rules.map(r => `<li>${r}</li>`).join('');\n  initSortable('schedule-slots-container', DYNAMIC_DATA.schedules[state.activeSchedule].slots, saveDynamicData);\n}"
);

// Drop planner sorting because arrays are filtered and mapping is unsafe without major rewrite
app = app.replace(
  "clearSortables();\n  initSortable('planner-primary-tasks', dayTasks, () => savePlannerTasks(tasks));\n  initSortable('planner-secondary-tasks', dayTasks, () => savePlannerTasks(tasks));\n  initSortable('planner-quick-tasks', dayTasks, () => savePlannerTasks(tasks));",
  "// Planner sorting temporarily disabled due to filtered arrays"
);

fs.writeFileSync('app.js', app);

// Replace CDN in index.html with local Sortable.min.js
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>',
  '<script src="Sortable.min.js"></script>'
);
fs.writeFileSync('index.html', html);

// Add Sortable.min.js to sw.js ASSETS
let sw = fs.readFileSync('sw.js', 'utf8');
if (!sw.includes("'/Sortable.min.js'")) {
  sw = sw.replace(
    "'/app.js',",
    "'/Sortable.min.js',\n  '/app.js',"
  );
}
// Bump to v46
sw = sw.replace(/ca-tracker-v45/g, 'ca-tracker-v46');
fs.writeFileSync('sw.js', sw);

console.log('Fixed Sortable integration and localized script.');
