const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
  "const today = new Date().toISOString().split('T')[0];",
  "const today = getTodayStr();"
);

const newBackupStr = `localStorage.setItem('ca_app_daily_backup_' + today, JSON.stringify(dataToBackup));
      localStorage.setItem('ca_last_backup_date', today);
      
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(k => k.startsWith('ca_app_daily_backup_')).sort();
      if (backupKeys.length > 7) {
        const keysToDelete = backupKeys.slice(0, backupKeys.length - 7);
        keysToDelete.forEach(k => localStorage.removeItem(k));
      }
      
      console.log("Daily local backup created successfully for " + today);`;

code = code.replace(/localStorage\.setItem\('ca_app_daily_backup',\s*JSON\.stringify\(dataToBackup\)\);\s*localStorage\.setItem\('ca_last_backup_date',\s*today\);\s*console\.log\("Daily local backup created successfully for "\s*\+\s*today\);/, newBackupStr);

fs.writeFileSync('app.js', code);
