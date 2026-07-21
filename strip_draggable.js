const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

app = app.replace(/ draggable="\$\{isEditMode\}"/g, '');
app = app.replace(/ draggable="' \+ isEditMode \+ '"/g, '');
app = app.replace(/ class=".*draggable-item"/g, match => match.replace(' draggable-item', ''));

fs.writeFileSync('app.js', app);
console.log('Removed draggables');
