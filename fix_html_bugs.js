const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// 1. Fix modal-title textContent -> innerHTML
app = app.replace("document.getElementById('modal-title').textContent = title;", "document.getElementById('modal-title').innerHTML = title;");

// 2. Fix slot icon rendering in timetable
app = app.replace('<span class="slot-icon">${slot.icon}</span>', '<span class="material-symbols-rounded slot-icon">${slot.icon}</span>');

// 3. Fix nextSlot.icon rendering in Current Activity
app = app.replace("' + nextSlot.icon + ' ' + nextSlot.label;", "'<span class=\"material-symbols-rounded\" style=\"vertical-align:middle; font-size:14px; margin-right:4px;\">' + nextSlot.icon + '</span> ' + nextSlot.label;");

// 4. Remove span from <select> <option> tags in app.js
// For Category
app = app.replace('<option value="primary"><span class="material-symbols-rounded icon-sm">local_library</span> Primary Subject</option>', '<option value="primary">Primary Subject</option>');
app = app.replace('<option value="secondary"><span class="material-symbols-rounded icon-sm">import_contacts</span> Secondary Subject</option>', '<option value="secondary">Secondary Subject</option>');
app = app.replace('<option value="quick"><span class="material-symbols-rounded icon-sm">edit_document</span> Quick Task</option>', '<option value="quick">Quick Task</option>');

// For Quick Task options
app = app.replace('<option value="conceptBook"><span class="material-symbols-rounded icon-sm">import_contacts</span> Book (Concepts)</option>', '<option value="conceptBook">Book (Concepts)</option>');
app = app.replace('<option value="questionBank"><span class="material-symbols-rounded icon-sm">help</span> Question Bank</option>', '<option value="questionBank">Question Bank</option>');
app = app.replace('<option value="revisionVideo"><span class="material-symbols-rounded icon-sm">videocam</span> Revision Video</option>', '<option value="revisionVideo">Revision Video</option>');

fs.writeFileSync('app.js', app);

// Bump SW version to v36
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v35/g, 'ca-tracker-v36');
fs.writeFileSync('sw.js', sw);

console.log("HTML rendering bugs fixed.");
