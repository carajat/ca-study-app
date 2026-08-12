const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const newMenuModalStr = `window.openMenuModal = function() {
  const uName = typeof window.getDisplayUsername === 'function' ? window.getDisplayUsername(window.loggedUserEmail) : (window.loggedUserEmail ? window.loggedUserEmail.split('@')[0].toUpperCase() : 'USER');
  
  openModal('<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">settings</span> Settings & Tools' + (window.isReadOnlyMode ? ' <span style="color:var(--error-color); font-size:12px; margin-left:10px;">(Read-Only)</span>' : ''), \`
    \${(window.isCloudLoggedIn) 
      ? \`<div style="padding: 12px; margin-bottom: 12px; background: rgba(10,132,255,0.1); border: 1px solid rgba(10,132,255,0.3); border-radius: 12px; display:flex; align-items:center; justify-content:space-between;">
           <div>
             <div style="font-size:11px; color:var(--primary); font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">Cloud Sync Active</div>
             <div style="font-size:13px; color:var(--text-primary);">Logged in as <b>\${uName}</b></div>
             <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;" id="cloud-last-sync-status">Checking sync status...</div>
           </div>
           <span class="material-symbols-rounded" style="color:var(--primary); font-size:28px;">cloud_done</span>
         </div>\` 
      : \`<div style="padding: 12px; margin-bottom: 12px; background: rgba(255,159,10,0.1); border: 1px solid rgba(255,159,10,0.3); border-radius: 12px; display:flex; align-items:center; justify-content:space-between;">
           <div>
             <div style="font-size:11px; color:#ff9f0a; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">Local Mode</div>
             <div style="font-size:12px; color:var(--text-secondary);">Data is saved only on this device.</div>
           </div>
           <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; width: auto; margin:0;" onclick="window.location.reload()">Login</button>
         </div>\`}

    <div class="menu-section-tag">Account</div>
    \${window.isCloudLoggedIn ? \`<button class="menu-btn btn-neutral" onclick="window.confirmLogout()">
      <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout
    </button>\` : ''}

    <div class="menu-section-tag">Appearance</div>
    <button class="menu-btn btn-neutral" onclick="openThemeModal()">
      <span class="material-symbols-rounded menu-btn-icon" style="color: var(--purple);">palette</span> Change Theme Color
    </button>
    \${window.isCloudLoggedIn ? \`
    <button class="menu-btn btn-neutral" onclick="toggleEditMode()">
      <span class="material-symbols-rounded menu-btn-icon">\${window.isEditMode ? 'edit_off' : 'edit'}</span> \${window.isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
    </button>\` : ''}

    <div class="menu-section-tag">Data Safety</div>
    <button class="menu-btn btn-neutral" onclick="openBackupModal()">
      <span class="material-symbols-rounded menu-btn-icon" style="color: #30d158;">folder_managed</span> Manage Data & Backups
    </button>

    <div class="menu-section-tag">Sharing</div>
    <button class="menu-btn btn-neutral" onclick="window.printReport()">
      <span class="material-symbols-rounded menu-btn-icon" style="color: #ff9f0a;">picture_as_pdf</span> Export as PDF Report
    </button>
    <button class="menu-btn btn-neutral" onclick="navigator.clipboard.writeText('https://carajat.github.io/ca-study-app/'); showToast('App Link Copied!');">
      <span class="material-symbols-rounded menu-btn-icon" style="color: var(--primary);">share</span> Share App Link
    </button>

    <div class="menu-section-tag">System</div>
    <button class="menu-btn btn-neutral" id="btn-ota-update" onclick="checkForUpdates()">
      <span class="material-symbols-rounded menu-btn-icon">system_update</span> Check for Updates
    </button>
    
    <div style="text-align:center; font-size:11px; color:var(--text-muted); margin-top:16px;">
      App Version: \${localStorage.getItem('app_ota_version') || 'v1.0 (Local)'}
    </div>
  \`);
  
  if(window.isCloudLoggedIn && typeof window.updateSyncStatusDisplay === 'function') {
     window.updateSyncStatusDisplay();
  }
}`;

