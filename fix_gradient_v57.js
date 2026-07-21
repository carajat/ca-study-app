const fs = require('fs');

// Restore original index.html top part
let indexHtml = fs.readFileSync('index.html', 'utf8');
// Clean up the duplication: find the second <!DOCTYPE html> if any
let docIndex = indexHtml.indexOf('<!DOCTYPE html>', 10);
if (docIndex !== -1) {
  indexHtml = indexHtml.substring(docIndex);
}

// Replace the <select> with the overlay wrapper
indexHtml = indexHtml.replace(
  /<select id="group-selector"[^>]*>[\s\S]*?<\/select>/,
  `          <div style="position: relative; display: inline-block;">
            <h1 id="group-title" style="margin:0;">CA Final Group 2</h1>
            <select id="group-selector" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" onchange="switchGroup(this.value)">
              <option value="group2">CA Final Group 2</option>
              <option value="group1">CA Final Group 1</option>
            </select>
          </div>`
);

// We need to remove the wrapper that `replace_file_content` messed up:
indexHtml = indexHtml.replace(/<div style="text-align: left; position: relative;">[\s\S]*?<h1 id="group-title" style="margin:0;">CA Final Group 2<\/h1>[\s\S]*?<\/div>/, '');

fs.writeFileSync('index.html', indexHtml);

// 2. Update app.js
let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(
  "const gs = document.getElementById('group-selector'); if(gs) gs.value = state.activeGroup;",
  `const gs = document.getElementById('group-selector'); if(gs) gs.value = state.activeGroup;
    const gt = document.getElementById('group-title');
    if(gt) gt.textContent = state.activeGroup === 'group1' ? 'CA Final Group 1' : 'CA Final Group 2';`
);
fs.writeFileSync('app.js', app);

// 3. Update style.css
let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(
  /.app-header h1 \{\n  font-size: 22px;\n  font-weight: 800;\n  background: linear-gradient\(135deg, var\(--purple\), var\(--blue\)\);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n\}\n.app-header select \{\n  font-size: 22px;\n  font-weight: 800;\n  color: var\(--purple\);\n\}/,
  `.app-header h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--purple), var(--blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}`
);
fs.writeFileSync('style.css', css);

// 4. Update sw.js
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'ca-tracker-v[0-9]+';/, "const CACHE_NAME = 'ca-tracker-v57';");
sw = sw.replace(/v=56/g, "v=57");
fs.writeFileSync('sw.js', sw);

console.log('Fixed index.html, app.js, style.css, sw.js');
