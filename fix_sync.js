const fs = require('fs');
let syncJs = fs.readFileSync('sync.js', 'utf8');

const fix = `
if (auth && db) {
  // Listen to auth state
  auth.onAuthStateChanged((user) => {
    currentUser = user;
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
  if (!auth) return alert("Firebase not loaded. Check internet or AdBlocker.");
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  if(!email || !pass) return alert("Enter email and password");
  
  const btn = document.getElementById('login-btn');
  btn.textContent = "Logging in...";
  btn.disabled = true;

  auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {})
    .catch((error) => {
      alert("Login failed: " + error.message);
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

window.syncToCloud = function(data) {
  if (!currentUser || !db) return; 
  if (isSyncing) return; 
  db.ref(SHARED_PATH).set(data).catch(err => {
    console.error("Firebase sync error.", err.message);
  });
}
`;

// Extract only the setup portion and replace the rest
const setupCode = syncJs.split('// Listen to auth state')[0];
fs.writeFileSync('sync.js', setupCode + fix);
console.log('Fixed sync.js');
