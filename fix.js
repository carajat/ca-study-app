const fs = require('fs');
let c = fs.readFileSync('style.css', 'utf8');
c = c.replace(/body\.theme-navy \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(44, 74, 110, 0.5);', '--toast-shadow: rgba(44, 74, 110, 0.5);\n  --card-gradient-final: linear-gradient(145deg, rgba(44, 74, 110, 0.12), #1c1c1e);'));
c = c.replace(/body\[data-theme="light"\]\.theme-navy \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(44, 74, 110, 0.3);', '--toast-shadow: rgba(44, 74, 110, 0.3);\n  --card-gradient-final: linear-gradient(145deg, rgba(44, 74, 110, 0.15), #ffffff);'));

c = c.replace(/body\.theme-espresso \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(107, 74, 52, 0.5);', '--toast-shadow: rgba(107, 74, 52, 0.5);\n  --card-gradient-final: linear-gradient(145deg, rgba(107, 74, 52, 0.12), #1c1c1e);'));
c = c.replace(/body\[data-theme="light"\]\.theme-espresso \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(107, 74, 52, 0.3);', '--toast-shadow: rgba(107, 74, 52, 0.3);\n  --card-gradient-final: linear-gradient(145deg, rgba(107, 74, 52, 0.15), #ffffff);'));

c = c.replace(/body\.theme-bronze \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(140, 90, 46, 0.5);', '--toast-shadow: rgba(140, 90, 46, 0.5);\n  --card-gradient-final: linear-gradient(145deg, rgba(140, 90, 46, 0.12), #1c1c1e);'));
c = c.replace(/body\[data-theme="light"\]\.theme-bronze \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(140, 90, 46, 0.3);', '--toast-shadow: rgba(140, 90, 46, 0.3);\n  --card-gradient-final: linear-gradient(145deg, rgba(140, 90, 46, 0.15), #ffffff);'));

c = c.replace(/body\.theme-slate \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(74, 85, 96, 0.5);', '--toast-shadow: rgba(74, 85, 96, 0.5);\n  --card-gradient-final: linear-gradient(145deg, rgba(74, 85, 96, 0.12), #1c1c1e);'));
c = c.replace(/body\[data-theme="light"\]\.theme-slate \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(74, 85, 96, 0.3);', '--toast-shadow: rgba(74, 85, 96, 0.3);\n  --card-gradient-final: linear-gradient(145deg, rgba(74, 85, 96, 0.15), #ffffff);'));

c = c.replace(/body\.theme-platinum \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(174, 176, 180, 0.4);', '--toast-shadow: rgba(174, 176, 180, 0.4);\n  --card-gradient-final: linear-gradient(145deg, rgba(174, 176, 180, 0.12), #1c1c1e);'));
c = c.replace(/body\[data-theme="light"\]\.theme-platinum \{[^\}]+\}/, match => match.replace('--toast-shadow: rgba(110, 112, 117, 0.25);', '--toast-shadow: rgba(110, 112, 117, 0.25);\n  --card-gradient-final: linear-gradient(145deg, rgba(174, 176, 180, 0.15), #ffffff);'));

const nT = \/* Bloom Sky */
body.theme-bloom { --primary: #6BA8D9; --accent: #6BA8D9; --on-primary-container: #6BA8D9; --purple: #6BA8D9; --blue: #6BA8D9; --purple-glow: rgba(107, 168, 217, 0.4); --border-glow: rgba(107, 168, 217, 0.3); --checkbox-row-active: rgba(107, 168, 217, 0.1); --toast-shadow: rgba(107, 168, 217, 0.4); --bg-mesh: none; --card-gradient-final: linear-gradient(145deg, rgba(107, 168, 217, 0.12), #1c1c1e); }
body[data-theme="light"].theme-bloom { --primary: #4A83B0; --accent: #4A83B0; --on-primary-container: #4A83B0; --purple: #4A83B0; --blue: #4A83B0; --purple-glow: rgba(107, 168, 217, 0.25); --border-glow: rgba(107, 168, 217, 0.18); --checkbox-row-active: rgba(107, 168, 217, 0.08); --toast-shadow: rgba(107, 168, 217, 0.25); --bg-mesh: none; --card-gradient-final: linear-gradient(145deg, rgba(107, 168, 217, 0.15), #ffffff); }
/* Pearl Blush */
body.theme-pearl { --primary: #C98A96; --accent: #C98A96; --on-primary-container: #C98A96; --purple: #C98A96; --blue: #C98A96; --purple-glow: rgba(201, 138, 150, 0.4); --border-glow: rgba(201, 138, 150, 0.3); --checkbox-row-active: rgba(201, 138, 150, 0.1); --toast-shadow: rgba(201, 138, 150, 0.4); --bg-mesh: none; --card-gradient-final: linear-gradient(145deg, rgba(201, 138, 150, 0.12), #1c1c1e); }
body[data-theme="light"].theme-pearl { --primary: #A36470; --accent: #A36470; --on-primary-container: #A36470; --purple: #A36470; --blue: #A36470; --purple-glow: rgba(201, 138, 150, 0.25); --border-glow: rgba(201, 138, 150, 0.18); --checkbox-row-active: rgba(201, 138, 150, 0.08); --toast-shadow: rgba(201, 138, 150, 0.25); --bg-mesh: none; --card-gradient-final: linear-gradient(145deg, rgba(201, 138, 150, 0.15), #ffffff); }
/* Sage Mist */
body.theme-sage { --primary: #7FA88A; --accent: #7FA88A; --on-primary-container: #7FA88A; --purple: #7FA88A; --blue: #7FA88A; --purple-glow: rgba(127, 168, 138, 0.4); --border-glow: rgba(127, 168, 138, 0.3); --checkbox-row-active: rgba(127, 168, 138, 0.1); --toast-shadow: rgba(127, 168, 138, 0.4); --bg-mesh: none; --card-gradient-final: linear-gradient(145deg, rgba(127, 168, 138, 0.12), #1c1c1e); }
body[data-theme="light"].theme-sage { --primary: #5C8366; --accent: #5C8366; --on-primary-container: #5C8366; --purple: #5C8366; --blue: #5C8366; --purple-glow: rgba(127, 168, 138, 0.25); --border-glow: rgba(127, 168, 138, 0.18); --checkbox-row-active: rgba(127, 168, 138, 0.08); --toast-shadow: rgba(127, 168, 138, 0.25); --bg-mesh: none; --card-gradient-final: linear-gradient(145deg, rgba(127, 168, 138, 0.15), #ffffff); }
\;
if (!c.includes('theme-bloom')) {
  c = c.replace('/* Theme Picker UI */', nT + '\n/* Theme Picker UI */');
  c = c.replace('.tc-platinum { background: #f0f0f0; }', '.tc-platinum { background: #f0f0f0; }\n.tc-bloom { background: #6BA8D9; }\n.tc-pearl { background: #C98A96; }\n.tc-sage { background: #7FA88A; }');
  fs.writeFileSync('style.css', c);
  console.log('Done CSS update!');
} else {
  console.log('Themes already exist in CSS!');
}
