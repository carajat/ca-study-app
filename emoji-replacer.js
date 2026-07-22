const fs = require('fs');

// 1. Replace emojis in data.js
let data = fs.readFileSync('data.js', 'utf8');
data = data.replace(/"☀️"/g, '"<span class=\'material-symbols-rounded icon-sm\'>wb_sunny</span>"');
data = data.replace(/"☕"/g, '"<span class=\'material-symbols-rounded icon-sm\'>local_cafe</span>"');
data = data.replace(/"🍽️"/g, '"<span class=\'material-symbols-rounded icon-sm\'>restaurant</span>"');
data = data.replace(/"😴"/g, '"<span class=\'material-symbols-rounded icon-sm\'>bedtime</span>"');

data = data.replace(/"📖 Give Primary Subject at least 8 hours"/g, '"<span class=\'material-symbols-rounded icon-sm\' style=\'vertical-align:middle;\'>menu_book</span> Give Primary Subject at least 8 hours"');
data = data.replace(/"✍️ Solve\/Write at least 1 Question by hand"/g, '"<span class=\'material-symbols-rounded icon-sm\' style=\'vertical-align:middle;\'>edit_document</span> Solve/Write at least 1 Question by hand"');
data = data.replace(/"💾 Keep Study Content downloaded, if any"/g, '"<span class=\'material-symbols-rounded icon-sm\' style=\'vertical-align:middle;\'>save</span> Keep Study Content downloaded, if any"');
fs.writeFileSync('data.js', data);

// 2. Replace emojis in app.js
let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(/'☰ Settings & Tools'/g, '\'<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">settings</span> Settings & Tools\'');
app = app.replace(/'🟢 Studying...'/g, '\'<span class="material-symbols-rounded icon-sm" style="color:var(--success-color); vertical-align:middle; font-size:16px;">radio_button_checked</span> Studying...\'');
app = app.replace(/'⚠️ Please select a subject first'/g, '\'<span class="material-symbols-rounded icon-sm" style="color:var(--accent); vertical-align:middle; font-size:16px;">warning</span> Please select a subject first\'');
app = app.replace(/'✅ Saved ' \+ hh \+ 'h ' \+ mm \+ 'm to journal'/g, '\'<span class="material-symbols-rounded icon-sm" style="color:var(--success-color); vertical-align:middle; font-size:16px;">check_circle</span> Saved \' + hh + \'h \' + mm + \'m to journal\'');

// 3. Add migration script inside init() after loadDynamicData()
const migrationCode = `
  // Migrate Emojis for existing users
  let emojisModified = false;
  if (DYNAMIC_DATA.schedules) {
    Object.keys(DYNAMIC_DATA.schedules).forEach(key => {
      const slots = DYNAMIC_DATA.schedules[key].slots || [];
      slots.forEach(slot => {
        if (slot.icon === '☀️') { slot.icon = '<span class="material-symbols-rounded icon-sm">wb_sunny</span>'; emojisModified = true; }
        if (slot.icon === '☕') { slot.icon = '<span class="material-symbols-rounded icon-sm">local_cafe</span>'; emojisModified = true; }
        if (slot.icon === '🍽️') { slot.icon = '<span class="material-symbols-rounded icon-sm">restaurant</span>'; emojisModified = true; }
        if (slot.icon === '😴') { slot.icon = '<span class="material-symbols-rounded icon-sm">bedtime</span>'; emojisModified = true; }
      });
    });
  }
  if (DYNAMIC_DATA.goals) {
    const newGoals = [];
    DYNAMIC_DATA.goals.forEach(goal => {
      let g = goal;
      if (typeof g === 'string') {
        if (g.startsWith('📖 ')) { g = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">menu_book</span> ' + g.substring(3); emojisModified = true; }
        if (g.startsWith('✍️ ')) { g = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">edit_document</span> ' + g.substring(3); emojisModified = true; }
        if (g.startsWith('💾 ')) { g = '<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">save</span> ' + g.substring(3); emojisModified = true; }
      }
      newGoals.push(g);
    });
    DYNAMIC_DATA.goals = newGoals;
  }
  if (emojisModified) saveDynamicData();
`;

app = app.replace('loadDynamicData();', 'loadDynamicData();\n' + migrationCode);
fs.writeFileSync('app.js', app);

// 4. Update sw.js and index.html to v155
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v152/g, 'v155');
fs.writeFileSync('sw.js', sw);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=152/g, 'v=155');
fs.writeFileSync('index.html', index);

console.log('Script completed safely.');
