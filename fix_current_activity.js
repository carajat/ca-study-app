const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

app = app.replace(
  "document.getElementById('ca-slot-name').innerHTML = currentSlot.icon + ' ' + currentSlot.label;",
  "document.getElementById('ca-slot-name').innerHTML = '<span class=\"material-symbols-rounded\" style=\"vertical-align:middle; margin-right:6px; font-size: 20px;\">' + currentSlot.icon + '</span>' + currentSlot.label;"
);

fs.writeFileSync('app.js', app);

// Bump SW version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v37/g, 'ca-tracker-v38');
fs.writeFileSync('sw.js', sw);

console.log("Current activity icon fixed.");
