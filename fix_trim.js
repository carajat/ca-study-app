const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// Trim icon in Current Activity
app = app.replace(
  "' + currentSlot.icon + '</span>' + currentSlot.label",
  "' + (currentSlot.icon || '').trim() + '</span> ' + currentSlot.label"
);

// Trim icon in Next Activity
app = app.replace(
  "' + nextSlot.icon + '</span> ' + nextSlot.label",
  "' + (nextSlot.icon || '').trim() + '</span> ' + nextSlot.label"
);

// Trim icon in Timetable Schedule Render
app = app.replace(
  '<span class="material-symbols-rounded slot-icon">${slot.icon}</span>',
  '<span class="material-symbols-rounded slot-icon">${(slot.icon || "").trim()}</span>'
);

fs.writeFileSync('app.js', app);
console.log('Icons trimmed');
