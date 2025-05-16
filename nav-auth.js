// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDs9_aRBzltPKNU3i8uZxoyaGiBZSoPb5s",
    authDomain: "visionly-webapp.firebaseapp.com",
    projectId: "visionly-webapp",
    storageBucket: "visionly-webapp.appspot.com",
    messagingSenderId: "708324469283",
    appId: "1:708324469283:web:5495341a010f8f04c51f96",
    measurementId: "G-JB5T2YBVEC"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get auth instance
const auth = firebase.auth();

// Navigation items configuration
const navItems = [
    { href: "index.html", text: "Home" },
    { href: "create-board.html", text: "Create" },
    { href: "boards.html", text: "Boards" },
    { href: "journal.html", text: "Journal" }
];

// Handle logout
function handleLogout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Function to update navigation based on auth state
function updateNavigation(user) {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    // Clear existing navigation
    navLinks.innerHTML = '';

    // Add main navigation items
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        
        // Add active class if current page
        if (window.location.pathname.endsWith(item.href)) {
            a.classList.add('active');
        }
        
        li.appendChild(a);
        navLinks.appendChild(li);
    });

    // Add user profile or login button
    const authLi = document.createElement('li');
    authLi.style.position = 'relative'; // For dropdown positioning
    
    if (user) {
        // User is signed in - show only profile picture
        const profileContainer = document.createElement('div');
        profileContainer.className = 'profile-container';
        profileContainer.innerHTML = `
            <img src="${user.photoURL || 'assets/default-avatar.jpg'}" alt="Profile" class="profile-pic" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; cursor: pointer;">
            <div class="profile-dropdown" style="display: none; position: absolute; right: 0; top: 100%; background: #2c2046; border-radius: 8px; padding: 8px; min-width: 150px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                <a href="profile.html" class="dropdown-item" style="display: block; padding: 8px; color: white; text-decoration: none;">Profile Settings</a>
                <button onclick="handleLogout()" class="dropdown-item" style="display: block; width: 100%; padding: 8px; color: white; background: none; border: none; text-align: left; cursor: pointer;">Logout</button>
            </div>
        `;
        
        // Toggle dropdown on profile picture click
        const profilePic = profileContainer.querySelector('.profile-pic');
        const dropdown = profileContainer.querySelector('.profile-dropdown');
        
        profilePic.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
        
        authLi.appendChild(profileContainer);
    } else {
        // No user is signed in - add login button
        const authBtn = document.createElement('a');
        authBtn.href = "auth.html";
        authBtn.className = 'btn login';
        authBtn.textContent = 'Login';
        authLi.appendChild(authBtn);
    }
    
    navLinks.appendChild(authLi);
}

// Handle mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
}

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
    updateNavigation(user);
});

// Setup mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    
    // Initial navigation update
    updateNavigation(auth.currentUser);
}); 