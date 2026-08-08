const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// 1. Replace the first :root block
css = css.replace(/@media \(prefers-color-scheme: light\) \{\s*:root \{([^}]+)\}\s*\}/, 'body[data-theme="light"] {$1}');

// 2. Replace theme blocks (body.theme-*)
css = css.replace(/@media \(prefers-color-scheme: light\) \{\s*body\.theme-([a-z]+) \{([^}]+)\}\s*\}/g, 'body[data-theme="light"].theme-$1 {$2}');

// 3. Replace .study-tracker which has nested rules
// Currently in style.css, it looks like:
/*
@media (prefers-color-scheme: light) {
  .study-tracker { ... }
  .st-timer-display { ... }
  .st-timer-display span { ... }
  .st-timer-display.running span { ... }
  .st-timer-display.paused span { ... }
}
*/
// We just need to replace the whole @media block by prefixing body[data-theme="light"] to each rule.

css = css.replace(/@media \(prefers-color-scheme: light\) \{\s*\.study-tracker \{([\s\S]*?)\}\s*\}/, (match) => {
    let inner = match.substring(match.indexOf('{') + 1, match.lastIndexOf('}'));
    return inner.split('\n').map(line => {
        if (line.trim().startsWith('.') && line.includes('{')) {
            return 'body[data-theme="light"] ' + line;
        }
        return line;
    }).join('\n');
});

// Also fix journal-date-picker
css = css.replace(/@media \(prefers-color-scheme: light\) \{\s*\.journal-date-picker::-webkit-calendar-picker-indicator \{([\s\S]*?)\}\s*\}/, 'body[data-theme="light"] .journal-date-picker::-webkit-calendar-picker-indicator {$1}');

// And schedule-slot
css = css.replace(/@media \(prefers-color-scheme: light\) \{\s*\.schedule-slot \{([\s\S]*?)\}\s*\}/, 'body[data-theme="light"] .schedule-slot {$1}');

fs.writeFileSync('style.css', css);
console.log('done');
