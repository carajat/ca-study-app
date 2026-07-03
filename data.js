// ========================================
// CA Final Study Companion — Pre-loaded Data
// ========================================

const APP_DATA = {
  // ─── Exam Info ─────────────────────────
  exam: {
    name: "CA Final Group 2 — Paper 4: DT",
    date: "2026-11-09T14:00:00+05:30",
    scheme: "New Scheme"
  },

  // ─── Study Schedules ──────────────────
  schedules: {
    earlyMorning: {
      name: "Early Morning",
      totalStudy: "12 hrs",
      totalBreaks: "4.5 hrs",
      sleep: "6 hrs",
      slots: [
        { id: "em1", label: "Wake Up & Get Ready", startRange: "03:00-04:00", duration: 60, type: "routine", icon: "☀️" },
        { id: "em2", label: "Study Session 1", startRange: "04:00-05:00", duration: 180, type: "study", icon: "book" },
        { id: "em3", label: "Tea Break", startRange: "07:00-08:00", duration: 30, type: "break", icon: "☕" },
        { id: "em4", label: "Study Session 2", startRange: "07:30-08:30", duration: 120, type: "study", icon: "book" },
        { id: "em5", label: "Tea Break", startRange: "09:30-10:30", duration: 30, type: "break", icon: "☕" },
        { id: "em6", label: "Study Session 3", startRange: "10:00-11:00", duration: 120, type: "study", icon: "book" },
        { id: "em7", label: "Lunch Break", startRange: "12:00-13:00", duration: 60, type: "break", icon: "🍽️" },
        { id: "em8", label: "Study Session 4", startRange: "13:00-14:00", duration: 120, type: "study", icon: "book" },
        { id: "em9", label: "Tea Break", startRange: "15:00-16:00", duration: 30, type: "break", icon: "☕" },
        { id: "em10", label: "Study Session 5", startRange: "15:30-16:30", duration: 120, type: "study", icon: "book" },
        { id: "em11", label: "Tea Break / Shop", startRange: "17:30-18:30", duration: 120, type: "break", icon: "local_cafe" },
        { id: "em12", label: "Dinner / Phone / TV", startRange: "19:30-20:30", duration: 90, type: "break", icon: "restaurant" },
        { id: "em13", label: "Sleep", startRange: "21:00-22:00", duration: 360, type: "sleep", icon: "😴" }
      ]
    },
    lateNight: {
      name: "Late Night",
      totalStudy: "13 hrs",
      totalBreaks: "5 hrs",
      sleep: "6 hrs",
      slots: [
        { id: "ln1", label: "Wake Up & Get Ready", startRange: "08:00-09:00", duration: 60, type: "routine", icon: "☀️" },
        { id: "ln2", label: "Study Session 1", startRange: "09:00-10:00", duration: 180, type: "study", icon: "book" },
        { id: "ln3", label: "Lunch Break", startRange: "12:00-13:00", duration: 60, type: "break", icon: "🍽️" },
        { id: "ln4", label: "Study Session 2", startRange: "13:00-14:00", duration: 120, type: "study", icon: "book" },
        { id: "ln5", label: "Tea Break", startRange: "15:00-16:00", duration: 30, type: "break", icon: "☕" },
        { id: "ln6", label: "Study Session 3", startRange: "15:30-16:30", duration: 120, type: "study", icon: "book" },
        { id: "ln7", label: "Tea Break / Shop", startRange: "17:30-18:30", duration: 120, type: "break", icon: "local_cafe" },
        { id: "ln8", label: "Dinner / Phone / TV", startRange: "19:30-20:30", duration: 60, type: "break", icon: "restaurant" },
        { id: "ln9", label: "Study Session 4", startRange: "20:30-21:30", duration: 120, type: "study", icon: "book" },
        { id: "ln10", label: "Power Nap Break", startRange: "22:30-23:30", duration: 30, type: "break", icon: "bedtime" },
        { id: "ln11", label: "Study Session 5", startRange: "23:00-00:00", duration: 180, type: "study", icon: "book" },
        { id: "ln12", label: "Sleep", startRange: "02:00-03:00", duration: 360, type: "sleep", icon: "😴" }
      ]
    },
    rules: [
      "Daily Practice MCQs for at least 15 Minutes",
      "📖 Give Primary Subject at least 8 hours",
      "Give Secondary Subject Max. 4 hours",
      "✍️ Solve/Write at least 1 Question by hand",
      "Read Questions and Answers daily",
      "💾 Keep Study Content downloaded, if any",
      "Prepare 'What to Study tomorrow' in advance"
    ]
  },

  // ─── Mock Test Schedule (Group 2 only: DT, IDT, IBS) ───────────────
  mocks: {
    series1: [
      { id: "m1-1", subject: "DT", date: "2026-08-08", series: 1 },
      { id: "m1-2", subject: "IDT", date: "2026-08-18", series: 1 },
      { id: "m1-3", subject: "IBS", date: "2026-08-22", series: 1 }
    ],
    series2: [
      { id: "m2-1", subject: "DT", date: "2026-09-18", series: 2 },
      { id: "m2-2", subject: "IDT", date: "2026-09-24", series: 2 },
      { id: "m2-3", subject: "IBS", date: "2026-09-27", series: 2 }
    ],
    series3: [
      { id: "m3-1", subject: "DT", date: "2026-10-10", series: 3 },
      { id: "m3-2", subject: "IDT", date: "2026-10-13", series: 3 },
      { id: "m3-3", subject: "IBS", date: "2026-10-15", series: 3 }
    ]
  },

  // ─── CA Final Group 2 — November 2026 Datesheet (ICAI Official) ───────────────
  finalExams: [
    { id: "final-dt", subject: "Paper 4: DT & International Tax", date: "2026-11-09", day: "Monday", time: "2:00 PM – 5:00 PM" },
    { id: "final-idt", subject: "Paper 5: IDT (GST + Customs)", date: "2026-11-11", day: "Wednesday", time: "2:00 PM – 5:00 PM" },
    { id: "final-ibs", subject: "Paper 6: IBS (Case Study)", date: "2026-11-13", day: "Friday", time: "2:00 PM – 6:00 PM" }
  ],

  // ─── DT Syllabus (Aarish Khan Easy Notes — Chapterwise) ─────
  // Tracking: conceptBook, questionBank, revisionVideo
  dtChapters: [
    { id: "dt1", name: "PGBP (Profits & Gains from Business & Profession)" },
    { id: "dt2", name: "Taxation of Various Entities" },
    { id: "dt3", name: "Profit Linked Deductions" },
    { id: "dt4", name: "MAT (Minimum Alternate Tax) + IND AS" },
    { id: "dt5", name: "AMT (Alternate Minimum Tax)" },
    { id: "dt6", name: "Return Filing & Assessment Procedure" },
    { id: "dt7", name: "Rectification, Appeals & Revision" },
    { id: "dt8", name: "Appeals, Revision & Collection & Recovery" },
    { id: "dt9", name: "Compilation of Time Limits" },
    { id: "dt10", name: "Penalties" },
    { id: "dt11", name: "Dispute Resolution Committee" },
    { id: "dt12", name: "Set Off & Carry Forward of Losses" },
    { id: "dt13", name: "Taxation of AIF (I & II)" },
    { id: "dt14", name: "Taxation of Securitisation Fund" },
    { id: "dt15", name: "TDS & TCS" },
    { id: "dt16", name: "Taxation of Virtual Digital Asset" },
    { id: "dt17", name: "Capital Gains" },
    { id: "dt18", name: "Income from Other Sources" },
    { id: "dt19", name: "Deduction for SEZ Unit (Sec 10AA)" },
    { id: "dt20", name: "Taxation of Mutual Fund" },
    { id: "dt21", name: "Advance Tax (234A/B/C)" },
    { id: "dt22", name: "Updated Returns (139(8A)/140B)" },
    { id: "dt23", name: "Bonus Stripping & Dividend Stripping" },
    { id: "dt24", name: "Taxation of Trust" },
    { id: "dt25", name: "Alternative Tax Regimes (115BAA/BAB/BAD/BAE)" },
    { id: "dt26", name: "Deductions under Chapter VIA" },
    { id: "dt27", name: "Tax Audit" },
    { id: "dt28", name: "Non-Resident Taxation" },
    { id: "dt29", name: "Business Trust (Sec 115UA)" },
    { id: "dt30", name: "Double Taxation Relief & FTC Rules" },
    { id: "dt31", name: "Transfer Pricing" },
    { id: "dt32", name: "Board for Advance Ruling" },
    { id: "dt33", name: "Compounding of Offences" },
    { id: "dt34", name: "GAAR (General Anti-Avoidance Rule)" },
    { id: "dt35", name: "Vodafone Case Law & Effects" },
    { id: "dt36", name: "Application vs Diversion of Income" },
    { id: "dt37", name: "Model Tax Convention" },
    { id: "dt38", name: "Application & Interpretation of Tax Treaties" },
    { id: "dt39", name: "BEPS (Base Erosion & Profit Shifting)" },
    { id: "dt40", name: "Tonnage Taxation" },
    { id: "dt41", name: "Miscellaneous Amendments" },
    { id: "dt42", name: "SFT & Reportable Account" },
    { id: "dt43", name: "Tax Rates (Both Regimes)" },
    { id: "dt44", name: "Black Money Law" },
    { id: "dt45", name: "ICAI Case Laws" },
    { id: "dt46", name: "Latest Developments in International Taxation" }
  ],

  // ─── IDT Syllabus (VB Sir IDT Simplified — Chapterwise) ─────
  // Tracking: conceptBook, questionBank, revisionVideo
  idtChapters: [
    { id: "idt1", name: "Supply under GST" },
    { id: "idt2", name: "Reverse Charge Mechanism & Basic Concepts" },
    { id: "idt3", name: "Composition Scheme" },
    { id: "idt4", name: "Exemptions from GST" },
    { id: "idt5", name: "Time of Supply" },
    { id: "idt6", name: "Value of Supply" },
    { id: "idt7", name: "Input Tax Credit" },
    { id: "idt8", name: "Place of Supply (IGST Act)" },
    { id: "idt9", name: "Payment of Tax, TDS & TCS" },
    { id: "idt10", name: "Registration" },
    { id: "idt11", name: "Tax Invoice, Debit & Credit Notes" },
    { id: "idt12", name: "Accounts, Records & E-Way Bill" },
    { id: "idt13", name: "Returns" },
    { id: "idt14", name: "Import & Export under GST" },
    { id: "idt15", name: "Assessment & Audit" },
    { id: "idt16", name: "Inspection, Search, Seizure & Arrest" },
    { id: "idt17", name: "Demands & Recovery" },
    { id: "idt18", name: "Offences & Penalties" },
    { id: "idt19", name: "Appeals & Revision" },
    { id: "idt20", name: "Advance Ruling" },
    { id: "idt21", name: "Miscellaneous Provisions" },
    { id: "idt22", name: "Constitutional Provisions & Levy of Customs" },
    { id: "idt23", name: "Importation & Exportation Procedure" },
    { id: "idt24", name: "Assessment & Tariff Value under Customs" },
    { id: "idt25", name: "Valuation under Customs" },
    { id: "idt26", name: "Pilfered Goods & Customs Benefits" },
    { id: "idt27", name: "Warehousing" },
    { id: "idt28", name: "Customs Tariff Act" },
    { id: "idt29", name: "Audit & Refund under Customs" },
    { id: "idt30", name: "Foreign Trade Policy" },
    { id: "idt31", name: "Import of Goods at Concessional Rate" }
  ],

  // ─── IBS Subjects (Simple checkbox — overview level) ─────
  ibsSubjects: {
    dt: {
      name: "DT (Direct Tax)",
      source: "Same as Paper 4",
      chapters: [] // Will reference dtChapters
    },
    idt: {
      name: "IDT (Indirect Tax)",
      source: "Same as Paper 5",
      chapters: [] // Will reference idtChapters
    },
    afm: {
      name: "AFM (Advanced Financial Management)",
      source: "IBS Overview",
      chapters: [
        { id: "afm1", name: "Portfolio Management (Markowitz, CAPM)" },
        { id: "afm2", name: "Mutual Funds & Portfolio Evaluation" },
        { id: "afm3", name: "Derivatives — Options & Valuation" },
        { id: "afm4", name: "Interest Rate Risk Management (FRA, Swaps, Futures)" },
        { id: "afm5", name: "Foreign Exchange & Forex Risk Management" },
        { id: "afm6", name: "International Financial Management" },
        { id: "afm7", name: "Strategic Financial Decision Making" },
        { id: "afm8", name: "Securitization & Blockchain" },
        { id: "afm9", name: "Startup Finance & Venture Capital" },
        { id: "afm10", name: "Business Valuation (DCF, EVA, MVA)" },
        { id: "afm11", name: "Mergers, Acquisitions & Restructuring" },
        { id: "afm12", name: "Business Succession Strategy" }
      ]
    },
    fr: {
      name: "FR (Financial Reporting)",
      source: "Jai Sir Concept Book + ICAI SM",
      chapters: [
        { id: "fr1", name: "Roadmap of Ind AS" },
        { id: "fr2", name: "Ind AS 1 — Presentation of Financial Statements" },
        { id: "fr3", name: "Ind AS 16 — Property, Plant & Equipment" },
        { id: "fr4", name: "Ind AS 2 — Inventories" },
        { id: "fr5", name: "Ind AS 38 — Intangible Assets" },
        { id: "fr6", name: "Ind AS 40 — Investment Property" },
        { id: "fr7", name: "Ind AS 41 — Agriculture" },
        { id: "fr8", name: "Ind AS 36 — Impairment of Assets" },
        { id: "fr9", name: "Ind AS 105 — Non-current Assets Held for Sale" },
        { id: "fr10", name: "Ind AS 12 — Income Taxes" },
        { id: "fr11", name: "Ind AS 19 — Employee Benefits" },
        { id: "fr12", name: "Ind AS 20 — Government Grants" },
        { id: "fr13", name: "Ind AS 21 — Foreign Currency" },
        { id: "fr14", name: "Ind AS 33 — Earnings Per Share" },
        { id: "fr15", name: "Ind AS 102 — Share Based Payment" },
        { id: "fr16", name: "Ind AS 7 — Cash Flows" },
        { id: "fr17", name: "Ind AS 27 — Separate Financial Statements" },
        { id: "fr18", name: "Ind AS 103 — Business Combinations" },
        { id: "fr19", name: "Ind AS 110 — Consolidated Financial Statements" },
        { id: "fr20", name: "Ind AS 111 — Joint Arrangements" },
        { id: "fr21", name: "Ind AS 28 — Associates & Joint Ventures" },
        { id: "fr22", name: "Ind AS 115 — Revenue from Contracts" },
        { id: "fr23", name: "Financial Instruments (Ind AS 32/109/107)" },
        { id: "fr24", name: "Ind AS 8 — Accounting Policies & Estimates" },
        { id: "fr25", name: "Ind AS 10 — Events After Reporting Period" },
        { id: "fr26", name: "Ind AS 24 — Related Party Disclosures" },
        { id: "fr27", name: "Ind AS 34 — Interim Financial Reporting" },
        { id: "fr28", name: "Ind AS 37 — Provisions & Contingencies" },
        { id: "fr29", name: "Ind AS 108 — Operating Segments" },
        { id: "fr30", name: "Ind AS 113 — Fair Value Measurement" },
        { id: "fr31", name: "Ind AS 101 — First-time Adoption" }
      ]
    },
    audit: {
      name: "Audit (Advanced Auditing)",
      source: "Ravi Taori Titanium + ICAI SM",
      chapters: [
        { id: "aud1", name: "Quality Control (SQC 1)" },
        { id: "aud2", name: "General Auditing Principles & Responsibilities" },
        { id: "aud3", name: "Audit Planning, Strategy & Execution" },
        { id: "aud4", name: "Materiality, Risk Assessment & Internal Control" },
        { id: "aud5", name: "Audit Evidence" },
        { id: "aud6", name: "Completion and Review" },
        { id: "aud7", name: "Reporting" },
        { id: "aud8", name: "Specialised Areas" },
        { id: "aud9", name: "Audit Related Services" },
        { id: "aud10", name: "Review of Financial Information" },
        { id: "aud11", name: "Prospective Financial Info & Other Assurance" },
        { id: "aud12", name: "Digital Auditing & Assurance" },
        { id: "aud13", name: "Group Audits" },
        { id: "aud14", name: "Audit of Banks & NBFCs" },
        { id: "aud15", name: "Audit of Public Sector Undertakings" },
        { id: "aud16", name: "Internal Audit" },
        { id: "aud17", name: "Due Diligence, Investigation & Forensic Audit" },
        { id: "aud18", name: "SDG & ESG Assurance" },
        { id: "aud19", name: "Professional Ethics & Liabilities" }
      ]
    },
    law: {
      name: "Law (Corporate & Economic Laws)",
      source: "ICAI SPOM SET A",
      chapters: [
        { id: "law1", name: "Appointment & Qualification of Directors" },
        { id: "law2", name: "Appointment & Remuneration of Managerial Personnel" },
        { id: "law3", name: "Meetings of Board & Its Powers" },
        { id: "law4", name: "Inspection, Inquiry & Investigation" },
        { id: "law5", name: "Compromises, Arrangements & Amalgamations" },
        { id: "law6", name: "Prevention of Oppression & Mismanagement" },
        { id: "law7", name: "Winding Up" },
        { id: "law8", name: "Miscellaneous Provisions" },
        { id: "law9", name: "NCLT & NCLAT" },
        { id: "law10", name: "e-Filing" },
        { id: "law11", name: "Securities Laws (SEBI, LODR, ICDR, SAST, PIT)" },
        { id: "law12", name: "FEMA, 1999" },
        { id: "law13", name: "FCRA, 2010" },
        { id: "law14", name: "IBC, 2016 (Insolvency & Bankruptcy Code)" }
      ]
    },
    scpm: {
      name: "SC&PM (Strategic Cost & Performance Mgmt)",
      source: "ICAI SPOM SET B",
      chapters: [
        { id: "scpm1", name: "Introduction to Strategic Cost Management" },
        { id: "scpm2", name: "Modern Business Environment" },
        { id: "scpm3", name: "Lean System and Innovation" },
        { id: "scpm4", name: "Specialist Cost Management Techniques" },
        { id: "scpm5", name: "Cost Management for Emerging Business Models" },
        { id: "scpm6", name: "Strategic Revenue Management (Pricing)" },
        { id: "scpm7", name: "Strategic Profit Management (ABM, ABB)" },
        { id: "scpm8", name: "Intro to Strategic Performance Management" },
        { id: "scpm9", name: "Performance Measures — Private Sector" },
        { id: "scpm10", name: "Performance Measures — NFP Organisations" },
        { id: "scpm11", name: "Preparation of Performance Reports" },
        { id: "scpm12", name: "Divisional Transfer Pricing" },
        { id: "scpm13", name: "Standard Costing & Variance Analysis" },
        { id: "scpm14", name: "Case Study" }
      ]
    }
  },

  // ─── Motivational Quotes ──────────────
  quotes: [
    "Consistency beats talent when talent doesn't work consistently.",
    "The pain of studying is temporary. The pain of not knowing is forever.",
    "You don't have to be great to start, but you have to start to be great.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
    "Dream is not what you see in sleep, it's the thing which doesn't let you sleep.",
    "Hard work beats talent when talent doesn't work hard.",
    "CA Final is not about intelligence, it's about persistence.",
    "The expert in anything was once a beginner.",
    "Fall seven times, stand up eight.",
    "Your future self will thank you for the effort you put in today.",
    "Study like there's no tomorrow, but plan like you'll live forever.",
    "Champions keep playing until they get it right.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "It always seems impossible until it's done.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Every master was once a disaster."
  ]
};
