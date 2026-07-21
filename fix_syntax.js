const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

app = app.replace(
  /renderExams\(\);\s*\}\s*\}\s*\}/g,
  'renderExams();\n  }\n}'
);

fs.writeFileSync('app.js', app);
console.log('Syntax error fixed!');
