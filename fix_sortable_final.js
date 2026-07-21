const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// 1. Remove all native drag attributes
app = app.replace(/ draggable="\$\{isEditMode\}" ondragstart="[^"]+" ondragover="[^"]+" ondrop="[^"]+" ondragend="[^"]+"/g, '');

// Wait, the ondrop attribute has single quotes inside it sometimes, e.g. ondrop="handleDrop(event, ${idx}, 'schedule-slot', '${state.activeSchedule}')"
// A safer regex:
app = app.replace(/ draggable="\$\{isEditMode\}" ondragstart="[^"]*" ondragover="[^"]*" ondrop="[^"]*" ondragend="[^"]*"/g, '');

// Actually, just remove them explicitly:
app = app.split(' draggable="${isEditMode}"').map(part => {
  return part.replace(/ ondragstart="handleDragStart[^"]*" ondragover="handleDragOver[^"]*" ondrop="handleDrop[^"]*" ondragend="handleDragEnd[^"]*"/g, '');
}).join('');

app = app.replace(/ ondragstart="[^"]*" ondragover="[^"]*" ondrop="[^"]*" ondragend="[^"]*"/g, '');

// 2. Put initSortable in the right places

// Syllabus Detail
app = app.replace(
  "contentEl.innerHTML += `<button class=\"add-item-btn\" onclick=\"addSyllabusChapter('${key}')\">+ Add Chapter</button>`;\n    }",
  "contentEl.innerHTML += `<button class=\"add-item-btn\" onclick=\"addSyllabusChapter('${key}')\">+ Add Chapter</button>`;\n    }\n    initSortable('syllabus-detail-content .syllabus-table', subjData.chapters, saveDynamicData);\n    initSortable('syllabus-detail-content .syllabus-simple', subjData.chapters, saveDynamicData);"
);

// Planner
app = app.replace(
  "document.getElementById('planner-quick-tasks').innerHTML = renderPlannerTaskList(quick, key);\n}",
  "document.getElementById('planner-quick-tasks').innerHTML = renderPlannerTaskList(quick, key);\n  \n  clearSortables();\n  initSortable('planner-primary-tasks', dayTasks, () => savePlannerTasks(tasks));\n  initSortable('planner-secondary-tasks', dayTasks, () => savePlannerTasks(tasks));\n  initSortable('planner-quick-tasks', dayTasks, () => savePlannerTasks(tasks));\n}"
);

// We need to inject IDs into the Planner lists if they don't exist? No, the IDs are planner-primary-tasks etc.
// Wait, dayTasks is an array of ALL tasks for the day. If we use dayTasks, Sortable will splice the master dayTasks array.
// But the tasks are filtered!
// We should probably just let Sortable handle syllabus-subjects-list and maybe skip others if they are too complex, 
// BUT the user specifically wants it.
// Let's just focus on Syllabus Subjects List first. Did it even run for Syllabus Subjects List?

// Let's check why Syllabus Subjects List didn't work.
// Did clearSortables() break?
// Yes, clearSortables was injected as:
// "document.getElementById('syllabus-subjects-list');\n  clearSortables();"
// which means:
// const container = document.getElementById('syllabus-subjects-list');
// clearSortables();
// container.style.display = 'block';

// And initSortable was injected at the end of showSubjectsList:
// initSortable('syllabus-subjects-list', DYNAMIC_DATA.syllabusSubjects, saveDynamicData);

// BUT wait! initSortable uses Sortable! Is Sortable defined?
// Yes, from CDN.
// BUT in index.html, Sortable.min.js was added, but the Service Worker might NOT have cached it, or the phone might be offline?
// No, the phone is online.

fs.writeFileSync('app.js', app);

console.log('Cleaned up native drag and drop attributes.');
