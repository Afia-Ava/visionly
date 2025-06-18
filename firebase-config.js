// Your web app's Firebase configuration (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDs9_aRBzltPKNU3i8uZxoyaGiBZSoPb5s",
  authDomain: "visionly-webapp.firebaseapp.com",
  projectId: "visionly-webapp",
  storageBucket: "visionly-webapp.appspot.com",
  messagingSenderId: "708324469283",
  appId: "1:708324469283:web:5495341a010f8f04c51f96",
  measurementId: "G-JB5T2YBVEC"
};

// Initialize Firebase only if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();