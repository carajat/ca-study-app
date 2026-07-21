const fs = require('fs');
const css = `

/* ═══════════ DAILY JOURNAL STYLES ═══════════ */
.fullscreen-modal {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: var(--bg-color);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.journal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}
.journal-header h2 { margin: 0; font-size: 20px; }
.journal-date-picker {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  outline: none;
}
.journal-date-picker::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
@media (prefers-color-scheme: light) {
  .journal-date-picker::-webkit-calendar-picker-indicator {
    filter: none;
  }
}

.journal-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.journal-top-stats, .journal-footer-stats {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background: var(--card-bg);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.j-stat {
  display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 80px;
}
.j-stat label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.j-stat input {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-main);
  padding: 6px;
  font-size: 16px;
  width: 100%;
  font-family: inherit;
}
.j-val {
  font-size: 18px; font-weight: 700; color: var(--accent-color);
  padding: 6px 0;
}

.journal-table-wrapper {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  padding: 16px;
  overflow-x: auto;
}

.journal-table {
  width: 100%; border-collapse: collapse; min-width: 600px;
}
.journal-table th {
  text-align: left; padding: 12px 8px; font-size: 13px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-transform: uppercase;
}
.journal-table td {
  padding: 8px; border-bottom: 1px solid var(--border-color);
}
.journal-table input, .journal-table select {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  width: 100%;
  padding: 6px;
  border-radius: 4px;
}
.journal-table input:focus, .journal-table select:focus {
  border-color: var(--accent-color); outline: none; background: rgba(0,0,0,0.2);
}
.journal-table select option { background: var(--bg-color); color: var(--text-main); }
`;
fs.appendFileSync('C:/Users/USER/.gemini/antigravity/scratch/ca-study-app/style.css', css);
