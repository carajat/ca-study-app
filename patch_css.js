const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

const readOnlyCss = `
/* GF Read-Only Mode */
body.read-only-mode #editModeBtn,
body.read-only-mode button[onclick="openManualLogModal()"],
body.read-only-mode button[onclick="openAddTaskModal()"],
body.read-only-mode button[onclick^="deleteTodaysLog"],
body.read-only-mode button[onclick^="deletePlannerTask"],
body.read-only-mode button[onclick^="openMockScoreModal"],
body.read-only-mode button[onclick^="saveMockScore"],
body.read-only-mode button[onclick^="clearMockScore"],
body.read-only-mode .st-btn-start,
body.read-only-mode .st-btn-pause,
body.read-only-mode .st-btn-stop,
body.read-only-mode .planner-task input[type="checkbox"],
body.read-only-mode .ss-row input[type="checkbox"] {
  display: none !important;
  pointer-events: none !important;
}
`;

if (!css.includes('body.read-only-mode')) {
    fs.writeFileSync('style.css', css + '\n' + readOnlyCss);
    console.log('Appended read-only CSS.');
}
