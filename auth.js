// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDs9_aRBzltPKNU3i8uZxoyaGiBZSoPb5s",
    authDomain: "visionly-webapp.firebaseapp.com",
    projectId: "visionly-webapp",
    storageBucket: "visionly-webapp.firebasestorage.app",
    messagingSenderId: "708324469283",
    appId: "1:708324469283:web:5495341a010f8f04c51f96",
    measurementId: "G-JB5T2YBVEC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const googleSigninBtn = document.getElementById('google-signin');
const googleSignupBtn = document.getElementById('google-signup');
const forgotPasswordLink = document.getElementById('forgot-password');

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding form
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tabName}-form`) {
                form.classList.add('active');
            }
        });
    });
});

// Email/Password Sign In
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'boards.html'; // Redirect after successful sign in
    } catch (error) {
        alert(error.message);
    }
});

// Email/Password Sign Up
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const name = document.getElementById('signup-name').value;
    
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Update user profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });
        window.location.href = 'boards.html'; // Redirect after successful sign up
    } catch (error) {
        alert(error.message);
    }
});

// Google Sign In
const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        window.location.href = 'boards.html';
    } catch (error) {
        alert(error.message);
    }
};

googleSigninBtn.addEventListener('click', signInWithGoogle);
googleSignupBtn.addEventListener('click', signInWithGoogle);

// Password Reset
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    
    if (!email) {
        alert('Please enter your email address in the sign in form.');
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
        alert(error.message);
    }
});

// Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        const currentPath = window.location.pathname;
        if (currentPath.includes('auth.html')) {
            window.location.href = 'boards.html';
        }
    } else {
        // User is signed out
        const currentPath = window.location.pathname;
        const publicPages = ['index.html', 'auth.html', ''];
        if (!publicPages.some(page => currentPath.includes(page))) {
            window.location.href = 'auth.html';
        }
    }
}); 