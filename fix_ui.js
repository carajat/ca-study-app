const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Add openConfirmModal function
const confirmModalStr = `
window.openConfirmModal = function(title, body, confirmText, onConfirm) {
  openModal('', \`
    <div class="confirm-icon-wrap">
      <span class="material-symbols-rounded">warning</span>
    </div>
    <div class="confirm-title">\${title}</div>
    <div class="confirm-body">\${body}</div>
    <div class="confirm-row">
      <button class="confirm-btn cb-cancel" onclick="closeModal()">Cancel</button>
      <button class="confirm-btn cb-confirm" id="confirm-action-btn">\${confirmText}</button>
    </div>
  \`);
  setTimeout(() => {
    document.getElementById('confirm-action-btn').onclick = () => {
      closeModal();
      if(onConfirm) onConfirm();
    };
  }, 100);
};
`;
if (!code.includes('openConfirmModal')) {
  code += confirmModalStr;
}

// 2. Update toggleEditMode
const oldEditModeStr = `window.isEditMode = !window.isEditMode;
  renderHome();`;
const newEditModeStr = `window.isEditMode = !window.isEditMode;
  if(window.isEditMode) {
    document.body.classList.add('edit-mode-active');
  } else {
    document.body.classList.remove('edit-mode-active');
  }
  renderHome();`;
code = code.replace(oldEditModeStr, newEditModeStr);

// 3. Update restoreDailyBackup to use openConfirmModal
const oldRestoreConfirm = `if (confirm("Are you sure you want to overwrite current data with the backup from " + dateStr + "? This will replace both cloud and local data.")) {
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
  }`;

const newRestoreConfirm = `window.openConfirmModal(
    "Restore Backup",
    "Are you sure you want to overwrite current data with the backup from " + dateStr + "? This will replace both cloud and local data.",
    "Restore",
    () => {
      try {
        const data = JSON.parse(backupStr);
        if (data.trackerData) localStorage.setItem(getStorageKey(), JSON.stringify(data.trackerData));
        if (data.dynamicData) {
          DYNAMIC_DATA = data.dynamicData;
          saveDynamicData();
        }
        showToast("Backup restored! Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (e) {
        showToast("Failed to restore backup.", true);
      }
    }
  );`;
code = code.replace(oldRestoreConfirm, newRestoreConfirm);

// 4. Update importData to use openConfirmModal
const oldImportConfirm = `if (confirm("Are you sure you want to overwrite current data with this backup?")) {
          localStorage.setItem(getStorageKey(), e.target.result);
          alert("Data imported successfully! Reloading app...");
          window.location.reload();
        }`;
const newImportConfirm = `window.openConfirmModal(
          "Import JSON",
          "Are you sure you want to overwrite current data with this backup?",
          "Import",
          () => {
            localStorage.setItem(getStorageKey(), e.target.result);
            showToast("Data imported! Reloading...");
            setTimeout(() => window.location.reload(), 1500);
          }
        );`;
code = code.replace(oldImportConfirm, newImportConfirm);

// Note: Another place for importData
code = code.replace(/if\s*\(confirm\("Are you sure you want to overwrite current data with this backup\?"\)\)\s*{\s*localStorage\.setItem\(getStorageKey\(\),\s*JSON\.stringify\(data\.trackerData\)\);\s*if\s*\(data\.dynamicData\)\s*{\s*DYNAMIC_DATA\s*=\s*data\.dynamicData;\s*saveDynamicData\(\);\s*}\s*alert\("Data imported successfully! Reloading app..."\);\s*window\.location\.reload\(\);\s*}/g, 
`window.openConfirmModal(
          "Import JSON",
          "Are you sure you want to overwrite current data with this backup?",
          "Import",
          () => {
            localStorage.setItem(getStorageKey(), JSON.stringify(data.trackerData));
            if (data.dynamicData) {
              DYNAMIC_DATA = data.dynamicData;
              saveDynamicData();
            }
            showToast("Data imported! Reloading...");
            setTimeout(() => window.location.reload(), 1500);
          }
        );`
);

fs.writeFileSync('app.js', code);
