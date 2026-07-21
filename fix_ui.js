const fs = require('fs');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');
// Remove emojis and replace with material symbols where appropriate
html = html.replace('✕', '<span class="material-symbols-rounded">close</span>');
html = html.replace('<div class="stat-icon">📖</div>', '<div class="stat-icon"><span class="material-symbols-rounded">book</span></div>');
html = html.replace('<div class="stat-icon">📝</div>', '<div class="stat-icon"><span class="material-symbols-rounded">edit_document</span></div>');
html = html.replace('📅 Current Activity', '<span class="material-symbols-rounded icon-sm">schedule</span> Current Activity');
html = html.replace("🗓️ Today's Plan", "<span class=\"material-symbols-rounded icon-sm\">calendar_today</span> Today's Plan");
html = html.replace('<div class="quote-icon">💬</div>', '<div class="quote-icon"><span class="material-symbols-rounded">format_quote</span></div>');
html = html.replace('<h3>📈 Score Trend</h3>', '<h3><span class="material-symbols-rounded icon-sm">trending_up</span> Score Trend</h3>');
html = html.replace('<h3>📚 Primary Subject</h3>', '<h3><span class="material-symbols-rounded icon-sm">menu_book</span> Primary Subject</h3>');
html = html.replace('<h3>📖 Secondary Subject</h3>', '<h3><span class="material-symbols-rounded icon-sm">import_contacts</span> Secondary Subject</h3>');
html = html.replace('<h3>📝 Quick Tasks</h3>', '<h3><span class="material-symbols-rounded icon-sm">task_alt</span> Quick Tasks</h3>');
html = html.replace('📋 Copy to Tomorrow', '<span class="material-symbols-rounded icon-sm">content_copy</span> Copy to Tomorrow');
html = html.replace('<span class="nav-icon">🏠</span>', '<span class="material-symbols-rounded nav-icon">home</span>');
html = html.replace('<span class="nav-icon">📖</span>', '<span class="material-symbols-rounded nav-icon">book</span>');
html = html.replace('<span class="nav-icon">📊</span>', '<span class="material-symbols-rounded nav-icon">bar_chart</span>');
html = html.replace('<span class="nav-icon">⚙️</span>', '<span class="material-symbols-rounded nav-icon">settings</span>');

// Add Theme Toggle Button to header
if (!html.includes('id="themeToggleBtn"')) {
    html = html.replace('<h1 class="app-title">CA Tracker</h1>', '<h1 class="app-title">CA Tracker</h1>\n      <button id="themeToggleBtn" onclick="toggleTheme()" style="background:none;border:none;color:inherit;cursor:pointer"><span class="material-symbols-rounded">light_mode</span></button>');
}

fs.writeFileSync('index.html', html);

// 2. UPDATE app.js
let app = fs.readFileSync('app.js', 'utf8');
app = app.replace("name: '📊 IBS — AFM'", "name: 'IBS — AFM'");
app = app.replace("name: '🔍 IBS — Audit'", "name: 'IBS — Audit'");
app = app.replace("name: '💰 IBS — SC&PM (SPOM B)'", "name: 'IBS — SC&PM (SPOM B)'");
app = app.replace("showToast('Copied to tomorrow! 📋');", "showToast('Copied to tomorrow!');");
app = app.replace('<span class="menu-btn-icon">🎨</span> Customize Theme', '<span class="material-symbols-rounded menu-btn-icon">palette</span> Customize Theme');
app = app.replace('<span class="menu-btn-icon">📄</span> Share Progress (PDF)', '<span class="material-symbols-rounded menu-btn-icon">picture_as_pdf</span> Share Progress (PDF)');
app = app.replace("openModal('🎨 Select Theme'", "openModal('Select Theme'");
app = app.replace("🔙 Back to Menu", "Back to Menu");
app = app.replace("showToast('Shared successfully! 🚀');", "showToast('Shared successfully!');");
app = app.replace("showToast('Data restored successfully! Refreshing... 🔄');", "showToast('Data restored successfully! Refreshing...');");

// Add toggleTheme logic
if (!app.includes('function toggleTheme()')) {
    const themeLogic = `
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}
function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if(btn) btn.innerHTML = theme === 'light' ? '<span class="material-symbols-rounded">dark_mode</span>' : '<span class="material-symbols-rounded">light_mode</span>';
}
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        updateThemeIcon(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    }
});
`;
    app += themeLogic;
}
fs.writeFileSync('app.js', app);

// 3. UPDATE data.js
let data = fs.readFileSync('data.js', 'utf8');
data = data.replace(/icon: "📚"/g, 'icon: "book"');
data = data.replace(/icon: "🛒"/g, 'icon: "local_cafe"');
data = data.replace(/icon: "📱"/g, 'icon: "restaurant"');
data = data.replace(/icon: "💤"/g, 'icon: "bedtime"');
data = data.replace(/🌅 /g, '');
data = data.replace(/🌙 /g, '');
data = data.replace(/📝 /g, '');
data = data.replace(/📗 /g, '');
data = data.replace(/📚 /g, '');
data = data.replace(/📋 /g, '');
fs.writeFileSync('data.js', data);

