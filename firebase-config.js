// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxqP0_VQOEh44VPQJQk2GdZfzPcNXxL94",
    authDomain: "visionly-f73eb.firebaseapp.com",
    projectId: "visionly-f73eb",
    storageBucket: "visionly-f73eb.appspot.com",
    messagingSenderId: "1036618014242",
    appId: "1:1036618014242:web:8b04f54f99a1b8f6e2a234",
    measurementId: "G-VHXT0H2QXD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); // Add this line for Storage

console.log('Firebase initialized successfully');