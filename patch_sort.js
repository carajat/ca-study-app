const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

const newNormalizeFn = `
function normalizeForHash(data) {
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
`;

app = app.replace(/function normalizeForHash\(data\) \{[\s\S]*?return data;\r?\n\}/, newNormalizeFn.trim());

fs.writeFileSync('app.js', app);

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/v=\d+/g, 'v=169');
fs.writeFileSync('index.html', index);

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v\d+/g, 'v169');
fs.writeFileSync('sw.js', sw);
