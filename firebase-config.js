// Firebase configuration with actual project values
const firebaseConfig = {
  apiKey: "AIzaSyDs9_aRBzltPKNU3i8uZxoyaGiBZSoPb5s",
  authDomain: "project-708324469283.firebaseapp.com", 
  projectId: "project-708324469283", 
  storageBucket: "project-708324469283.appspot.com",
  messagingSenderId: "708324469283",
  appId: "1:708324469283:web:project-708324469283"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();