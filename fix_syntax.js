const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

const insertIdx = lines.findIndex(l => l.includes('if (isEditMode) {'));
if (insertIdx !== -1) {
  lines.splice(insertIdx, 0, '  });');
  fs.writeFileSync('app.js', lines.join('\n'));
  console.log('Fixed syntax');
} else {
  console.log('Could not find insert index');
}
