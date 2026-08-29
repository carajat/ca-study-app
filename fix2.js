const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const regex = /if \(st === 'upcoming'\) return `<div class="cons-slot-status cons-status-upcoming">\$\{_svgUpcoming\}<span>Upcoming<\/span><\/div>`;\s*return `<div class="cons-slot-status cons-status-missed">\$\{_svgPartial\}<span>Missed<\/span><\/div>`;/;

const rep = `if (st === 'upcoming') return \`<div class="cons-slot-status cons-status-upcoming">\${_svgUpcoming}<span>Upcoming</span></div>\`;
            if (st === 'studying') return \`<div class="cons-slot-status" style="color:var(--primary); font-weight:600;"><span class="material-symbols-rounded icon-sm" style="font-size:16px;">timer</span><span>Studying...</span></div>\`;
            return \`<div class="cons-slot-status cons-status-missed">\${_svgPartial}<span>Missed</span></div>\`;`;

if(regex.test(c)) {
  c = c.replace(regex, rep);
  fs.writeFileSync('app.js', c);
  console.log('Success2');
} else {
  console.log('Regex2 not found');
}
