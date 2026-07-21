const fs = require('fs');
let dataJs = fs.readFileSync('data.js', 'utf8');

// The `syllabusSubjects` needs to be added just before `APP_DATA_GROUP1` starts, or at the end of `APP_DATA_GROUP2`.
// Wait, APP_DATA_GROUP2 has `dtChapters`, `idtChapters`, `ibsSubjects`. 
// I can just append `syllabusSubjects` to APP_DATA_GROUP2 before `const APP_DATA_GROUP1` is defined.

const patchStr = `
  , syllabusSubjects: [
    { id: "dt", name: "Paper 4: Direct Tax", type: "subject", chapters: [
      { id: "dt1", name: "PGBP (Profits & Gains from Business & Profession)" },
      { id: "dt2", name: "Taxation of Various Entities" },
      { id: "dt3", name: "Profit Linked Deductions" },
      { id: "dt4", name: "MAT (Minimum Alternate Tax) + IND AS" },
      { id: "dt5", name: "AMT (Alternate Minimum Tax)" },
      { id: "dt6", name: "Return Filing & Assessment Procedure" },
      { id: "dt7", name: "Rectification, Appeals & Revision" },
      { id: "dt8", name: "Appeals, Revision & Collection & Recovery" },
      { id: "dt9", name: "Compilation of Time Limits" },
      { id: "dt10", name: "Assessment of Trusts" },
      { id: "dt11", name: "Taxation of HUF, Firms, LLP" },
      { id: "dt12", name: "Transfer Pricing (Section 92)" },
      { id: "dt13", name: "Non-Resident Taxation (DTAA, Equalisation Levy)" },
      { id: "dt14", name: "Black Money Act" }
    ]},
    { id: "idt", name: "Paper 5: Indirect Tax", type: "subject", chapters: [
      { id: "idt1", name: "Supply under GST" },
      { id: "idt2", name: "Charge of GST (RCM, E-Commerce)" },
      { id: "idt3", name: "Exemptions from GST" },
      { id: "idt4", name: "Time of Supply" },
      { id: "idt5", name: "Value of Supply" },
      { id: "idt6", name: "Input Tax Credit (ITC)" },
      { id: "idt7", name: "Registration" },
      { id: "idt8", name: "Tax Invoice, Credit/Debit Notes, E-Way Bill" },
      { id: "idt9", name: "Accounts & Records" },
      { id: "idt10", name: "Payment of Tax" },
      { id: "idt11", name: "Returns" },
      { id: "idt12", name: "Refunds" },
      { id: "idt13", name: "Assessment & Audit" },
      { id: "idt14", name: "Inspection, Search, Seizure & Arrest" },
      { id: "idt15", name: "Demands & Recovery" },
      { id: "idt16", name: "Liability to Pay in Certain Cases" },
      { id: "idt17", name: "Advance Ruling" },
      { id: "idt18", name: "Appeals & Revision" },
      { id: "idt19", name: "Offences & Penalties" }
    ]},
    { id: "ibs", name: "Paper 6: IBS (Case Study)", type: "subject", chapters: [
      { id: "ibs1", name: "Mock Test Practice" },
      { id: "ibs2", name: "Case Study Analysis" }
    ]}
  ]
};

const APP_DATA_GROUP1`;

dataJs = dataJs.replace('};\n\nconst APP_DATA_GROUP1', patchStr);

fs.writeFileSync('data.js', dataJs);
console.log('Patched data.js');
