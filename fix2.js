const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css = css.replace(/body\[data-theme="light"\] \{\s*--bg-primary: #f2f2f7;\s*--bg-card: #ffffff;/, 'body[data-theme="light"] {\n    --bg-primary: #f0f2f5;\n    --bg-card: #ffffff;');

// Replace --glass-bg and --glass-border in ALL light mode theme blocks and the root light mode block
css = css.replace(/--glass-bg: rgba\(255, 255, 255, 0\.65\);/g, '--glass-bg: rgba(255, 255, 255, 0.95);');
css = css.replace(/--glass-border: rgba\(255, 255, 255, 0\.5\);/g, '--glass-border: rgba(0, 0, 0, 0.08);');

// Replace the mesh gradient in all light mode theme blocks to be transparent/none, or a very subtle tint.
// Wait, currently light mode theme blocks don't redefine --glass-bg or --bg-mesh!
// Let me look at the previous Select-String output.
// YES they do!
// style.css:114:    --bg-mesh: radial-gradient(at 0% 0%, rgba(0, 122, 255, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.05) 0px, transparent 50%);
// We can change the light mode mesh gradients to use a much softer, more subtle color, or just remove them.
// "milk spill" usually means a foggy white cast. The mesh gradients have a color, but with 0.1 opacity on a grey background they might look foggy.
// If we just remove --bg-mesh for light mode, it will look super clean (solid #f0f2f5).
css = css.replace(/--bg-mesh:[^;]+;/g, (match) => {
    // We only want to replace it IF it is inside a light mode block
    // Actually, it's easier to just do a blanket regex for the light mode blocks:
    return match; // fallback
});

fs.writeFileSync('style.css', css);
console.log('done');
