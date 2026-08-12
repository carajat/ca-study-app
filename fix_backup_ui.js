const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const newModalStr = `window.openBackupModal = function() {
  closeModal(); // Close the main menu first
  
  const allKeys = Object.keys(localStorage);
  const backupKeys = allKeys.filter(k => k.startsWith('ca_app_daily_backup_')).sort().reverse();
  
  let backupOptions = backupKeys.map(k => {
    const dateStr = k.replace('ca_app_daily_backup_', '');
    return \`<option value="\${dateStr}">\${dateStr}</option>\`;
  }).join('');
  
  if (backupOptions === '') {
    backupOptions = '<option value="">No backups available</option>';
  }

  openModal('<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">folder_managed</span> Data & Backups', \`
    <div style="display:flex; flex-direction:column; gap:12px;">
      <p style="font-size:13px; color:var(--text-secondary); text-align:center; margin-bottom:8px;">Manage your local backups and export/import data.</p>
      
      <div style="display:flex; gap:8px;">
        <select id="backup-date-select" style="flex:1; padding:8px; border-radius:8px; background:rgba(255,255,255,0.05); color:var(--text-primary); border:1px solid rgba(255,255,255,0.1);">
          \${backupOptions}
        </select>
        <button class="menu-btn" style="background: rgba(10,132,255,0.15); border-color: var(--primary); color: var(--primary); margin:0; width:auto; padding:8px 12px; border-radius:8px;" onclick="restoreDailyBackup()">
          Restore
        </button>
      </div>
      
      <button class="menu-btn" style="background: rgba(48,209,88,0.15); border-color: var(--success-color); color: var(--success-color);" onclick="exportData()">
        <span class="material-symbols-rounded menu-btn-icon" style="color: var(--success-color);">upload</span> Export JSON (Save to Device)
      </button>
      
      <button class="menu-btn" style="background: rgba(255,159,10,0.15); border-color: #ff9f0a; color: #ff9f0a;" onclick="triggerImport()">
        <span class="material-symbols-rounded menu-btn-icon" style="color: #ff9f0a;">download</span> Import JSON (Load from Device)
      </button>
      
      <button class="btn-primary" style="margin-top:16px;" onclick="openMenuModal()">Back to Menu</button>
    </div>
  \`);
};`;

const newRestoreStr = `window.restoreDailyBackup = function() {
  const select = document.getElementById('backup-date-select');
  if (!select || !select.value) return alert("No backup selected!");
  const dateStr = select.value;
  const backupStr = localStorage.getItem('ca_app_daily_backup_' + dateStr);
  if (!backupStr) return alert("Backup data not found!");
  if (confirm("Are you sure you want to overwrite current data with the backup from " + dateStr + "? This will replace both cloud and local data.")) {
    try {
      const data = JSON.parse(backupStr);
      if (data.trackerData) localStorage.setItem(getStorageKey(), JSON.stringify(data.trackerData));
      if (data.dynamicData) {
        DYNAMIC_DATA = data.dynamicData;
        saveDynamicData();
      }
      alert("Backup restored successfully! Reloading app...");
      window.location.reload();
    } catch (e) {
      alert("Failed to restore backup.");
    }
  }
};`;

code = code.replace(/window\.openBackupModal = function\(\) \{[\s\S]*?\n\};\n/m, newModalStr + '\n\n');
code = code.replace(/window\.restoreDailyBackup = function\(\) \{[\s\S]*?\n\};\n/m, newRestoreStr + '\n\n');

fs.writeFileSync('app.js', code);
