const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(
  "document.getElementById('modal-overlay').style.display = 'flex';\r\n  document.getElementById('modal-overlay').classList.add('show');",
  "document.getElementById('modal-overlay').classList.add('show');"
);
appJs = appJs.replace(
  "document.getElementById('modal-overlay').style.display = 'flex';\n  document.getElementById('modal-overlay').classList.add('show');",
  "document.getElementById('modal-overlay').classList.add('show');"
);

appJs = appJs.replace(
  "function closeModal() {\r\n  document.getElementById('modal-overlay').classList.remove('show');\r\n}",
  "function closeModal() {\r\n  const overlay = document.getElementById('modal-overlay');\r\n  overlay.classList.remove('show');\r\n  overlay.style.display = '';\r\n}"
);
appJs = appJs.replace(
  "function closeModal() {\n  document.getElementById('modal-overlay').classList.remove('show');\n}",
  "function closeModal() {\n  const overlay = document.getElementById('modal-overlay');\n  overlay.classList.remove('show');\n  overlay.style.display = '';\n}"
);

fs.writeFileSync('app.js', appJs);
console.log("Modal fixed");
