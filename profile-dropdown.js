/**
 * Profile Dropdown Functionality
 * 
 * This script enables the profile dropdown menu functionality
 * across all pages in the Visionly application.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get reference to profile photo and dropdown elements
    const profilePhoto = document.getElementById('profile-photo');
    const dropdownMenu = document.getElementById('profile-dropdown-menu');
    const overlay = document.getElementById('profile-dropdown-overlay');
    
    // Safety check
    if (!profilePhoto || !dropdownMenu || !overlay) {
        console.error('Profile dropdown elements not found');
        return;
    }
    
    // Toggle dropdown menu on profile photo click
    profilePhoto.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
        overlay.classList.toggle('show');
    });
    
    // Hide dropdown when clicking overlay
    overlay.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        overlay.classList.remove('show');
    });
    
    // Hide dropdown when clicking anywhere else
    document.addEventListener('click', function(e) {
        if (!profilePhoto.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
            overlay.classList.remove('show');
        }
    });
    
    // Handle logout functionality
    const logoutLink = document.querySelector('.dropdown-item[href="logout.html"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().signOut().then(() => {
                    window.location.href = 'index.html';
                }).catch(error => {
                    console.error('Error signing out:', error);
                });
            } else {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Set active class for current page
    highlightCurrentPage();
});

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop();
    
    const menuItems = document.querySelectorAll('.dropdown-item');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === filename) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
