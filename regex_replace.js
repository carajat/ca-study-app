const fs = require('fs');
let text = fs.readFileSync('app.js', 'utf8');

let before = text;

// Fix 1 & 2
text = text.replace(/if \(s\.type === 'folder' && s\.children\) subjects = subjects\.concat\(s\.children\);\s*else subjects\.push\(s\);/g, 'subjects.push(s);\n    if (s.type === \'folder\' && s.children) subjects = subjects.concat(s.children);');

// Fix 3
text = text.replace(/if \(sData && sData\.chapters\) \{\s*sData\.chapters\.forEach\(function\(ch\)/g, 'if (sData) {\n      let arr = sData.chapters || sData.children || [];\n      arr.forEach(function(ch)');

// Fix 4
text = text.replace(/if \(s\.type === 'folder' && s\.children\) subjectsArray = subjectsArray\.concat\(s\.children\);\s*else subjectsArray\.push\(s\);/g, 'subjectsArray.push(s);\n    if (s.type === \'folder\' && s.children) subjectsArray = subjectsArray.concat(s.children);');

// Fix 5
text = text.replace(/if \(s\.type === 'folder' && s\.children\) flat = flat\.concat\(s\.children\);\s*else flat\.push\(s\);/g, 'flat.push(s);\n       if (s.type === \'folder\' && s.children) flat = flat.concat(s.children);');

if (text !== before) {
    fs.writeFileSync('app.js', text);
    console.log("Replacements successful.");
    
    // Bump version
    let sw = fs.readFileSync('sw.js', 'utf8');
    sw = sw.replace(/v161/g, 'v162');
    fs.writeFileSync('sw.js', sw);

    let index = fs.readFileSync('index.html', 'utf8');
    index = index.replace(/v=161/g, 'v=162');
    fs.writeFileSync('index.html', index);
} else {
    console.log("No replacements were made.");
}
