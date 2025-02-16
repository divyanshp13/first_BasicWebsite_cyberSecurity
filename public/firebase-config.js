// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkl7lrIkhfW3DW2mfq8_VvczpczY0_kUc",
  authDomain: "s3curevau1t.firebaseapp.com",
  projectId: "s3curevau1t",
  storageBucket: "s3curevau1t.appspot.com",
  messagingSenderId: "635634325549",
  appId: "1:635634325549:web:120edbddc22ce0698d40a4",
  measurementId: "G-XS2B3Q8330"
};

// Initialize Firebase (Make sure it's only initialized once)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Use existing instance
}

// Store Firebase Auth in `window` to use globally
window.firebaseAuth = firebase.auth();
