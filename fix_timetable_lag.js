const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// The issue is multiple blur filters overlapping during scroll.
// Let's remove backdrop-filter from schedule slots since there are many of them.

const fixCss = `
/* Fix for Timetable Scroll Lag */
.schedule-slot {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background: rgba(30, 30, 30, 0.7); /* Give it a slightly more solid background to compensate */
}

@media (prefers-color-scheme: light) {
  .schedule-slot {
    background: rgba(255, 255, 255, 0.8);
  }
}
`;

if (!css.includes('/* Fix for Timetable Scroll Lag */')) {
  css += '\n' + fixCss;
  fs.writeFileSync('style.css', css);
  console.log('Timetable lag fix applied.');
}
