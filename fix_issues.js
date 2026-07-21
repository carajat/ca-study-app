const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// 1. Fix white text in cards
css = css.replace(/\.countdown-val \{([^}]*)color: #fff;([^}]*)\}/g, '.countdown-val {$1color: var(--text-primary);$2}');
css = css.replace(/\.stat-value \{([^}]*)color: #fff;([^}]*)\}/g, '.stat-value {$1color: var(--text-primary);$2}');
css = css.replace(/\.ca-slot-name \{([^}]*)color: #fff;([^}]*)\}/g, '.ca-slot-name {$1color: var(--text-primary);$2}');
css = css.replace(/\.ps-stats \{([^}]*)color: #fff;([^}]*)\}/g, '.ps-stats {$1color: var(--text-primary);$2}');
css = css.replace(/\.nmc-subject \{([^}]*)color: #fff;([^}]*)\}/g, '.nmc-subject {$1color: var(--text-primary);$2}');
css = css.replace(/\.planner-mock-reminder strong \{([^}]*)color: #fff;([^}]*)\}/g, '.planner-mock-reminder strong {$1color: var(--text-primary);$2}');
css = css.replace(/\.op-value \{([^}]*)color: #fff;([^}]*)\}/g, '.op-value {$1color: var(--text-primary);$2}');

// 2. Replace undefined radius variables
css = css.replace(/var\(--radius-sm\)/g, '12px');
css = css.replace(/var\(--radius\)/g, '20px');

// 3. Add Checkbox border radius
if (!css.includes('input[type="checkbox"] { border-radius: 6px; }')) {
    css += `\ninput[type="checkbox"] { border-radius: 6px; }\n`;
}

fs.writeFileSync('style.css', css);

// 4. Emojis Migration in app.js
let app = fs.readFileSync('app.js', 'utf8');
const migrationCode = `
// Run emoji migration once
function migrateEmojis() {
    if (localStorage.getItem('emojis_migrated') === 'true') return;
    try {
        if (localStorage.getItem('ca_timetable')) {
            let tt = localStorage.getItem('ca_timetable');
            // Specific mapped icons
            tt = tt.replace(/"📚"/g, '"book"').replace(/"🛒"/g, '"local_cafe"').replace(/"📱"/g, '"restaurant"').replace(/"💤"/g, '"bedtime"');
            // Remove remaining emojis
            tt = tt.replace(/[\\u{1F300}-\\u{1F9FF}]|[\\u{2700}-\\u{27BF}]/gu, '');
            localStorage.setItem('ca_timetable', tt);
        }
        if (localStorage.getItem('ca_tasks')) {
            let tasks = localStorage.getItem('ca_tasks');
            tasks = tasks.replace(/[\\u{1F300}-\\u{1F9FF}]|[\\u{2700}-\\u{27BF}]/gu, '').trim();
            localStorage.setItem('ca_tasks', tasks);
        }
        localStorage.setItem('emojis_migrated', 'true');
    } catch(e) {}
}
migrateEmojis();
`;

if (!app.includes('migrateEmojis()')) {
    // Insert right after initial variables or at the top
    app = app.replace('let APP_DATA = {};', migrationCode + '\\nlet APP_DATA = {};');
    fs.writeFileSync('app.js', app);
}

// Bump SW version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v32/g, 'ca-tracker-v33');
fs.writeFileSync('sw.js', sw);

console.log("Fixes applied successfully.");
