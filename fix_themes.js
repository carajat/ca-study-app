const fs = require('fs');
const cssPath = 'style.css';
let content = fs.readFileSync(cssPath, 'utf8');

function replaceTheme(themeName, rgbColor) {
    // Dark mode
    let patternDark = new RegExp('(body\\\\.theme-' + themeName + ' \\\\{[^}]+)(--toast-shadow: [^;]+;)', 'g');
    content = content.replace(patternDark, '$1$2\n  --card-gradient-final: linear-gradient(145deg, rgba(' + rgbColor + ', 0.12), #1c1c1e);');
    
    // Light mode
    let patternLight = new RegExp('(body\\\\[data-theme=\"light\"\\\\].theme-' + themeName + ' \\\\{[^}]+)(--toast-shadow: [^;]+;)', 'g');
    content = content.replace(patternLight, '$1$2\n  --card-gradient-final: linear-gradient(145deg, rgba(' + rgbColor + ', 0.15), #ffffff);');
}

replaceTheme('navy', '44, 74, 110');
replaceTheme('espresso', '107, 74, 52');
replaceTheme('bronze', '140, 90, 46');
replaceTheme('slate', '74, 85, 96');
replaceTheme('platinum', '174, 176, 180');

const newThemes = \
/* Bloom Sky */
body.theme-bloom {
  --primary: #6BA8D9;
  --accent: #6BA8D9;
  --on-primary-container: #6BA8D9;
  --purple: #6BA8D9;
  --blue: #6BA8D9;
  --purple-glow: rgba(107, 168, 217, 0.4);
  --border-glow: rgba(107, 168, 217, 0.3);
  --checkbox-row-active: rgba(107, 168, 217, 0.1);
  --toast-shadow: rgba(107, 168, 217, 0.4);
  --bg-mesh: none;
  --card-gradient-final: linear-gradient(145deg, rgba(107, 168, 217, 0.12), #1c1c1e);
}
body[data-theme=\"light\"].theme-bloom {
  --primary: #4A83B0;
  --accent: #4A83B0;
  --on-primary-container: #4A83B0;
  --purple: #4A83B0;
  --blue: #4A83B0;
  --purple-glow: rgba(107, 168, 217, 0.25);
  --border-glow: rgba(107, 168, 217, 0.18);
  --checkbox-row-active: rgba(107, 168, 217, 0.08);
  --toast-shadow: rgba(107, 168, 217, 0.25);
  --bg-mesh: none;
  --card-gradient-final: linear-gradient(145deg, rgba(107, 168, 217, 0.15), #ffffff);
}

/* Pearl Blush */
body.theme-pearl {
  --primary: #C98A96;
  --accent: #C98A96;
  --on-primary-container: #C98A96;
  --purple: #C98A96;
  --blue: #C98A96;
  --purple-glow: rgba(201, 138, 150, 0.4);
  --border-glow: rgba(201, 138, 150, 0.3);
  --checkbox-row-active: rgba(201, 138, 150, 0.1);
  --toast-shadow: rgba(201, 138, 150, 0.4);
  --bg-mesh: none;
  --card-gradient-final: linear-gradient(145deg, rgba(201, 138, 150, 0.12), #1c1c1e);
}
body[data-theme=\"light\"].theme-pearl {
  --primary: #A36470;
  --accent: #A36470;
  --on-primary-container: #A36470;
  --purple: #A36470;
  --blue: #A36470;
  --purple-glow: rgba(201, 138, 150, 0.25);
  --border-glow: rgba(201, 138, 150, 0.18);
  --checkbox-row-active: rgba(201, 138, 150, 0.08);
  --toast-shadow: rgba(201, 138, 150, 0.25);
  --bg-mesh: none;
  --card-gradient-final: linear-gradient(145deg, rgba(201, 138, 150, 0.15), #ffffff);
}

/* Sage Mist */
body.theme-sage {
  --primary: #7FA88A;
  --accent: #7FA88A;
  --on-primary-container: #7FA88A;
  --purple: #7FA88A;
  --blue: #7FA88A;
  --purple-glow: rgba(127, 168, 138, 0.4);
  --border-glow: rgba(127, 168, 138, 0.3);
  --checkbox-row-active: rgba(127, 168, 138, 0.1);
  --toast-shadow: rgba(127, 168, 138, 0.4);
  --bg-mesh: none;
  --card-gradient-final: linear-gradient(145deg, rgba(127, 168, 138, 0.12), #1c1c1e);
}
body[data-theme=\"light\"].theme-sage {
  --primary: #5C8366;
  --accent: #5C8366;
  --on-primary-container: #5C8366;
  --purple: #5C8366;
  --blue: #5C8366;
  --purple-glow: rgba(127, 168, 138, 0.25);
  --border-glow: rgba(127, 168, 138, 0.18);
  --checkbox-row-active: rgba(127, 168, 138, 0.08);
  --toast-shadow: rgba(127, 168, 138, 0.25);
  --bg-mesh: none;
  --card-gradient-final: linear-gradient(145deg, rgba(127, 168, 138, 0.15), #ffffff);
}
\;

content = content.replace('/* Theme Picker UI */', newThemes + '\n/* Theme Picker UI */');
fs.writeFileSync(cssPath, content);
console.log('done');
