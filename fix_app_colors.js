const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

// Replace warning with text-muted for svg Partial, Warn, WarnSm
c = c.replace(/const _svgPartial = `([^`]*)var\(--warning\)([^`]*)var\(--warning\)([^`]*)var\(--warning\)([^`]*)`;/, "const _svgPartial = `$1var(--text-muted)$2var(--text-muted)$3var(--text-muted)$4`;");
c = c.replace(/const _svgWarn = `([^`]*)var\(--warning\)([^`]*)var\(--warning\)([^`]*)var\(--warning\)([^`]*)`;/, "const _svgWarn = `$1var(--text-muted)$2var(--text-muted)$3var(--text-muted)$4`;");
c = c.replace(/const _svgWarnSm = `([^`]*)var\(--warning\)([^`]*)var\(--warning\)([^`]*)var\(--warning\)([^`]*)`;/, "const _svgWarnSm = `$1var(--text-muted)$2var(--text-muted)$3var(--text-muted)$4`;");

// Replace Pending slot status from warning to text-muted
c = c.replace(/if \(st === 'pending'\) return `<div class="cons-slot-status cons-status-upcoming" style="color:var\(--warning\);"><span/g, "if (st === 'pending') return `<div class=\"cons-slot-status cons-status-upcoming\" style=\"color:var(--text-muted);\"><span");

// For the insights, if they are below pace (warning), they use _svgWarn and "cons-insight-warn". The user said "duration less than 80 percent yellow hai wha b light mode me visibility ki dikkat hai.. to is sab ko grey krde". 
// Adherence widget progress bar colors for < 80%?
// In updateConsistencyWidget, `met` is `res.actualMinutes >= streakGoalMins`.
// If not met, `cons-fill-primary` (purple) or `cons-val-primary` (purple). No yellow there.

// Let's check `calculateOverallProgress` or `renderDashboard` where it might use yellow for < 80%.
// Look for `var(--warning)` inside app.js:
c = c.replace(/else if \(pct > 0\) \{ bg = 'var\(--warning\)'; border = '1px solid var\(--warning\)'; color = '#12141e'; \}/g, "else if (pct > 0) { bg = 'var(--text-muted)'; border = '1px solid var(--text-muted)'; color = '#ffffff'; }");

fs.writeFileSync('app.js', c);
console.log('Fixed app.js colors');
