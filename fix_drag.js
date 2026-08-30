const fs = require('fs');
let app = fs.readFileSync('app.js','utf8');
const dragFunc = `
function initDragToScroll(el) {
  if (!el || el.dataset.dragInit) return;
  el.dataset.dragInit = 'true';
  let isDown = false;
  let startX;
  let scrollLeft;
  let origScrollBehavior = el.style.scrollBehavior || '';
  let origScrollSnapType = el.style.scrollSnapType || '';
  
  el.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.scrollBehavior = 'auto';
    el.style.scrollSnapType = 'none';
  });
  el.addEventListener('mouseleave', () => {
    isDown = false;
    el.style.cursor = '';
    el.style.scrollBehavior = origScrollBehavior;
    el.style.scrollSnapType = origScrollSnapType;
  });
  el.addEventListener('mouseup', () => {
    isDown = false;
    el.style.cursor = '';
    el.style.scrollBehavior = origScrollBehavior;
    el.style.scrollSnapType = origScrollSnapType;
  });
  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  });
}
`;
app = app.replace(/function initDragToScroll\(el\) \{[\s\S]*?\n\}\n/, dragFunc + '\n');
fs.writeFileSync('app.js', app);
console.log('Fixed dragToScroll function');
