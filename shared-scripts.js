// Load the navbar and handle profile photo
document.addEventListener('DOMContentLoaded', function() {
    // Load the navbar
    fetch('navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-container').innerHTML = html;
            
            // Handle profile photo
            const profilePhoto = document.getElementById('profile-photo');
            if (profilePhoto) {
                const isLoggedIn = true; // Replace with actual auth logic
                const profilePhotoUrl = 'assets/default-avatar.jpg';
                
                if (isLoggedIn) {
                    profilePhoto.src = profilePhotoUrl;
                }
            }
        })
        .catch(error => console.error('Error loading navbar:', error));
});
