const fs = require('fs');

// We need a lightweight way to test the logic in app.js
// Let's create a test harness
let dataJs = fs.readFileSync('data.js', 'utf8');
let appJs = fs.readFileSync('app.js', 'utf8');

// We evaluate data.js and app.js in a context
const vm = require('vm');
const context = {
  window: {},
  document: {
    getElementById: () => ({ value: '', addEventListener: () => {}, innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} }),
    createElement: () => ({ style: {}, classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} })
  },
  localStorage: {
    store: {},
    getItem: function(k) { return this.store[k]; },
    setItem: function(k, v) { this.store[k] = v; },
    removeItem: function(k) { delete this.store[k]; }
  },
  console: console,
  setTimeout: setTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  alert: console.log,
  confirm: () => true,
  prompt: () => 'Test',
  Date: Date,
  Math: Math,
  JSON: JSON,
  String: String,
  Array: Array,
  Set: Set,
  Object: Object
};

vm.createContext(context);

// Load data.js
try {
  vm.runInContext(dataJs, context);
} catch (e) {
  console.log("Error loading data.js", e.message);
}

// Simulate a corrupted DYNAMIC_DATA in localStorage
// Let's say DT has only 5 chapters, IDT is missing, IBS is a mess
const corruptedData = {
  group1Initialized: true,
  syllabusSubjects: [
    {
      id: 'dt',
      name: 'Paper 4: DT & International Tax',
      type: 'main',
      chapters: [
        { id: "dt1", name: "Basic Concepts" },
        { id: "dt2", name: "Incomes which do not form part of Total Income" }
      ] // Only 2 chapters!
    },
    {
      id: 'ibs-folder',
      name: 'Paper 6: IBS (MCS)',
      type: 'folder',
      children: [
        {
          id: 'ibs-afm',
          name: 'IBS - AFM',
          type: 'ibs',
          chapters: [] // Empty chapters!
        },
        // IBS-FR completely missing!
      ]
    }
    // IDT completely missing!
  ],
  journalEntries: {}
};

context.localStorage.setItem('ca_dynamic_data', JSON.stringify(corruptedData));

// Run app.js
try {
  vm.runInContext(appJs, context);
} catch (e) {
  // It might throw due to missing DOM, that's fine, we just need init() to run
}

// Let's manually trigger loadDynamicData and smartRepairSyllabusData if not already run
vm.runInContext(`
  state.activeGroup = 'group2';
  loadDynamicData();
  smartRepairSyllabusData();
`, context);

// Now inspect DYNAMIC_DATA
const finalDynamic = context.DYNAMIC_DATA;
console.log("DT Chapters count:", finalDynamic.syllabusSubjects.find(s => s.id === 'dt').chapters.length);

const folder = finalDynamic.syllabusSubjects.find(s => s.id === 'ibs-folder');
console.log("IBS Folder found:", !!folder);
if (folder) {
  console.log("IBS Folder children count:", folder.children.length);
  folder.children.forEach(c => {
    console.log("  -", c.id, "chapters:", c.chapters.length);
  });
}

const idt = finalDynamic.syllabusSubjects.find(s => s.id === 'idt');
console.log("IDT found:", !!idt);
if (idt) {
  console.log("IDT Chapters count:", idt.chapters.length);
}

