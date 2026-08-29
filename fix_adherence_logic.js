const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /let cSlot = null;\s*for \(let s = 0; s < schedule\.slots\.length; s\+\+\) \{\s*const slot = schedule\.slots\[s\];\s*const \[startStr\] = slot\.startRange\.split\('-'\);\s*const \[sh, sm\] = startStr\.split\(':'\)\.map\(Number\);\s*const startMin = sh \* 60 \+ sm;\s*const endMin = startMin \+ slot\.duration;\s*if \(cTime >= startMin && cTime < endMin\) \{ cSlot = slot; break; \}\s*\}\s*const isTrk = typeof trackerState !== 'undefined' && \(trackerState\.isRunning \|\| trackerState\.isPaused\);\s*const trkCol = isTrk \? 'var\(--success, #10B981\)' : 'var\(--red, #EF4444\)';\s*const trkTxt = isTrk \? 'Studying' : 'Not Studying';/;

const rep = `
        const isTrk = typeof trackerState !== 'undefined' && (trackerState.isRunning || trackerState.isPaused);
        const isTrkPaused = typeof trackerState !== 'undefined' && trackerState.isPaused;
        
        let smartActiveIdx = -1;
        let chronoActiveIdx = schedule.slots.findIndex((s) => {
          const [sh, sm] = s.startRange.split('-')[0].split(':').map(Number);
          const startMin = sh * 60 + sm;
          return cTime >= startMin && cTime < startMin + s.duration;
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
        }

        let cSlot = smartActiveIdx !== -1 ? schedule.slots[smartActiveIdx] : null;
        const isThisStudy = cSlot && cSlot.type === 'study';
        
        const trkCol = isTrk ? (isTrkPaused ? 'var(--warning, #F59E0B)' : 'var(--success, #10B981)') : (isThisStudy ? 'var(--red, #EF4444)' : 'var(--text-muted, #888888)');
        const trkTxt = isTrk ? (isTrkPaused ? 'Paused' : 'Studying') : (isThisStudy ? 'Not Studying' : 'Break Time');
`;

if(regex.test(c)){
  c = c.replace(regex, rep);
  fs.writeFileSync('app.js', c);
  console.log('Success adherence fix');
} else { console.log('Regex failed'); }
