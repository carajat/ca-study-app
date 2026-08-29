const fs = require('fs');
let lines = fs.readFileSync('app.js','utf8').split('\n');

const varIdx = lines.findIndex(l => l.includes('let lastNotifiedTime ='));
if (varIdx > -1) {
    if (!lines[varIdx + 1].includes('lastMissedStudyAlert')) {
        lines.splice(varIdx + 1, 0, 'let lastMissedStudyAlert = 0;');
    }
}

const funcIdx = lines.findIndex(l => l.includes('function checkScheduleNotifications()'));
const endIdx = lines.findIndex((l,i) => i > funcIdx && l === '}');

const logic = `
  // Repeated "Not studying" detection (every 10 minutes)
  if (now.getTime() - lastMissedStudyAlert > 10 * 60 * 1000) {
      if (scheduleData && scheduleData.slots) {
          const currentMin = now.getHours() * 60 + now.getMinutes();
          let shouldBeStudying = false;
          let currentSlotLabel = '';
          for (let slot of scheduleData.slots) {
              if (slot.type === 'study') {
                  const [sh, sm] = slot.startRange.split('-')[0].split(':').map(Number);
                  const startM = sh * 60 + sm;
                  const endM = startM + (slot.duration || 60);
                  if (currentMin >= startM && currentMin < endM) {
                      shouldBeStudying = true;
                      currentSlotLabel = slot.label;
                      break;
                  }
              }
          }
          
          const isTrkRunning = typeof trackerState !== 'undefined' && trackerState.isRunning;
          if (shouldBeStudying && !isTrkRunning) {
              fireNotification("Study Reminder", "You are scheduled for " + currentSlotLabel + ". Please start your tracker!");
              lastMissedStudyAlert = now.getTime();
          } else if (isTrkRunning) {
              // If they are studying, keep resetting the timer so we don't alert immediately when they stop
              lastMissedStudyAlert = now.getTime();
          }
      }
  }
`;

if (endIdx > -1) {
    lines.splice(endIdx, 0, logic);
}

fs.writeFileSync('app.js', lines.join('\n'));
console.log('Repeated alert added');
