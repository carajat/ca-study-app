const fs = require('fs');
let data = fs.readFileSync('data.js', 'utf8');

const group1Data = `  mocks: {
    series1: [
      { id: "m1-1-g1", subject: "FR", date: "2026-02-15", series: 1 },
      { id: "m1-2-g1", subject: "AFM", date: "2026-02-18", series: 1 },
      { id: "m1-3-g1", subject: "Audit", date: "2026-02-21", series: 1 }
    ],
    series2: [
      { id: "m2-1-g1", subject: "FR", date: "2026-03-15", series: 2 },
      { id: "m2-2-g1", subject: "AFM", date: "2026-03-18", series: 2 },
      { id: "m2-3-g1", subject: "Audit", date: "2026-03-21", series: 2 }
    ],
    series3: [
      { id: "m3-1-g1", subject: "FR", date: "2026-04-10", series: 3 },
      { id: "m3-2-g1", subject: "AFM", date: "2026-04-13", series: 3 },
      { id: "m3-3-g1", subject: "Audit", date: "2026-04-16", series: 3 }
    ]
  },
  finalExams: [
    { subject: "FR", date: "2026-05-02T14:00:00+05:30" },
    { subject: "AFM", date: "2026-05-04T14:00:00+05:30" },
    { subject: "Audit", date: "2026-05-06T14:00:00+05:30" }
  ],
  syllabusSubjects: [
    { id: "fr", name: "Paper 1: Financial Reporting", type: "subject", chapters: [
      { id: "fr1", name: "Intro to Ind AS" },
      { id: "fr2", name: "Financial Instruments" },
      { id: "fr3", name: "Consolidation" }
    ]},
    { id: "afm", name: "Paper 2: AFM", type: "subject", chapters: [
      { id: "afm1", name: "Forex" },
      { id: "afm2", name: "Derivatives" },
      { id: "afm3", name: "Portfolio Management" }
    ]},
    { id: "audit", name: "Paper 3: Advanced Auditing", type: "subject", chapters: [
      { id: "au1", name: "Professional Ethics" },
      { id: "au2", name: "Audit Planning" },
      { id: "au3", name: "Company Audit" }
    ]}
  ],`;

data = data.replace(/mocks:\s*\[\],\s*finalExams:\s*\[\],\s*syllabusSubjects:\s*\[\],/, group1Data);
fs.writeFileSync('data.js', data);
console.log('data.js updated');
