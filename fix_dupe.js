const fs = require('fs');
const c = fs.readFileSync('app.js', 'utf8');

const lines = c.split('\n');
const start = lines.findIndex(l => l.includes('  } else {') && lines[lines.indexOf(l)+1].includes('    smartActiveIdx = chronoActiveIdx;'));

if (start !== -1) {
  // Find the end of the duplicated mess
  const end = lines.findIndex((l, i) => i > start && l.includes('  schedule.slots.forEach((slot, idx) => {'));
  
  if (end !== -1) {
    // Keep lines up to start + 1
    const before = lines.slice(0, start + 2);
    // Keep lines from end onwards
    const after = lines.slice(end);
    
    fs.writeFileSync('app.js', before.join('\n') + '\n\n' + after.join('\n'));
    console.log('Fixed duplication');
  } else {
    console.log('End not found');
  }
} else {
  console.log('Start not found');
}
