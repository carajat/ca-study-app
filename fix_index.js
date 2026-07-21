const fs = require('fs');

// Read the corrupted index.html
let html = fs.readFileSync('index.html', 'utf8');

// Find the second '<!DOCTYPE html>'
const secondDocIndex = html.indexOf('<!DOCTYPE html>', 10);
if (secondDocIndex !== -1) {
  html = html.substring(secondDocIndex);
}

// Ensure the header has the relative positioning for overlay
// Wait, the second HTML part MIGHT ALREADY have the <h1 id="group-title"> and the <select> overlay!
// Because my bad replace_file_content replaced the old <select> with the entire top of the document PLUS the new overlay.
// If I just take the substring from the second `<!DOCTYPE html>`, I will have a perfectly valid HTML with the new overlay!

fs.writeFileSync('index.html', html);
console.log('Fixed index.html structure');
