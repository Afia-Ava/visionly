// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDs9_aRBzltPKNU3i8uZxoyaGiBZSoPb5s",
    authDomain: "visionly-project.firebaseapp.com", // Replace with your actual project domain
    projectId: "visionly-project", // Replace with your actual project ID
    storageBucket: "visionly-project.appspot.com", // Replace with your actual storage bucket
    messagingSenderId: "123456789012", // Replace with your actual sender ID
    appId: "1:123456789012:web:abcdef123456789012345678" // Replace with your actual app ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); // Add this line for Storage

console.log('Firebase initialized successfully');