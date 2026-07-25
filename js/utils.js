// ========================================
// utils.js — Pure Utility Functions
// ========================================

export function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerHTML = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatDateFull(date) {
  const d = new Date(date);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  const now = new Date();
  now.setHours(0,0,0,0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export function getTodayStr() {
  const dateObj = new Date();
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

export function normalizeForHash(data) {
  if (Array.isArray(data)) {
    const arr = data.map(normalizeForHash).filter(v => v !== undefined && v !== null);
    return arr.length > 0 ? arr : undefined;
  } else if (typeof data === 'object' && data !== null) {
    const newObj = {};
    let hasKeys = false;
    const keys = Object.keys(data).sort();
    for (let k of keys) {
      const val = normalizeForHash(data[k]);
      if (val !== undefined && val !== null) {
        newObj[k] = val;
        hasKeys = true;
      }
    }
    return hasKeys ? newObj : undefined;
  }
  return data;
}

// ─── Window Attachments ─────────────────
window.showToast = showToast;
