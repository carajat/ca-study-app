const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Remove the old simple checkbox rule if present
css = css.replace(/input\[type="checkbox"\] \{ border-radius: 6px; \}\n?/g, '');

// The custom checkbox style
const customCheckbox = `
/* Custom Premium Checkbox */
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  margin: 0;
  font: inherit;
  color: currentColor;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--border-color);
  border-radius: 6px;
  display: inline-grid;
  place-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

input[type="checkbox"]::before {
  content: "";
  width: 10px;
  height: 10px;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em white;
  transform-origin: center;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}

input[type="checkbox"]:checked {
  background-color: var(--purple);
  border-color: var(--purple);
}

input[type="checkbox"]:checked::before {
  transform: scale(1);
}
`;

css += customCheckbox;
fs.writeFileSync('style.css', css);

// Remove the conflicting .st-check input[type="checkbox"] rule properties like accent-color
css = css.replace(/\.st-check input\[type="checkbox"\] \{[^}]*\}/g, '.st-check input[type="checkbox"] { margin-top: 4px; }');
fs.writeFileSync('style.css', css);

console.log("Checkbox fixed");
