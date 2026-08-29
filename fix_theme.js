const fs = require('fs');

// 1. Update manifest.json
let manifest = fs.readFileSync('manifest.json','utf8');
manifest = manifest.replace(/"theme_color"\s*:\s*"#6C3CE1"/, '"theme_color": "#000000"');
manifest = manifest.replace(/"background_color"\s*:\s*"#0a0b14"/, '"background_color": "#000000"');
fs.writeFileSync('manifest.json', manifest);

// 2. Update index.html
let html = fs.readFileSync('index.html','utf8');
html = html.replace(/<meta name="theme-color" content="#0a0b14" id="meta-theme-color">/, '<meta name="theme-color" content="#000000" id="meta-theme-color">');
html = html.replace(/v354/g, 'v355'); // bump version
fs.writeFileSync('index.html', html);

// 3. Update app.js
let app = fs.readFileSync('app.js','utf8');
app = app.replace(/isLight \? "#f4f5f9" : "#0a0b14"/g, 'isLight ? "#f0f2f5" : "#000000"');
app = app.replace(/v354/g, 'v355'); // bump version
fs.writeFileSync('app.js', app);

// 4. Update sw.js
let sw = fs.readFileSync('sw.js','utf8');
sw = sw.replace(/v354/g, 'v355'); // bump version
fs.writeFileSync('sw.js', sw);

console.log('Fixed theme colors everywhere and bumped to v355');
