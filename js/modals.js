// ========================================
// modals.js — Modal System
// ========================================

export function openModal(title, bodyHtml) {
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-overlay').classList.add('show');
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('show');
  overlay.style.display = '';
}

window.activeFormCallback = null;
export function openFormModal(title, fields, callback) {
  window.activeFormCallback = callback;
  let html = '<div class="form-modal-body">';
  
  fields.forEach((f, idx) => {
    html += `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type || 'text'}" id="fm-input-${idx}" value="${f.value || ''}" placeholder="${f.placeholder || ''}" class="form-input">
      </div>
    `;
  });
  
  html += `
    <div style="display: flex; gap: 8px; margin-top: 15px;">
      <button class="btn-primary" onclick="submitFormModal(${fields.length})"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">save</span> Save</button>
      <button class="btn-secondary" onclick="closeModal()"><span class="material-symbols-rounded icon-sm" style="vertical-align:middle;">close</span> Cancel</button>
    </div>
  </div>`;
  
  openModal(title, html);
}

export function submitFormModal(numFields) {
  if (window.activeFormCallback) {
    const values = [];
    for (let i = 0; i < numFields; i++) {
      values.push(document.getElementById(`fm-input-${i}`).value);
    }
    window.activeFormCallback(...values);
    closeModal();
  }
}

// ─── Window Attachments ─────────────────
window.openModal = openModal;
window.closeModal = closeModal;
window.openFormModal = openFormModal;
window.submitFormModal = submitFormModal;