// 4. UPDATE style.css
let css = fs.readFileSync('style.css', 'utf8');
// Replace border radius to remove sharp boxes
css = css.replace(/--border-radius-sm: 8px;/g, '--border-radius-sm: 12px;');
css = css.replace(/border-radius: 4px;/g, 'border-radius: 12px;');
css = css.replace(/border-radius: 6px;/g, 'border-radius: 12px;');
css = css.replace(/border-radius: 8px;/g, 'border-radius: 12px;');
css = css.replace(/border-radius: 3px;/g, 'border-radius: 12px;');
css = css.replace(/border-radius: 0;/g, 'border-radius: 12px;');

// Create data-theme="light" block
const lightModeVars = `
[data-theme="light"] {
    --bg-primary: #f2f2f7;
    --bg-card: #ffffff;
    --text-primary: #000000;
    --text-secondary: #3c3c43;
    --text-muted: #8e8e93;
    --primary: #007aff;
    --primary-container: #ffffff;
    --on-primary: #ffffff;
    --on-primary-container: #007aff;
    --accent: #007aff;
    --success: #34c759;
    --danger: #ff3b30;
    --warning: #ffcc00;
    --border-color: rgba(0,0,0,0.1);
    
    --glass-bg: rgba(255, 255, 255, 0.65);
    --glass-border: rgba(255, 255, 255, 0.5);
    --bg-mesh: radial-gradient(at 0% 0%, rgba(0, 122, 255, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.05) 0px, transparent 50%);
    --purple: #007aff;
    --blue: #007aff;
    --green: #34c759;
    --red: #ff3b30;
    --yellow: #ffcc00;
    --orange: #ff9500;
    --checkbox-row-odd: rgba(0,0,0,0.02);
    --checkbox-row-active: rgba(0, 122, 255, 0.08);
    --card-gradient-final: linear-gradient(145deg, #fdf2f2, #ffffff);
    --card-gradient-countdown: linear-gradient(145deg, #eef0ff, #ffffff);
    --toast-shadow: rgba(0, 122, 255, 0.25);
    --scrollbar-thumb: #d1d5db;
    --nav-bg: rgba(255, 255, 255, 0.7);
    --bg-card-hover: #f2f2f7;
}

[data-theme="dark"] {
  --bg-primary: #000000;
  --bg-card: #1c1c1e;
  --text-primary: #ffffff;
  --text-secondary: #ebebf5;
  --text-muted: #8e8e93;
  --primary: #0a84ff;
  --primary-container: #1c1c1e;
  --on-primary: #ffffff;
  --on-primary-container: #0a84ff;
  --accent: #0a84ff;
  --success: #34c759;
  --danger: #ff453a;
  --warning: #ffd60a;
  --border-color: rgba(255,255,255,0.15);
  --glass-bg: rgba(28, 28, 30, 0.65);
  --glass-border: rgba(255, 255, 255, 0.1);
  --bg-mesh: radial-gradient(at 0% 0%, rgba(10, 132, 255, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(10, 132, 255, 0.1) 0px, transparent 50%);
  --purple: #0a84ff;
  --blue: #0a84ff;
  --green: #34c759;
  --red: #ff453a;
  --yellow: #ffd60a;
  --orange: #ff9f0a;
  --checkbox-row-odd: rgba(255,255,255,0.01);
  --checkbox-row-active: rgba(10, 132, 255, 0.1);
  --card-gradient-final: linear-gradient(145deg, #1a1a1c, #1c1c1e);
  --card-gradient-countdown: linear-gradient(145deg, #151830, #1c1c1e);
  --toast-shadow: rgba(0,0,0,0.5);
  --scrollbar-thumb: #3a3a3c;
  --nav-bg: rgba(28, 28, 30, 0.7);
  --bg-card-hover: #2c2c2e;
}
`;
if (!css.includes('[data-theme="light"]')) {
    css += lightModeVars;
}

// In app.js renderPlanner(), the icon is passed. We need to render it as a material symbol if it doesn't contain emoji.
// Actually, earlier icon was "📚". Now it's "book". We should change how it renders in HTML.
// We'll replace it in app.js.
fs.writeFileSync('style.css', css);

// Fix renderPlanner icon rendering in app.js
app = fs.readFileSync('app.js', 'utf8');
app = app.replace('<div class="ca-slot-icon">\${slot.icon}</div>', '<div class="ca-slot-icon"><span class="material-symbols-rounded">\${slot.icon}</span></div>');
fs.writeFileSync('app.js', app);

console.log('UI Fixed');
