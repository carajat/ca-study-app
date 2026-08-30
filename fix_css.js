const fs = require('fs');
let lines = fs.readFileSync('style.css', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('@media (hover: none) and (pointer: coarse) {'));
if (startIdx !== -1) {
    // Check if the next few lines match what we expect
    if (lines[startIdx + 1].includes('.hide-scrollbar') && lines[startIdx + 8].includes('}')) {
        lines.splice(startIdx, 1); // remove @media line
        const endIdx = startIdx + 7; // after removing, the closing brace is 7 lines down
        lines.splice(endIdx, 1); // remove closing }
        fs.writeFileSync('style.css', lines.join('\n'));
        console.log('Successfully updated style.css');
    } else {
        console.log('Found media query but inner contents did not match expectations.');
    }
} else {
    console.log('Could not find media query');
}
