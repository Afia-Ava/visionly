// Profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile dropdown script loaded');
    
    // Add CSS styles first
    addProfileStyles();
    
    // Try to set up profile dropdown with or without Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
        // Wait for Firebase auth to be ready
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('User logged in, setting up profile dropdown');
                setupProfileDropdown(user);
            } else {
                console.log('No user logged in');
                setupBasicProfileDropdown();
            }
        });
    } else {
        console.log('Firebase not available, creating basic profile dropdown');
        setupBasicProfileDropdown();
    }
});

function addProfileStyles() {
    const styles = `
        .profile-container {
            position: relative;
            display: inline-block;
        }
        
        .profile-button {
            cursor: pointer;
            border-radius: 50%;
            overflow: hidden;
            width: 40px;
            height: 40px;
            border: 2px solid #e1e5e9;
            transition: border-color 0.3s ease;
            background-color: #ff6b6b;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .profile-button:hover {
            border-color: #667eea;
        }
        
        .profile-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
        
        .profile-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            min-width: 150px;
            z-index: 1000;
            display: none;
            margin-top: 8px;
        }
        
        .profile-dropdown.show {
            display: block;
        }
        
        .dropdown-item {
            padding: 12px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #333;
            transition: background-color 0.2s ease;
        }
        
        .dropdown-item:hover {
            background-color: #f8f9fa;
        }
        
        .dropdown-item:first-child {
            border-radius: 8px 8px 0 0;
        }
        
        .dropdown-item:last-child {
            border-radius: 0 0 8px 8px;
        }
        
        .dropdown-item svg {
            opacity: 0.7;
        }
    `;

    if (!document.querySelector('#profile-dropdown-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'profile-dropdown-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
}

function setupBasicProfileDropdown() {
    const profileHTML = `
        <div class="profile-container">
            <div class="profile-button" id="profile-button">
                <img src="https://via.placeholder.com/40x40/ff6b6b/ffffff?text=U" 
                     alt="Profile" class="profile-image">
            </div>
            <div class="profile-dropdown" id="profile-dropdown">
                <div class="dropdown-item" id="profile-option">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    Profile
                </div>
                <div class="dropdown-item" id="logout-option">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                        <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    Logout
                </div>
            </div>
        </div>
    `;
    insertProfileDropdown(profileHTML);
}

function setupProfileDropdown(user) {
    const profileHTML = `
        <div class="profile-container">
            <div class="profile-button" id="profile-button">
                <img src="${user.photoURL || 'https://via.placeholder.com/40x40/ff6b6b/ffffff?text=' + (user.displayName ? user.displayName.charAt(0) : 'U')}" 
                     alt="Profile" class="profile-image">
            </div>
            <div class="profile-dropdown" id="profile-dropdown">
                <div class="dropdown-item" id="profile-option">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    Profile
                </div>
                <div class="dropdown-item" id="logout-option">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                        <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    Logout
                </div>
            </div>
        </div>
    `;
    insertProfileDropdown(profileHTML);
}

function insertProfileDropdown(profileHTML) {
    // Look for the profile photo in the navbar first
    const profileSelectors = [
        '#profile-photo',
        '.profile-pic', 
        '.profile-icon', 
        '#profile-pic', 
        '[class*="profile"]',
        'img[src*="profile"]',
        'img[alt*="profile"]',
        'img[alt*="Profile"]',
        '.user-avatar',
        '.avatar',
        'nav img:last-child',
        'header img:last-child',
        '.navbar img:last-child',
        '#navbar-container img',
        'nav div:last-child',
        'header div:last-child'
    ];
    
    let profileElement = null;
    
    for (const selector of profileSelectors) {
        profileElement = document.querySelector(selector);
        if (profileElement) {
            console.log('Found profile element with selector:', selector);
            break;
        }
    }
    
    if (profileElement) {
        // Replace the found element with the dropdown
        profileElement.outerHTML = profileHTML;
        setupProfileEvents();
        console.log('Profile element replaced with dropdown');
    } else {
        // Create profile dropdown in navbar area
        const navbar = document.querySelector('.navbar, nav');
        if (navbar) {
            const navRight = navbar.querySelector('div:last-child');
            if (navRight) {
                const container = document.createElement('div');
                container.innerHTML = profileHTML;
                navRight.appendChild(container.firstElementChild);
                setupProfileEvents();
                console.log('Profile dropdown added to navbar');
                return;
            }
        }
        
        // Fallback: Create in top-right corner
        const container = document.createElement('div');
        container.innerHTML = profileHTML;
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        
        document.body.appendChild(container.firstElementChild);
        setupProfileEvents();
        console.log('Profile dropdown created as fallback');
    }
}

function setupProfileEvents() {
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileOption = document.getElementById('profile-option');
    const logoutOption = document.getElementById('logout-option');

    if (!profileButton || !profileDropdown) {
        console.error('Profile elements not found');
        return;
    }

    profileButton.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        console.log('Profile dropdown toggled');
    });

    document.addEventListener('click', function() {
        profileDropdown.classList.remove('show');
    });

    profileDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    if (profileOption) {
        profileOption.addEventListener('click', function() {
            profileDropdown.classList.remove('show');
            alert('Profile page - coming soon!');
        });
    }

    if (logoutOption) {
        logoutOption.addEventListener('click', async function() {
            profileDropdown.classList.remove('show');
            if (typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    await firebase.auth().signOut();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Error logging out');
                }
            } else {
                alert('Logout clicked - Firebase not available');
            }
        });
    }
}
