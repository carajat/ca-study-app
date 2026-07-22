function normalizeForHash(data) {
  if (Array.isArray(data)) {
    const arr = data.map(normalizeForHash).filter(v => v !== undefined && v !== null);
    return arr.length > 0 ? arr : undefined;
  } else if (typeof data === 'object' && data !== null) {
    const newObj = {};
    let hasKeys = false;
    const keys = Object.keys(data).sort();
    for (let k of keys) {
      const val = normalizeForHash(data[k]);
      if (val !== undefined && val !== null) {
        newObj[k] = val;
        hasKeys = true;
      }
    }
    return hasKeys ? newObj : undefined;
  }
  return data;
}

const cloudData = {
  journalEntries: {
    "2026-07-22": {
      breaks: "",
      feeling: "",
      sleep: "",
      wasted: "",
      rows: [{durHH: "2", durMM: "0", status: "Done", subject: "Paper 5", tasks: "", topic: "Input"}]
    }
  }
};

console.log("CLOUD HASH:");
console.log(JSON.stringify(normalizeForHash(cloudData)));

const localData = {
  journalEntries: {
    "2026-07-22": {
      breaks: "",
      feeling: "",
      sleep: "",
      wasted: "",
      rows: []
    }
  }
};

console.log("LOCAL HASH:");
console.log(JSON.stringify(normalizeForHash(localData)));
