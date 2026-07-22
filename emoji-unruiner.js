const fs = require('fs');

// 1. We will undo the previous string replacements in app.js and data.js safely.
let data = fs.readFileSync('data.js', 'utf8');

// Undo bad data.js changes
data = data.replace(/"<span class='material-symbols-rounded icon-sm'>wb_sunny<\/span>"/g, '"wb_sunny"');
data = data.replace(/"<span class='material-symbols-rounded icon-sm'>local_cafe<\/span>"/g, '"local_cafe"');
data = data.replace(/"<span class='material-symbols-rounded icon-sm'>restaurant<\/span>"/g, '"restaurant"');
data = data.replace(/"<span class='material-symbols-rounded icon-sm'>bedtime<\/span>"/g, '"bedtime"');

data = data.replace(/"<span class='material-symbols-rounded icon-sm' style='vertical-align:middle;'>menu_book<\/span> Give Primary Subject at least 8 hours"/g, '"Give Primary Subject at least 8 hours"');
data = data.replace(/"<span class='material-symbols-rounded icon-sm' style='vertical-align:middle;'>edit_document<\/span> Solve\/Write at least 1 Question by hand"/g, '"Solve/Write at least 1 Question by hand"');
data = data.replace(/"<span class='material-symbols-rounded icon-sm' style='vertical-align:middle;'>save<\/span> Keep Study Content downloaded, if any"/g, '"Keep Study Content downloaded, if any"');

// Fix remaining emojis in data.js if they were never modified successfully
data = data.replace(/"☀️"/g, '"wb_sunny"');
data = data.replace(/"☕"/g, '"local_cafe"');
data = data.replace(/"🍽️"/g, '"restaurant"');
data = data.replace(/"😴"/g, '"bedtime"');
data = data.replace(/"📖 Give Primary Subject at least 8 hours"/g, '"Give Primary Subject at least 8 hours"');
data = data.replace(/"✍️ Solve\/Write at least 1 Question by hand"/g, '"Solve/Write at least 1 Question by hand"');
data = data.replace(/"💾 Keep Study Content downloaded, if any"/g, '"Keep Study Content downloaded, if any"');

fs.writeFileSync('data.js', data);

// 2. Fix app.js
let app = fs.readFileSync('app.js', 'utf8');

// The original strings were wrapped in textContent, so we must change them to innerHTML!
app = app.replace(/document\.getElementById\('modal-title'\)\.textContent = 'Add Manual Log'/g, "document.getElementById('modal-title').innerHTML = 'Add Manual Log'"); // if needed

// Fix statusEl
app = app.replace(/statusEl\.textContent = '<span class="material-symbols-rounded/g, "statusEl.innerHTML = '<span class=\"material-symbols-rounded");
app = app.replace(/statusEl\.textContent = '🟢 Studying...'/g, "statusEl.innerHTML = '<span class=\"material-symbols-rounded icon-sm\" style=\"color:var(--success-color); vertical-align:middle; font-size:16px;\">radio_button_checked</span> Studying...'");

app = app.replace(/document\.getElementById\('st-status'\)\.textContent = '<span class="material-symbols-rounded/g, "document.getElementById('st-status').innerHTML = '<span class=\"material-symbols-rounded");
app = app.replace(/document\.getElementById\('st-status'\)\.textContent = '⚠️ Please select a subject first'/g, "document.getElementById('st-status').innerHTML = '<span class=\"material-symbols-rounded icon-sm\" style=\"color:var(--accent); vertical-align:middle; font-size:16px;\">warning</span> Please select a subject first'");
app = app.replace(/document\.getElementById\('st-status'\)\.textContent = '✅ Saved ' \+ hh \+ 'h ' \+ mm \+ 'm to journal'/g, "document.getElementById('st-status').innerHTML = '<span class=\"material-symbols-rounded icon-sm\" style=\"color:var(--success-color); vertical-align:middle; font-size:16px;\">check_circle</span> Saved ' + hh + 'h ' + mm + 'm to journal'");

// Fix migration script inside app.js
app = app.replace(/slot\.icon = '<span class="material-symbols-rounded icon-sm">wb_sunny<\/span>'/g, "slot.icon = 'wb_sunny'");
app = app.replace(/slot\.icon = '<span class="material-symbols-rounded icon-sm">local_cafe<\/span>'/g, "slot.icon = 'local_cafe'");
app = app.replace(/slot\.icon = '<span class="material-symbols-rounded icon-sm">restaurant<\/span>'/g, "slot.icon = 'restaurant'");
app = app.replace(/slot\.icon = '<span class="material-symbols-rounded icon-sm">bedtime<\/span>'/g, "slot.icon = 'bedtime'");

app = app.replace(/if \(g\.startsWith\('📖 '\)\) \{ g = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">menu_book<\/span> ' \+ g\.substring\(3\); emojisModified = true; \}/g, "if (g.startsWith('📖 ') || g.includes('menu_book</span>')) { g = 'Give Primary Subject at least 8 hours'; emojisModified = true; }");
app = app.replace(/if \(g\.startsWith\('✍️ '\)\) \{ g = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">edit_document<\/span> ' \+ g\.substring\(3\); emojisModified = true; \}/g, "if (g.startsWith('✍️ ') || g.includes('edit_document</span>')) { g = 'Solve/Write at least 1 Question by hand'; emojisModified = true; }");
app = app.replace(/if \(g\.startsWith\('💾 '\)\) \{ g = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">save<\/span> ' \+ g\.substring\(3\); emojisModified = true; \}/g, "if (g.startsWith('💾 ') || g.includes('save</span>')) { g = 'Keep Study Content downloaded, if any'; emojisModified = true; }");

fs.writeFileSync('app.js', app);

// 3. Bump version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v155/g, 'v156');
fs.writeFileSync('sw.js', sw);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=155/g, 'v=156');
fs.writeFileSync('index.html', index);

console.log('Emoji fix script completed safely.');
