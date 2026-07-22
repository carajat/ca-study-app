
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
  // Fallback DB URL
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

const SHARED_PATH = '/sharedData/coupleRoom/';
let isSyncing = false; // flag to prevent infinite loops when receiving data
let currentUser = null;


if (auth && db) {
  // Listen to auth state
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    window.isCloudLoggedIn = !!user;
    window.isReadOnlyMode = user ? (user.email === window.GF_EMAIL) : false;
    if (window.isReadOnlyMode) { document.body.classList.add('read-only-mode'); } else { document.body.classList.remove('read-only-mode'); }
    if (user) {
      console.log("Logged in as:", user.email);
      const overlay = document.getElementById('welcome-overlay');
      if (overlay) overlay.style.display = 'none';
      
      // Start listening to the shared database path
      db.ref(SHARED_PATH).on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData && !isSyncing) {
          isSyncing = true;
          if (typeof window.reloadAppFromCloud === 'function') {
            window.reloadAppFromCloud(cloudData);
          }
          setTimeout(() => { isSyncing = false; }, 500);
        }
      });
    } else {
      console.log("User is signed out (Offline Mode)");
      if (localStorage.getItem('ca-skip-login') !== 'true') {
        const overlay = document.getElementById('welcome-overlay');
        if (overlay) overlay.style.display = 'flex';
      }
    }
  });
} else {
  console.warn("Firebase Auth or DB not initialized. Running in strict offline mode.");
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
  
  const cleanData = JSON.parse(JSON.stringify(data));
  if (syncTimeout) clearTimeout(syncTimeout);
  
  syncTimeout = setTimeout(() => {
    db.ref(SHARED_PATH).set(cleanData).catch(err => {
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

