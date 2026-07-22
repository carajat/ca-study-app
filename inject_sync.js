const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The previous patch failed because it searched for "app.js" exactly, but it had a version string like "?v=117"
if (!html.includes('sync.js')) {
  // Find the exact app.js script tag
  const match = html.match(/<script src="app\.js\?v=\d+"><\/script>/);
  if (match) {
    html = html.replace(match[0], '<script src="sync.js?v=123"></script>\n  ' + match[0]);
    fs.writeFileSync('index.html', html);
    console.log("Injected sync.js into index.html successfully.");
  } else {
    console.log("Could not find app.js script tag.");
  }
} else {
  console.log("sync.js already in index.html");
}
