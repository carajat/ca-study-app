const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

const hideCss = `
.hide-scrollbar::-webkit-scrollbar,
.hide-scrollbar::-webkit-scrollbar-track,
.hide-scrollbar::-webkit-scrollbar-thumb {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}`;

css = css.replace(/\.hide-scrollbar::-webkit-scrollbar\s*\{[\s\S]*?\}/, hideCss);

fs.writeFileSync('style.css', css);
console.log('Fixed CSS hide-scrollbar');
