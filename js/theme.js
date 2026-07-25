// ========================================
// theme.js — Themes, Menu & Data I/O
// ========================================

import { state, DYNAMIC_DATA, isEditMode, getStorageKey, loadState } from './state.js';
import { getMockScores } from './state.js';
import { openModal, closeModal } from './modals.js';
import { showToast } from './utils.js';

export function openMenuModal() {
  openModal('<span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">settings</span> Settings & Tools' + (window.isReadOnlyMode ? ' <span style="color:var(--error-color); font-size:12px; margin-left:10px;">(Read-Only)</span>' : ''), `
    
    
    ${(window.isCloudLoggedIn) 
      ? `<button class="menu-btn" onclick="closeModal(); if(typeof logoutFromCloud === 'function') logoutFromCloud();">
          <span class="material-symbols-rounded menu-btn-icon">logout</span> Logout
         </button>` 
      : `<button class="menu-btn" onclick="closeModal(); document.getElementById('welcome-overlay').style.display='flex';">
          <span class="material-symbols-rounded menu-btn-icon">login</span> Login
         </button>`
    }
    
    <button id="editModeBtn" class="menu-btn" onclick="toggleEditMode(); closeModal()">
      <span class="menu-btn-icon">${isEditMode ? '<span class="material-symbols-rounded icon-sm">check_circle</span>' : '<span class="material-symbols-rounded icon-sm">edit</span>'}</span> Edit Mode: <strong style="color: ${isEditMode ? 'var(--color-primary)' : 'inherit'}">${isEditMode ? 'ON' : 'OFF'}</strong>
    </button>
    <button class="menu-btn" onclick="openThemeModal()">
      <span class="material-symbols-rounded menu-btn-icon">palette</span> Customize Theme
    </button>
    <button class="menu-btn" onclick="shareProgressPDF()">
      <span class="material-symbols-rounded menu-btn-icon">picture_as_pdf</span> Share Progress (PDF)
    </button>
    <button class="menu-btn" onclick="exportData()">
      <span class="menu-btn-icon"><span class="material-symbols-rounded icon-sm">upload</span></span> Share Backup (Export)
    </button>
    <button class="menu-btn" onclick="triggerImport()">
      <span class="menu-btn-icon"><span class="material-symbols-rounded icon-sm">download</span></span> Load Backup (Import)
    </button>
  `);
}

export function openThemeModal() {
  const currentTheme = localStorage.getItem('ca-theme') || 'default';
  const mode = document.body.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const modeIcon = mode === 'light' ? 'dark_mode' : 'light_mode';
  const modeText = mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  
  openModal('Select Theme', `
    <button class="menu-btn" style="margin-bottom: 20px; text-align: center; justify-content: center; background: rgba(10,132,255,0.1); color: var(--primary);" onclick="toggleTheme(); openThemeModal();">
      <span class="material-symbols-rounded menu-btn-icon" style="margin-right: 8px;">${modeIcon}</span> ${modeText}
    </button>
    <p style="text-align:center; color:var(--text-secondary); margin-bottom: 20px;">Personalize your app colors</p>
    <div class="theme-picker">
      <div class="theme-circle tc-default ${currentTheme === 'default' ? 'active' : ''}" onclick="setTheme('default', this)"></div>
      <div class="theme-circle tc-ocean ${currentTheme === 'ocean' ? 'active' : ''}" onclick="setTheme('ocean', this)"></div>
      <div class="theme-circle tc-forest ${currentTheme === 'forest' ? 'active' : ''}" onclick="setTheme('forest', this)"></div>
      <div class="theme-circle tc-sunset ${currentTheme === 'sunset' ? 'active' : ''}" onclick="setTheme('sunset', this)"></div>
      <div class="theme-circle tc-rose ${currentTheme === 'rose' ? 'active' : ''}" onclick="setTheme('rose', this)"></div>
    </div>
    <button class="btn-primary" style="margin-top:20px" onclick="openMenuModal()">Back to Menu</button>
  `);
}

