// sync.js

const firebaseConfig = {
  apiKey: "AIzaSyBpeHDZVu1agqoIuIAO2CmEB8jEl6WwC5A",
  authDomain: "castudyapp8.firebaseapp.com",
  projectId: "castudyapp8",
  storageBucket: "castudyapp8.firebasestorage.app",
  messagingSenderId: "940782971883",
  appId: "1:940782971883:web:a7f8d55c6807de66ee87ae",
  // Fallback DB URL (will try asia-southeast1 first as requested, then default)
  databaseURL: "https://castudyapp8-default-rtdb.asia-southeast1.firebasedatabase.app" 
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

const SHARED_PATH = '/sharedData/coupleRoom/';
let isSyncing = false; // flag to prevent infinite loops when receiving data
let currentUser = null;

// Listen to auth state
auth.onAuthStateChanged((user) => {
  currentUser = user;
  if (user) {
    console.log("Logged in as:", user.email);
    document.getElementById('welcome-overlay').style.display = 'none';
    
    // Start listening to the shared database path
    db.ref(SHARED_PATH).on('value', (snapshot) => {
      const cloudData = snapshot.val();
      if (cloudData && !isSyncing) {
        // Data came from cloud, reload the app
        isSyncing = true;
        if (typeof window.reloadAppFromCloud === 'function') {
          window.reloadAppFromCloud(cloudData);
        }
        setTimeout(() => { isSyncing = false; }, 500); // Debounce local saves
      }
    });
  } else {
    console.log("User is signed out (Offline Mode)");
    // If not skipped login previously, show overlay
    if (localStorage.getItem('ca-skip-login') !== 'true') {
      document.getElementById('welcome-overlay').style.display = 'flex';
    }
  }
});

// Function called by UI to login
window.loginToCloud = function() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  
  if(!email || !pass) return alert("Enter email and password");
  
  const btn = document.getElementById('login-btn');
  btn.textContent = "Logging in...";
  btn.disabled = true;

  auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {
      // Success - onAuthStateChanged will handle hiding the overlay
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
      btn.textContent = "Login";
      btn.disabled = false;
    });
}

// Function called by UI to continue offline
window.continueOffline = function() {
  localStorage.setItem('ca-skip-login', 'true');
  document.getElementById('welcome-overlay').style.display = 'none';
}

window.logoutFromCloud = function() {
  auth.signOut().then(() => {
    localStorage.removeItem('ca-skip-login');
    alert("Logged out successfully");
    location.reload();
  });
}

// Function called by app.js whenever saveState() runs
window.syncToCloud = function(data) {
  if (!currentUser) return; // Not logged in, don't sync
  if (isSyncing) return; // Prevent echoing back what we just received
  
  // We upload to Firebase
  db.ref(SHARED_PATH).set(data).catch(err => {
    console.error("Firebase sync error. Probably Read-Only mode.", err.message);
  });
}
