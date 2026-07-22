const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(/APP_DATA\.dtChapters/g, 'APP_DATA.group2.dtChapters');
appJs = appJs.replace(/APP_DATA\.idtChapters/g, 'APP_DATA.group2.idtChapters');
appJs = appJs.replace(/APP_DATA\.ibsSubjects/g, 'APP_DATA.group2.ibsSubjects');

fs.writeFileSync('app.js', appJs);
console.log("Patched APP_DATA references.");
