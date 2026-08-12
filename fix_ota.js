const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldCheckStr = "const currentVersion = localStorage.getItem('app_ota_version') || 'v0';";
const newCheckStr = "const currentVersion = localStorage.getItem('app_ota_version') || (typeof BUILD_VERSION !== 'undefined' ? BUILD_VERSION : 'v0');\n    if (!localStorage.getItem('app_ota_version') && typeof BUILD_VERSION !== 'undefined') localStorage.setItem('app_ota_version', BUILD_VERSION);";

code = code.replace(oldCheckStr, newCheckStr);

fs.writeFileSync('app.js', code);
