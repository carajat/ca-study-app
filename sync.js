
function showLoginError(msg) {
  const errDiv = document.getElementById('login-error');
  if (errDiv) errDiv.innerText = msg;
  else alert(msg);
}

// sync.js

const firebaseConfig = {
  apiKey: "AIzaSyBpeHDZVu1agqoIuIAO2CmEB8jEl6WwC5A",
  authDomain: "castudyapp8.firebaseapp.com",
  projectId: "castudyapp8",
  storageBucket: "castudyapp8.firebasestorage.app",
  messagingSenderId: "940782971883",
  appId: "1:940782971883:web:a7f8d55c6807de66ee87ae",
  databaseURL: "https://castudyapp8-default-rtdb.firebaseio.com" 
};

// Initialize Firebase
let app, auth, db;
try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.database();
} catch (e) {
  console.error("Firebase init failed:", e);
}

window.GF_EMAIL = 'shrutiagrrawal@gmail.com';
window.isReadOnlyMode = false;

// Group-specific cloud paths to prevent data mingling
function getCloudPath() {
  const group = (window.state && window.state.activeGroup) || localStorage.getItem('ca_app_prefs_group') || 'group1';
  return '/sharedData/coupleRoom/' + group + '/';
}

let isSyncing = false;
let currentUser = null;
let currentListenerPath = null;

// Attach cloud listener for current group
function attachCloudListener() {
  if (!currentUser || !db) return;
  
  const newPath = getCloudPath();
  
  // If already listening to this exact path, skip
  if (currentListenerPath === newPath) return;
  
  // Detach old listener if exists
  if (currentListenerPath) {
    db.ref(currentListenerPath).off('value');
    console.log("Detached cloud listener from:", currentListenerPath);
  }
  
  currentListenerPath = newPath;
  console.log("Attaching cloud listener to:", newPath);
  
  db.ref(newPath).on('value', (snapshot) => {
    const cloudData = snapshot.val();
    if (cloudData && !isSyncing) {
      isSyncing = true;
      if (typeof window.reloadAppFromCloud === 'function') {
        window.reloadAppFromCloud(cloudData);
      }
      setTimeout(() => { isSyncing = false; }, 500);
    }
  });
}

// Expose so app.js can call it on group switch
window.attachCloudListener = attachCloudListener;

window.getDisplayUsername = function(email) {
  if (!email) return "USER";
  const safeEmail = email.replace(/\./g, ',');
  if (window.DYNAMIC_DATA && DYNAMIC_DATA.customUsernames && DYNAMIC_DATA.customUsernames[safeEmail]) {
    return DYNAMIC_DATA.customUsernames[safeEmail];
  }
  let name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
};

window.updateUserBadge = function() {
  const badgeEl = document.getElementById('header-user-badge');
  if (!badgeEl) return;
  if (window.isCloudLoggedIn && window.loggedUserEmail) {
    const name = window.getDisplayUsername(window.loggedUserEmail);
    badgeEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; background:rgba(10,132,255,0.15); border:1px solid rgba(10,132,255,0.35); color:var(--primary, #0a84ff); font-size:11px; font-weight:600; margin-top:6px;"><span class="material-symbols-rounded" style="font-size:13px;">account_circle</span> ${name} (${window.isReadOnlyMode ? 'View Mode' : 'Admin Mode'})</span>`;
  } else {
    badgeEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:12px; background:rgba(255,159,10,0.15); border:1px solid rgba(255,159,10,0.35); color:#ff9f0a; font-size:11px; font-weight:600; margin-top:6px;"><span class="material-symbols-rounded" style="font-size:13px;">cloud_off</span> Offline Mode</span>`;
  }
};

if (auth && db) {
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    window.isCloudLoggedIn = !!user;
    window.loggedUserEmail = user ? user.email : null;
    window.isReadOnlyMode = user ? (user.email === window.GF_EMAIL) : false;
    if (window.isReadOnlyMode) { document.body.classList.add('read-only-mode'); } else { document.body.classList.remove('read-only-mode'); }
    
    window.updateUserBadge();

    if (user) {
      console.log("Logged in as:", user.email);
      const overlay = document.getElementById('welcome-overlay');
      if (overlay) overlay.style.display = 'none';
      attachCloudListener();
    } else {
      console.log("User is signed out (Offline Mode)");
      if (currentListenerPath) {
        db.ref(currentListenerPath).off('value');
        currentListenerPath = null;
      }
      if (localStorage.getItem('ca-skip-login') !== 'true') {
        const overlay = document.getElementById('welcome-overlay');
        if (overlay) overlay.style.display = 'flex';
      }
    }
  });
} else {
  console.warn("Firebase Auth or DB not initialized. Running in strict offline mode.");
  window.updateUserBadge();
}

window.loginToCloud = function() {
  if (!auth) return showLoginError("Firebase not loaded. Check internet.");
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  if(!email || !pass) return showLoginError("Please enter email and password.");
  
  const btn = document.getElementById('login-btn');
  btn.textContent = "Logging in...";
  btn.disabled = true;

  auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {})
    .catch((error) => {
      showLoginError("Error: " + error.message);
      btn.textContent = "Login";
      btn.disabled = false;
    });
}

window.continueOffline = function() {
  localStorage.setItem('ca-skip-login', 'true');
  const overlay = document.getElementById('welcome-overlay');
  if (overlay) overlay.style.display = 'none';
}

window.logoutFromCloud = function() {
  localStorage.removeItem('ca-skip-login');
  if (auth && auth.currentUser) {
    auth.signOut().then(() => {
      alert("Logged out successfully");
      location.reload();
    });
  } else {
    location.reload();
  }
}

let syncTimeout = null;
window.syncToCloud = function(data) {
  if (!currentUser || !db) return; 
  if (window.isReadOnlyMode) { console.log("Read-only mode: Sync prevented"); return; } 
  
  const path = getCloudPath();
  const cleanData = JSON.parse(JSON.stringify(data));
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(() => {
    db.ref(path).set(cleanData).catch(err => {
      console.error("Firebase sync error.", err.message); 
      if(typeof showToast === "function") showToast("Sync Error: " + err.message);
    });
  }, 300);
}

// Server Time Offset Logic for perfectly synced timers
window.serverTimeOffset = 0;
if (db) {
  db.ref('.info/serverTimeOffset').on('value', function(snapshot) {
    window.serverTimeOffset = snapshot.val() || 0;
  });
}
window.getGlobalTime = function() {
  return Date.now() + window.serverTimeOffset;
};
