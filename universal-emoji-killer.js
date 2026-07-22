const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

const universalMigrationCode = `
  // ULTIMATE EMOJI TO MATERIAL ICON MIGRATION
  let dataStr = JSON.stringify(DYNAMIC_DATA);
  const emojiMap = {
    '☀️': 'wb_sunny', '☕': 'local_cafe', '🍽️': 'restaurant', '😴': 'bedtime',
    '📚': 'menu_book', '📖': 'menu_book', '✍️': 'edit_document', '💾': 'save',
    '🏋️': 'fitness_center', '📱': 'phone_iphone', '📺': 'tv', '🟢': 'radio_button_checked',
    '⚠️': 'warning', '✅': 'check_circle', '📅': 'calendar_month', '📊': 'bar_chart',
    '⏱️': 'timer', '📝': 'edit_document', '📁': 'folder', '📘': 'menu_book',
    '💪': 'fitness_center', '🏃': 'directions_run', '🧘': 'self_improvement',
    '🚿': 'shower', '🚌': 'directions_bus', '🚗': 'directions_car'
  };
  
  // Replace all known mapped emojis with their material icon equivalents in strings
  Object.keys(emojiMap).forEach(emoji => {
    const regex = new RegExp(emoji, 'g');
    dataStr = dataStr.replace(regex, emojiMap[emoji]);
  });
  
  // Strip any remaining emojis globally
  const emojiRegex = /[\\u{1F300}-\\u{1F9FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}\\u{1F1E6}-\\u{1F1FF}\\u{1F200}-\\u{1F251}\\u{1F600}-\\u{1F64F}\\u{1F680}-\\u{1F6FF}]/gu;
  dataStr = dataStr.replace(emojiRegex, '');
  
  // Also clean up any 'book' ligatures that act as emojis
  dataStr = dataStr.replace(/"icon":"book"/g, '"icon":"menu_book"');
  
  DYNAMIC_DATA = JSON.parse(dataStr);
  saveDynamicData();
`;

// Find where we added the previous migration code and replace it
const oldMigrationStart = "let emojisModified = false;";
const oldMigrationEnd = "if (emojisModified) saveDynamicData();";

if (app.includes(oldMigrationStart) && app.includes(oldMigrationEnd)) {
  const startIdx = app.indexOf(oldMigrationStart);
  const endIdx = app.indexOf(oldMigrationEnd) + oldMigrationEnd.length;
  app = app.substring(0, startIdx) + universalMigrationCode + app.substring(endIdx);
} else {
  // Fallback if not found perfectly
  app = app.replace('loadDynamicData();', 'loadDynamicData();\n' + universalMigrationCode);
}

fs.writeFileSync('app.js', app);

// Bump version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v157/g, 'v158');
fs.writeFileSync('sw.js', sw);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=157/g, 'v=158');
fs.writeFileSync('index.html', index);

console.log('Universal emoji killer completed.');
