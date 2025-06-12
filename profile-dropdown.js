/**
 * Profile Dropdown Functionality
 * Handles profile photo dropdown menu across all pages
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get the profile photo element
    const profilePhoto = document.getElementById('profile-photo');
    if (!profilePhoto) {
        console.error('Profile photo element not found');
        return;
    }

    // Add click handler to profile photo
    profilePhoto.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Get or create dropdown menu
        let dropdownMenu = document.getElementById('profile-dropdown-menu');
        if (!dropdownMenu) {
            // Create dropdown if it doesn't exist
            dropdownMenu = document.createElement('div');
            dropdownMenu.id = 'profile-dropdown-menu';
            dropdownMenu.className = 'dropdown-menu';
            
            // Add menu items
            dropdownMenu.innerHTML = `
                <a href="profile.html" class="dropdown-item">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="achievements.html" class="dropdown-item">
                    <i class="fas fa-trophy"></i> Achievements
                </a>
                <a href="#" class="dropdown-item" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
            
            // Add to document body
            document.body.appendChild(dropdownMenu);
            
            // Handle logout functionality
            const logoutBtn = dropdownMenu.querySelector('#logout-btn');
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    firebase.auth().signOut().then(() => {
                        window.location.href = 'index.html';
                    }).catch((error) => {
                        console.error('Error signing out:', error);
                    });
                } else {
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Get or create overlay
        let overlay = document.getElementById('profile-dropdown-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'profile-dropdown-overlay';
            overlay.className = 'profile-dropdown-overlay';
            document.body.appendChild(overlay);
            
            // Close dropdown when clicking overlay
            overlay.addEventListener('click', function() {
                dropdownMenu.classList.remove('show');
                this.classList.remove('show');
            });
        }
        
        // Position dropdown
        const rect = profilePhoto.getBoundingClientRect();
        dropdownMenu.style.position = 'fixed';
        dropdownMenu.style.top = (rect.bottom + 10) + 'px';
        dropdownMenu.style.right = (window.innerWidth - rect.right) + 'px';
        
        // Toggle visibility
        dropdownMenu.classList.toggle('show');
        overlay.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const dropdownMenu = document.getElementById('profile-dropdown-menu');
        const overlay = document.getElementById('profile-dropdown-overlay');
        
        if (dropdownMenu && overlay && 
            e.target !== profilePhoto && 
            !profilePhoto.contains(e.target) && 
            !dropdownMenu.contains(e.target)) {
            
            dropdownMenu.classList.remove('show');
            overlay.classList.remove('show');
        }
    });
    
    // Add CSS styles if not already present
    if (!document.getElementById('dropdown-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'dropdown-styles';
        styleEl.textContent = `
            .dropdown-menu {
                background-color: white;
                border-radius: 8px;
                width: 180px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1010;
                overflow: hidden;
            }
            
            .dropdown-menu.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .dropdown-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                color: #333;
                text-decoration: none;
                transition: background 0.2s ease;
                border-bottom: 1px solid #f5f5f5;
            }
            
            .dropdown-item:last-child {
                border-bottom: none;
            }
            
            .dropdown-item:hover {
                background-color: #f5f5f5;
            }
            
            .dropdown-item i {
                margin-right: 10px;
                width: 16px;
                text-align: center;
            }
            
            .profile-dropdown-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                display: none;
            }
            
            .profile-dropdown-overlay.show {
                display: block;
            }
            
            body.dark-mode .dropdown-menu {
                background-color: #140a22;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            
            body.dark-mode .dropdown-item {
                color: #e0e0e0;
                border-bottom: 1px solid #1f0f35;
            }
            
            body.dark-mode .dropdown-item:hover {
                background-color: #2d1549;
            }
        `;
        document.head.appendChild(styleEl);
    }
});
