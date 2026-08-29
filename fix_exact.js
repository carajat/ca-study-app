const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

const start = 1081;
const end = 1155;

const before = lines.slice(0, start);
const after = lines.slice(end);

const middle = `  let chronoActiveIdx = schedule.slots.findIndex((s) => {
    const [sh, sm] = s.startRange.split('-')[0].split(':').map(Number);
    const startMin = sh * 60 + sm;
    return currentMin >= startMin && currentMin < startMin + s.duration;
  });

  if (isTrk && trackerState.startTime) {
    const trkDate = new Date(trackerState.startTime);
    const trkMin = trkDate.getHours() * 60 + trkDate.getMinutes();
    
    let matchedIdx = schedule.slots.findIndex(s => {
      if (s.type !== 'study') return false;
      const [sh, sm] = s.startRange.split('-')[0].split(':').map(Number);
      const start = sh * 60 + sm;
      const end = start + (s.duration || 60);
      return trkMin >= start && trkMin < end;
    });
    
    if (matchedIdx === -1) {
      matchedIdx = schedule.slots.findIndex(s => {
        if (s.type !== 'study') return false;
        const [sh, sm] = s.startRange.split('-')[0].split(':').map(Number);
        const start = sh * 60 + sm;
        const end = start + (s.duration || 60);
        const broadStart = start - 60;
        const broadEnd = end + (s.duration || 60);
        return trkMin >= broadStart && trkMin < broadEnd;
      });
    }
    
    if (matchedIdx !== -1) {
      smartActiveIdx = matchedIdx;
    } else {
       let bestIdx = -1;
       for (let i = 0; i < schedule.slots.length; i++) {
         const s = schedule.slots[i];
         const [sh, sm] = s.startRange.split('-')[0].split(':').map(Number);
         if (sh * 60 + sm <= trkMin && s.type === 'study') {
           bestIdx = i;
         }
       }
       if (bestIdx !== -1) smartActiveIdx = bestIdx;
       else {
         for (let i = schedule.slots.length - 1; i >= 0; i--) {
           if (schedule.slots[i].type === 'study') { smartActiveIdx = i; break; }
         }
       }
    }
  } else {
    smartActiveIdx = chronoActiveIdx;
  }`;

fs.writeFileSync('app.js', before.join('\n') + '\n' + middle + '\n' + after.join('\n'));
console.log('Fixed exactly');
