const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace("const quick = dayTasks.filter(t => t.category === 'quick');", "const quick = dayTasks.filter(t => t.category !== 'primary' && t.category !== 'secondary');");
fs.writeFileSync('app.js', app);

console.log('Fixed fallback');
