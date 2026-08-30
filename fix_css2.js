const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');
const search = `.hide-scrollbar::-webkit-scrollbar {
    display: none;
  }`;
const replace = `.hide-scrollbar::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }`;
if (css.includes(search)) {
    css = css.replace(search, replace);
    fs.writeFileSync('style.css', css);
    console.log('Successfully updated style.css');
} else {
    console.log('Could not find search string.');
}
