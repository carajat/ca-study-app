const fs = require('fs');
let lines = fs.readFileSync('style.css', 'utf8').split('\n');
const startIdx = lines.findIndex(l => l.includes('.hide-scrollbar::-webkit-scrollbar'));
if (startIdx !== -1) {
    lines[startIdx + 1] = '    display: none !important;\n    width: 0 !important;\n    height: 0 !important;';
    fs.writeFileSync('style.css', lines.join('\n'));
    console.log('Successfully updated style.css');
} else {
    console.log('Could not find .hide-scrollbar::-webkit-scrollbar');
}
