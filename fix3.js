const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css = css.replace(/body\[data-theme="light"\] \{\s*--bg-primary: #f2f2f7;\s*--bg-card: #ffffff;/, 'body[data-theme="light"] {\n    --bg-primary: #f0f2f5;\n    --bg-card: #ffffff;');

// Process each block separately
// We want to find blocks that start with `body[data-theme="light"]` and replace the variables inside them.
css = css.replace(/body\[data-theme="light"\](?:[^{]*)\{([\s\S]*?)\}/g, (match, inner) => {
    // Only modify the inner content of these specific light mode blocks
    
    // 1. Replace glass-bg
    inner = inner.replace(/--glass-bg: rgba\(255, 255, 255, 0\.65\);/g, '--glass-bg: rgba(255, 255, 255, 0.95);');
    
    // 2. Replace glass-border
    inner = inner.replace(/--glass-border: rgba\(255, 255, 255, 0\.5\);/g, '--glass-border: rgba(0, 0, 0, 0.08);');
    
    // 3. Replace bg-mesh
    inner = inner.replace(/--bg-mesh: radial-gradient[^;]+;/g, '--bg-mesh: none;');
    
    // 4. Also fix the schedule-slot if we find it, although that's not inside a block with these vars.
    return match.replace(match.substring(match.indexOf('{') + 1, match.lastIndexOf('}')), inner);
});

// Also manually add border and shadow to .schedule-slot
css = css.replace(/\.schedule-slot \{\s*backdrop-filter: none !important;\s*-webkit-backdrop-filter: none !important;\s*background: var\(--bg-card\);(?:[^\n]*)\n\}/, 
`.schedule-slot {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}`);

fs.writeFileSync('style.css', css);
console.log('done');