const newBackupModalStr = `window.openBackupModal = function() {
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

  openModal(
    '<div class="back-arrow" onclick="openMenuModal()"><span class="material-symbols-rounded">arrow_back</span> Data & Backups</div>', 
    \`
    <div style="display:flex; flex-direction:column; gap:12px;">
      <p style="font-size:13px; color:var(--text-secondary); text-align:center; margin-bottom:8px;">Manage your local backups and export/import data.</p>
      
      <div style="display:flex; gap:8px;">
        <select id="backup-date-select" style="flex:1; padding:8px; border-radius:8px; background:rgba(255,255,255,0.05); color:var(--text-primary); border:1px solid rgba(255,255,255,0.1);">
          \${backupOptions}
        </select>
        <button class="menu-btn btn-warning" style="margin:0; width:auto; padding:8px 12px; border-radius:8px;" onclick="restoreDailyBackup()">
          Restore
        </button>
      </div>
      
      <button class="menu-btn btn-neutral" onclick="exportData()">
        <span class="material-symbols-rounded menu-btn-icon" style="color: var(--success-color);">upload</span> Export JSON (Save to Device)
      </button>
      
      <button class="menu-btn btn-neutral" onclick="triggerImport()">
        <span class="material-symbols-rounded menu-btn-icon" style="color: #ff9f0a;">download</span> Import JSON (Load from Device)
      </button>
    </div>
  \`);
}`;

const newThemeModalStr = `window.openThemeModal = function() {
  closeModal();
  
  const currentHue = localStorage.getItem('ca_theme_hue') || '260';
  
  const themes = [
    { hue: '260', name: 'Deep Purple' },
    { hue: '220', name: 'Ocean Blue' },
    { hue: '330', name: 'Hot Pink' },
    { hue: '160', name: 'Emerald' },
    { hue: '190', name: 'Cyan' },
    { hue: '20',  name: 'Sunset Orange' },
    { hue: '350', name: 'Crimson' },
    { hue: '280', name: 'Amethyst' },
    { hue: '0',   name: 'Monochrome' }
  ];
  
  let html = '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:16px;">';
  themes.forEach(t => {
    const isSelected = t.hue === currentHue;
    html += \`<div style="display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer;" onclick="setAppTheme('\${t.hue}')">
      <div style="width: 48px; height: 48px; border-radius: 50%; background: hsl(\${t.hue}, 70%, 55%); border: \${isSelected ? '3px solid white' : '2px solid transparent'}; box-shadow: \${isSelected ? '0 0 12px hsl(' + t.hue + ', 70%, 55%)' : 'none'}; transition: 0.2s;"></div>
      <div style="font-size:11px; color:\${isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-weight:\${isSelected ? '600' : '400'}; text-align:center;">\${t.name}</div>
    </div>\`;
  });
  html += '</div>';

  openModal('<div class="back-arrow" onclick="openMenuModal()"><span class="material-symbols-rounded">arrow_back</span> App Theme</div>', html);
}`;

// Safe replacement by finding function boundaries
function replaceFunction(code, funcSignature, newFuncCode) {
    const startIdx = code.indexOf(funcSignature);
    if (startIdx === -1) {
        console.error("Function not found: " + funcSignature);
        return code;
    }
    
    // Find matching brace for the function
    let braceCount = 0;
    let endIdx = -1;
    let inString = false;
    let stringChar = '';
    
    for (let i = startIdx; i < code.length; i++) {
        const c = code[i];
        
        if (!inString && (c === '"' || c === "'" || c === '\`')) {
            inString = true;
            stringChar = c;
            continue;
        }
        if (inString && c === stringChar && code[i-1] !== '\\') {
            inString = false;
            continue;
        }
        
        if (!inString) {
            if (c === '{') braceCount++;
            else if (c === '}') {
                braceCount--;
                if (braceCount === 0) {
                    endIdx = i;
                    break;
                }
            }
        }
    }
    
    if (endIdx === -1) {
        console.error("End of function not found for: " + funcSignature);
        return code;
    }
    
    // also check for trailing semicolon
    if (code[endIdx + 1] === ';') endIdx++;
    
    const before = code.substring(0, startIdx);
    const after = code.substring(endIdx + 1);
    
    return before + newFuncCode + after;
}

code = replaceFunction(code, 'function openMenuModal() {', newMenuModalStr);
code = replaceFunction(code, 'window.openBackupModal = function() {', newBackupModalStr); // wait, openBackupModal was window.openBackupModal? Let's check
code = replaceFunction(code, 'function openThemeModal() {', newThemeModalStr);

fs.writeFileSync('app.js', code);
