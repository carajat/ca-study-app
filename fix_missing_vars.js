const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /schedule\.slots\.forEach\(\(slot, idx\) => \{\s*container\.innerHTML \+= `/;

const rep = `schedule.slots.forEach((slot, idx) => {
    const [startStr] = slot.startRange.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + slot.duration;
    const isChronoActive = currentMin >= startMin && currentMin < endMin;
    const hasSmartBadge = !isEditMode && (idx === smartActiveIdx);
    const durationStr = slot.duration >= 60 ? (slot.duration / 60) + ' hrs' : slot.duration + ' min';

    container.innerHTML += \``;

if(regex.test(c)){
  c = c.replace(regex, rep);
  fs.writeFileSync('app.js', c);
  console.log('Fixed missing variables!');
} else { console.log('Regex failed'); }
