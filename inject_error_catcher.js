const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const errorCatcher = `
<script>
  window.onerror = function(message, source, lineno, colno, error) {
    alert("CRASH: " + message + "\\nLine: " + lineno);
    return false;
  };
  window.addEventListener('unhandledrejection', function(event) {
    alert("ASYNC CRASH: " + event.reason);
  });
</script>
`;

if (!html.includes('window.onerror')) {
  html = html.replace('<head>', '<head>\n' + errorCatcher);
  fs.writeFileSync('index.html', html);
  console.log("Injected error catcher into index.html");
}
