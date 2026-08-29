const fs = require('fs');
let app = fs.readFileSync('app.js','utf8');
const dragFunc = `
function initDragToScroll(el) {
  if (!el || el.dataset.dragInit) return;
  el.dataset.dragInit = 'true';
  let isDown = false;
  let startX;
  let scrollLeft;
  el.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('mouseleave', () => {
    isDown = false;
    el.style.cursor = '';
  });
  el.addEventListener('mouseup', () => {
    isDown = false;
    el.style.cursor = '';
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

app += '\n' + dragFunc;
app = app.replace(/wrapper\.scrollLeft = wrapper\.scrollWidth;\n    \}, 50\);\n  \}/g, 'wrapper.scrollLeft = wrapper.scrollWidth;\n    }, 50);\n    initDragToScroll(wrapper);\n  }');
app = app.replace(/adherenceHtml;\n\}/g, "adherenceHtml;\n  initDragToScroll(document.getElementById('cons-adherence-scroll'));\n}");

fs.writeFileSync('app.js', app);
console.log('Drag-to-scroll integrated!');
