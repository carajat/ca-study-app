const fs = require('fs');

// 1. Fix CSS for mobile dragging
let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(
  '.drag-handle { color: var(--text-secondary); cursor: grab; display: none; vertical-align: middle; margin-right: 12px; }',
  '.drag-handle { color: var(--text-secondary); cursor: grab; display: none; vertical-align: middle; margin-right: 12px; touch-action: none; }'
);
if (!css.includes('touch-action: none')) {
  css += '\n.drag-handle { touch-action: none; }\n';
}
fs.writeFileSync('style.css', css);

// 2. Fix SortableJS configuration for mobile
let app = fs.readFileSync('app.js', 'utf8');

const sortableConfig = `const s = new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',
      delay: 150, // Time in ms to define when the sorting should start
      delayOnTouchOnly: true, // Only delay if user is using touch
      touchStartThreshold: 3, // px, how many pixels the point should move before cancelling a delayed drag event
      fallbackTolerance: 3,`;

app = app.replace(
  `const s = new Sortable(container, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'sortable-ghost',`,
  sortableConfig
);

fs.writeFileSync('app.js', app);

// Bump SW
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v46/g, 'ca-tracker-v47');
fs.writeFileSync('sw.js', sw);

console.log('Mobile touch fix applied');
