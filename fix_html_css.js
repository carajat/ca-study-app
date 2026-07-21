const fs = require('fs');

// 1. Remove polyfill from index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<!-- Mobile Drag and Drop Polyfill -->[\s\S]*?<\/script>\s*<\/script>\s*<\/head>/, '</head>');
// Also clean up any lingering script tags for polyfill if regex above missed some lines
html = html.replace(/<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/npm\/mobile-drag-drop[^>]+>/g, '');
html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/mobile-drag-drop[^>]+><\/script>/g, '');
html = html.replace(/<script>\s*window\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>/, '');
fs.writeFileSync('index.html', html);

// 2. Add premium CSS for arrows in style.css
let css = fs.readFileSync('style.css', 'utf8');
const premiumArrowCSS = `
/* Premium Up/Down Arrows */
.move-btn {
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  margin-right: 4px;
}
.move-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.move-btn:active {
  transform: translateY(0);
}
.move-btn .material-symbols-rounded {
  font-size: 18px;
}
.move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
`;
if (!css.includes('.move-btn {')) {
  css += '\n' + premiumArrowCSS;
}
fs.writeFileSync('style.css', css);

console.log('Processed HTML and CSS.');
