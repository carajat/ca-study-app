const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Fix the syntax error from the previous bad replace
code = code.replace(/return <option value=" \+ '' \+ "> \+ '' \+ <\/option>;/g, 'return \<option value="\">\</option>\;');

fs.writeFileSync('app.js', code);
