const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// 1. Optimize Backdrop Filters (reduce blur radius)
css = css.replace(/blur\(24px\)/g, 'blur(12px)');
css = css.replace(/blur\(20px\)/g, 'blur(10px)');
css = css.replace(/blur\(8px\)/g, 'blur(6px)');

// 2. Hardware Acceleration for glass-card
const glassCardStart = `.glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;`;

const glassCardOptimized = `.glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  transform: translateZ(0);
  will-change: transform;`;

if (css.includes(glassCardStart)) {
  css = css.replace(glassCardStart, glassCardOptimized);
}

// Hardware Acceleration for modals
const modalContentStart = `.modal-content {
  background: var(--bg-modal);
  border: 1px solid var(--border-color);`;

const modalContentOptimized = `.modal-content {
  background: var(--bg-modal);
  border: 1px solid var(--border-color);
  transform: translateZ(0);
  will-change: transform, opacity;`;

if (css.includes(modalContentStart)) {
  css = css.replace(modalContentStart, modalContentOptimized);
}

// 3. Fix "transition: all" to be specific
// Instead of animating everything (which causes layout trashing), animate common properties
const safeTransitions = 'transition: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform ';
css = css.replace(/transition:\s*all\s*var\(--transition\)/g, safeTransitions + 'var(--transition)');
css = css.replace(/transition:\s*all\s*0\.2s\s*ease/g, safeTransitions + '0.2s ease');
css = css.replace(/transition:\s*all\s*0\.3s\s*ease/g, safeTransitions + '0.3s ease');
css = css.replace(/transition:\s*all\s*0\.4s\s*ease/g, safeTransitions + '0.4s ease');
css = css.replace(/transition:\s*all\s*0\.3s\s*cubic-bezier/g, safeTransitions + '0.3s cubic-bezier');
css = css.replace(/transition:\s*all\s*0\.2s\s*ease-in-out/g, safeTransitions + '0.2s ease-in-out');

fs.writeFileSync('style.css', css);
console.log("CSS Optimizations applied.");
