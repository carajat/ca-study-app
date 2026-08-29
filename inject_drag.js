const fs = require('fs');
let lines = fs.readFileSync('app.js','utf8').split('\n');

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

if (!lines.join('\n').includes('initDragToScroll')) {
    lines.push(dragFunc);
}

const startAdherence = lines.findIndex(l => l.includes('function updateConsistencyWidget()'));
const endAdherence = lines.findIndex((l,i) => i > startAdherence && l.includes('container.innerHTML = adherenceHtml;'));
if(endAdherence > -1) { 
    lines[endAdherence] = "  container.innerHTML = adherenceHtml;\n  initDragToScroll(document.getElementById('cons-adherence-scroll'));"; 
}

const startTrend = lines.findIndex(l => l.includes('function renderTrendGraph()'));
const endTrend = lines.findIndex((l,i) => i > startTrend && l.includes('wrapper.scrollLeft = wrapper.scrollWidth;'));
if(endTrend > -1) { 
    lines[endTrend] = "      wrapper.scrollLeft = wrapper.scrollWidth;\n    }, 50);\n    initDragToScroll(wrapper);";
    lines[endTrend + 1] = ""; // remove the old closing
    lines[endTrend + 2] = ""; // remove the old closing
}

fs.writeFileSync('app.js', lines.join('\n'));
console.log('Fixed');
