const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

c = c.replace(
  /{ id: 'platinum',label: 'Platinum',      color: '#AEB0B4' },/,
  { id: 'platinum',label: 'Platinum',      color: '#AEB0B4' },
    { id: 'bloom',   label: 'Bloom Sky',     color: '#6BA8D9' },
    { id: 'pearl',   label: 'Pearl Blush',   color: '#C98A96' },
    { id: 'sage',    label: 'Sage Mist',     color: '#7FA88A' }
);

c = c.replace(
  /document.body.classList.remove\('theme-navy', 'theme-espresso', 'theme-bronze', 'theme-slate', 'theme-platinum'\);/,
  document.body.classList.remove('theme-navy', 'theme-espresso', 'theme-bronze', 'theme-slate', 'theme-platinum', 'theme-bloom', 'theme-pearl', 'theme-sage');
);

c = c.replace(
  /localStorage.setItem\('ca-theme', themeName\);/,
  localStorage.setItem('ca-theme', themeName);
  if (['bloom', 'pearl', 'sage'].includes(themeName)) {
    setMode('light');
  }
);

fs.writeFileSync('app.js', c);
console.log('Done app.js!');
