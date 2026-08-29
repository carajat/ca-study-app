const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

c = c.replace(/isPaused \? 'var\(--warning-light, rgba\(245, 158, 11, 0\.15\)\)' :/g, "isPaused ? 'var(--bg-tertiary, #333333)' :");
c = c.replace(/isPaused \? 'var\(--warning, #F59E0B\)' :/g, "isPaused ? 'var(--text-muted, #888888)' :");
c = c.replace(/isTrkPaused \? 'var\(--warning, #F59E0B\)' :/g, "isTrkPaused ? 'var(--text-muted, #888888)' :");

fs.writeFileSync('app.js', c);
console.log('Colors replaced');
