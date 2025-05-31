// Get auth instance (assuming firebase.initializeApp has been called in firebase-config.js)
const auth = firebase.auth();

// Navigation items configuration
const navItems = [
    { href: "index.html", text: "Home" },
    { href: "create-board.html", text: "Create" },
    { href: "boards.html", text: "Boards" },
    { href: "progress.html", text: "Progress" },
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
        a.style.color = '#fff';  // Ensure text is visible
        a.style.textDecoration = 'none';  // Remove underline
        a.style.padding = '8px 15px';  // Add some padding
        
        // Add active class if current page
        if (window.location.pathname.endsWith(item.href)) {
            a.classList.add('active');
            a.style.color = '#d0a9f5';  // Highlight active page
        }
        
        // Add hover effect
        a.addEventListener('mouseenter', () => {
            if (!a.classList.contains('active')) {
                a.style.color = '#d0a9f5';
            }
        });
        a.addEventListener('mouseleave', () => {
            if (!a.classList.contains('active')) {
                a.style.color = '#fff';
            }
        });
        
        li.appendChild(a);
        navLinks.appendChild(li);
    });

    // Add user profile or login button
    const authLi = document.createElement('li');
    authLi.style.position = 'relative';
    authLi.style.marginLeft = '20px';  // Add some space between nav items and profile
    
    if (user) {
        // User is signed in - show profile picture
        const profileContainer = document.createElement('div');
        profileContainer.className = 'profile-container';
        profileContainer.innerHTML = `
            <img src="${user.photoURL || 'assets/default-avatar.jpg'}" alt="Profile" class="profile-pic" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; cursor: pointer;">
            <div class="profile-dropdown" style="display: none; position: absolute; right: 0; top: 100%; background: #2c2046; border-radius: 8px; padding: 8px; min-width: 150px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 1000;">
                <a href="profile-settings.html" class="dropdown-item" style="display: block; padding: 8px; color: white; text-decoration: none;">Profile Settings</a>
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
    
    // Check if we're on a protected page
    const currentPath = window.location.pathname;
    const protectedPages = ['create-board.html', 'boards.html', 'journal.html'];
    const publicPages = ['index.html', 'auth.html', ''];
    
    if (!user && protectedPages.some(page => currentPath.endsWith(page))) {
        // Show login prompt and redirect to auth page
        showLoginPrompt();
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000); // Give users 2 seconds to see the prompt before redirect
    } else if (user && currentPath.endsWith('auth.html')) {
        // Logged in and on auth page
        window.location.href = 'index.html';
    }
});

// Add click handlers for protected links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const protectedPages = ['create-board.html', 'boards.html', 'journal.html'];
    const isProtectedPage = protectedPages.some(page => link.href.includes(page));
    
    if (isProtectedPage && !auth.currentUser) {
        e.preventDefault();
        showLoginPrompt();
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000); // Give users 2 seconds to see the prompt before redirect
    }
});

// Function to show login prompt
function showLoginPrompt() {
    // Remove any existing prompt
    const existingPrompt = document.querySelector('.login-prompt-overlay');
    if (existingPrompt) {
        document.body.removeChild(existingPrompt);
    }

    const promptOverlay = document.createElement('div');
    promptOverlay.className = 'login-prompt-overlay';
    promptOverlay.innerHTML = `
        <div class="login-prompt">
            <h2>Please Log In</h2>
            <p>You need to be logged in to access this feature.</p>
            <p style="font-size: 14px; margin-top: 10px;">Redirecting to login page...</p>
        </div>
    `;
    document.body.appendChild(promptOverlay);
}

// Setup mobile menu and initial navigation render when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    
    // Initial navigation update based on current user state
    updateNavigation(auth.currentUser);
});