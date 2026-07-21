const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

const reloadCode = `
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
`;

if (!app.includes('controllerchange')) {
    app = app.replace("navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));", "navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));" + reloadCode);
    fs.writeFileSync('app.js', app);
}

// Bump SW version
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/ca-tracker-v36/g, 'ca-tracker-v37');
fs.writeFileSync('sw.js', sw);

console.log("SW update logic fixed.");
