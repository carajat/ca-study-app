const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

c = c.replace(/let chronoActiveIdx = schedule\.slots\.findIndex/g, 'let smartActiveIdx = -1;\n  let chronoActiveIdx = schedule.slots.findIndex');

fs.writeFileSync('app.js', c);
console.log('Fixed ReferenceError');
