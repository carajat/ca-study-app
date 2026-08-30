const fs = require('fs');

// 1. Fix adherence HTML in app.js
let app = fs.readFileSync('app.js','utf8');
const searchAdh = 'let adherenceHtml = `<div id="cons-adherence-scroll" style="display:flex; overflow-x:auto; scroll-snap-type: x mandatory; padding-bottom:5px;" class="hide-scrollbar">`;';
const replAdh = 'let adherenceHtml = `<div style="overflow:hidden; width:100%;"><div id="cons-adherence-scroll" style="display:flex; overflow-x:auto; scroll-snap-type: x mandatory; padding-bottom:30px; margin-bottom:-30px;" class="hide-scrollbar">`;';
app = app.replace(searchAdh, replAdh);
const searchAdhEnd = 'container.innerHTML = adherenceHtml;\n  initDragToScroll(document.getElementById(\'cons-adherence-scroll\'));';
const replAdhEnd = 'adherenceHtml += "</div>";\n  container.innerHTML = adherenceHtml;\n  initDragToScroll(document.getElementById(\'cons-adherence-scroll\'));';
app = app.replace(searchAdhEnd, replAdhEnd);
fs.writeFileSync('app.js', app);

// 2. Fix index.html trend chart wrapper
let html = fs.readFileSync('index.html','utf8');
const searchTrend = '<div id="trend-scroll-wrapper" style="width:100%; overflow-x:auto; overflow-y:hidden; padding-bottom:5px; scroll-behavior:smooth;" class="hide-scrollbar">';
const replTrend = '<div style="overflow:hidden; width:100%;"><div id="trend-scroll-wrapper" style="width:100%; overflow-x:auto; overflow-y:hidden; padding-bottom:30px; margin-bottom:-30px; scroll-behavior:smooth;" class="hide-scrollbar">';
html = html.replace(searchTrend, replTrend);
html = html.replace('</canvas>\n        </div>\n    </div>\n</div>', '</canvas>\n        </div></div>\n    </div>\n</div>');
html = html.replace('</canvas>\r\n        </div>\r\n    </div>\r\n</div>', '</canvas>\r\n        </div></div>\r\n    </div>\r\n</div>');
fs.writeFileSync('index.html', html);

console.log('Wrappers applied');