export function setTheme(themeName, element) {
  // Remove all theme classes
  document.body.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset', 'theme-rose');
  
  if (themeName !== 'default') {
    document.body.classList.add('theme-' + themeName);
  }
  localStorage.setItem('ca-theme', themeName);
  
  // Update UI
  if (element) {
    document.querySelectorAll('.theme-circle').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
  }
  
  // Re-render chart if on Exams tab to update chart color
  if (state.activeTab === 'exams') {
    if (typeof window.renderScoreChart === 'function') window.renderScoreChart();
  }
}

export function initTheme() {
  const savedTheme = localStorage.getItem('ca-theme') || 'default';
  setTheme(savedTheme);
}

export function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}
export function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if(btn) btn.innerHTML = theme === 'light' ? '<span class="material-symbols-rounded">dark_mode</span>' : '<span class="material-symbols-rounded">light_mode</span>';
}

// Theme initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        updateThemeIcon(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    }
});

// ─── Data Export / Import ───
export async function exportData() {
  try {
    const data = localStorage.getItem(getStorageKey()) || '{}';
    const exportPayload = { trackerData: JSON.parse(data), dynamicData: DYNAMIC_DATA };
    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ca-progress-${state.activeGroup}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    showToast('Backup downloaded! <span class="material-symbols-rounded icon-sm">download</span>');
  } catch (err) {
    console.error("Export error:", err);
    showToast('Export failed!');
  }
}

export function triggerImport() {
  document.getElementById('import-file').click();
}

export function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data && typeof data === 'object') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        showToast('Data restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      alert('Invalid backup file! Make sure you selected the correct .json file.');
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // reset input
}

// ─── PDF Generation ───
export function shareProgressPDF() {
  const overallPct = (typeof window.calculateOverallProgress === 'function') ? window.calculateOverallProgress() : 0;
  const dtPct = (typeof window.calculateSubjectProgress === 'function') ? window.calculateSubjectProgress('dt', 'main') : 0;
  const idtPct = (typeof window.calculateSubjectProgress === 'function') ? window.calculateSubjectProgress('idt', 'main') : 0;
  
  const scores = getMockScores();
  let mocksHtml = '';
  Object.keys(scores).forEach(k => {
    mocksHtml += `<div class="print-row"><span>Mock ${k}</span> <strong>${scores[k].score}/100</strong></div>`;
  });
  if (!mocksHtml) mocksHtml = '<p style="color:#666">No mock scores recorded yet.</p>';
  
  const html = `
    <div class="print-title">CA Final Group 2 Progress Report</div>
    
    <div class="print-card">
      <h3 style="margin-bottom:10px">Overall Syllabus Completion</h3>
      <div style="font-size:32px; font-weight:900; text-align:center">${overallPct}%</div>
      <div class="print-bar"><div class="print-bar-fill" style="width:${overallPct}%"></div></div>
    </div>
    
    <div class="print-card">
      <h3 style="margin-bottom:10px">Subject Details</h3>
      <div class="print-row"><span>Paper 4: Direct Tax</span> <strong>${dtPct}%</strong></div>
      <div class="print-bar" style="margin-bottom:15px"><div class="print-bar-fill" style="width:${dtPct}%"></div></div>
      
      <div class="print-row"><span>Paper 5: Indirect Tax</span> <strong>${idtPct}%</strong></div>
      <div class="print-bar"><div class="print-bar-fill" style="width:${idtPct}%"></div></div>
    </div>
    
    <div class="print-card">
      <h3 style="margin-bottom:10px">Mock Test Scores</h3>
      ${mocksHtml}
    </div>
    
    <p style="text-align:center; color:#666; margin-top:30px; font-size:12px;">Generated via CA Final Study Companion PWA</p>
  `;
  
  document.getElementById('print-section').innerHTML = html;
  closeModal();
  setTimeout(() => window.print(), 500);
}

// ─── Window Attachments ─────────────────
window.openMenuModal = openMenuModal;
window.openThemeModal = openThemeModal;
window.setTheme = setTheme;
window.initTheme = initTheme;
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.exportData = exportData;
window.triggerImport = triggerImport;
window.handleImportFile = handleImportFile;
window.shareProgressPDF = shareProgressPDF;
