const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');
const regex = /if \(st === 'upcoming'\) return `<div class="cons-slot-status cons-status-upcoming">\$\{_svgUpcoming\}<span>Upcoming<\/span><\/div>`;/;
const rep = `if (st === 'upcoming') return \`<div class="cons-slot-status cons-status-upcoming">\${_svgUpcoming}<span>Upcoming</span></div>\`;
            if (st === 'pending') return \`<div class="cons-slot-status cons-status-upcoming" style="color:var(--warning);"><span class="material-symbols-rounded icon-sm" style="font-size:16px;">pending_actions</span><span>Pending</span></div>\`;`;
if(regex.test(c)){
  c = c.replace(regex, rep);
  fs.writeFileSync('app.js', c);
  console.log('Success Pending');
} else { console.log('Pending regex failed'); }
