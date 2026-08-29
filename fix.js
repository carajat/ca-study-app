const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /if \(pct >= 0\.8\) status = 'done';\s*else if \(pct > 0\) status = 'partial';\s*else if \(dateStr === todayStr && nowMin < rangeStart\) status = 'upcoming';\s*else status = 'missed';/;

const rep = `if (pct >= 0.8) status = 'done';
    else if (pct > 0) status = 'partial';
    else if (dateStr === todayStr && typeof trackerState !== 'undefined' && (trackerState.isRunning || trackerState.isPaused) && nowMin >= rangeStart && nowMin < (rangeStart + (slot.duration || 60))) status = 'studying';
    else if (dateStr === todayStr && nowMin < rangeStart) status = 'upcoming';
    else status = 'missed';`;

if(regex.test(c)) {
  c = c.replace(regex, rep);
  fs.writeFileSync('app.js', c);
  console.log('Success');
} else {
  console.log('Regex not found');
}
