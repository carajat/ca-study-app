const fs = require('fs');
const css = `
/* ═══════════ JOURNAL MODERN UI ═══════════ */
.journal-tabs {
  display: flex; gap: 8px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 100px;
}
.j-tab-btn {
  background: transparent; color: var(--text-muted); border: none; padding: 6px 16px; border-radius: 100px; font-weight: 600; font-size: 14px;
}
.j-tab-btn.active {
  background: var(--bg-card); color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.journal-date-bar {
  display: flex; align-items: center; justify-content: center; gap: 16px; padding: 12px; background: var(--bg-card); border-radius: var(--border-radius-md); border: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.task-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.task-row {
  display: flex; gap: 8px; align-items: center;
}
.elegant-input, .elegant-select {
  background: rgba(255,255,255,0.05);
  border: 1px solid transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 15px;
  padding: 10px 12px;
  border-radius: 8px;
  width: 100%;
  transition: all 0.2s ease;
}
.elegant-input:focus, .elegant-select:focus {
  border-color: var(--primary); background: rgba(255,255,255,0.1); outline: none;
}
.elegant-select option { background: var(--bg-primary); }

.history-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hc-date { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.hc-stats { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
`;
fs.appendFileSync('C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/style.css', css);
