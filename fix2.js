const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// The line is:
// '<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">' +
// '<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(' + idx + ', -1, ' + (isNested ? parentIdx : 'null') + ')" ' + (idx === 0 ? 'disabled' : '') + '><span class="material-symbols-rounded">keyboard_arrow_up</span></button>' +

// We will use a regex to match it ignoring whitespace / crlf:
const regex = /('<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">'\s*\+\s*'<button class="move-btn" onclick="event.stopPropagation\(\); moveSyllabusSubject\(' \+ idx \+ ', -1, ' \+ \(isNested \? parentIdx : 'null'\) \+ '\)" ' \+ \(idx === 0 \? 'disabled' : ''\) \+ '><span class="material-symbols-rounded">keyboard_arrow_up<\/span><\/button>' \+)/;

if (regex.test(app)) {
  app = app.replace(regex, 
    '\'<div class="edit-mode-controls" style="display:flex; gap:4px; align-items:center;">\' +\n' +
    '      \'<button class="move-btn" onclick="event.stopPropagation(); openSubjectDetail(\\\'\' + subj.id + \'\\\', \\\'\' + subj.type + \'\\\')" title="Open Subject"><span class="material-symbols-rounded">arrow_forward</span></button>\' +\n' +
    '      \'<button class="move-btn" onclick="event.stopPropagation(); moveSyllabusSubject(\' + idx + \', -1, \' + (isNested ? parentIdx : \'null\') + \')" \' + (idx === 0 ? \'disabled\' : \'\') + \'><span class="material-symbols-rounded">keyboard_arrow_up</span></button>\' +'
  );
  fs.writeFileSync('app.js', app);
  console.log("REPLACED!");
} else {
  console.log("NOT FOUND! Regex didn't match.");
}

let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/v=\d+/g, 'v=84');
sw = sw.replace(/v\d+/g, 'v84');
fs.writeFileSync('sw.js', sw);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v=\d+/g, 'v=84');
fs.writeFileSync('index.html', html);
