// Firebase configuration - Updated with your actual API key
const firebaseConfig = {
    apiKey: "AIzaSyDs9_aRBzltPKNU3i8uZxoyaGiBZSoPb5s",
    authDomain: "visionly-442105.firebaseapp.com",
    projectId: "visionly-442105",
    storageBucket: "visionly-442105.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Authentication state management
let currentUser = null;

// Check authentication status
function checkAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            if (user) {
                resolve(user);
            } else {
                // Redirect to login if not authenticated and not already on login page
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
                resolve(null);
            }
        });
    });
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Load navbar from external file (original approach)
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication first
    const user = await checkAuth();
    
    if (!user && !window.location.pathname.includes('login.html')) {
        return; // Will redirect to login
    }

    // Load navbar from external file only if user is authenticated
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer && user) {
        try {
            const response = await fetch('navbar.html');
            const navbarHTML = await response.text();
            navbarContainer.innerHTML = navbarHTML;
            
            // Add profile dropdown functionality after navbar loads
            addProfileDropdown(user);
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }
});

// Add profile dropdown functionality to existing navbar
function addProfileDropdown(user) {
    // Find the existing navbar and add profile picture + dropdown
    const navbar = document.querySelector('nav');
    if (!navbar) return;
    
    // Find the nav links container
    const navLinksContainer = navbar.querySelector('div > div:last-child');
    if (!navLinksContainer) return;
    
    // Create profile picture element
    const profileContainer = document.createElement('div');
    profileContainer.style.cssText = 'position: relative; margin-left: 16px;';
    
    // Profile picture button
    const profileBtn = document.createElement('button');
    profileBtn.id = 'profile-btn';
    profileBtn.style.cssText = 'background: none; border: none; cursor: pointer; padding: 4px; border-radius: 50%; transition: background 0.2s;';
    
    const profilePic = document.createElement('img');
    profilePic.id = 'profile-pic';
    profilePic.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #e0e0e0;';
    
    // Set profile picture
    if (user.photoURL) {
        profilePic.src = user.photoURL;
    } else {
        generateAvatar(user.email, profilePic);
    }
    
    profileBtn.appendChild(profilePic);
    
    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.id = 'profile-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 160px;
        z-index: 1001;
        display: none;
        margin-top: 8px;
    `;
    
    dropdown.innerHTML = `
        <div style="padding: 8px 0;">
            <div style="padding: 8px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #666;">
                <div style="font-weight: 600; color: #333;">${user.email}</div>
            </div>
            <a href="profile.html" style="display: block; padding: 12px 16px; color: #333; text-decoration: none; font-size: 14px; transition: background 0.2s;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile
                </div>
            </a>
            <div style="border-top: 1px solid #f0f0f0; margin: 4px 0;">
                <button onclick="logout()" style="width: 100%; background: none; border: none; padding: 12px 16px; color: #dc2626; text-decoration: none; font-size: 14px; cursor: pointer; text-align: left; transition: background 0.2s;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </div>
                </button>
            </div>
        </div>
    `;
    
    profileContainer.appendChild(profileBtn);
    profileContainer.appendChild(dropdown);
    
    // Add to navbar
    navLinksContainer.appendChild(profileContainer);
    
    // Add event listeners
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = dropdown.style.display !== 'none';
        dropdown.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // Add hover effects
    profileBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f8f9fa';
    });
    
    profileBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    // Add hover effects to dropdown items
    const dropdownItems = dropdown.querySelectorAll('a, button');
    dropdownItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });
}

// Generate simple avatar
function generateAvatar(email, imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Generate color based on email
    const colors = ['#6b46c1', '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2'];
    const colorIndex = email.charCodeAt(0) % colors.length;
    
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 64, 64);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(email.charAt(0).toUpperCase(), 32, 32);
    
    imgElement.src = canvas.toDataURL();
}

// Make logout function available globally
window.logout = logout;
window.checkAuth = checkAuth;
window.currentUser = () => currentUser;

// --- Shared Background Music Sync Across Tabs (Resume from last position) ---

(function() {
    const STORAGE_KEY = 'visionly-bg-music';
    const AUDIO_SRC = 'assets/relaxing-nature-sound.mp3';

    let audio = document.getElementById('background-sound');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'background-sound';
        audio.loop = true;
        audio.src = AUDIO_SRC;
        document.body.appendChild(audio);
    }

    function updateSoundIcons(paused) {
        document.querySelectorAll('#sound-icon').forEach(icon => {
            icon.src = paused ? 'assets/speaker-off-icon.png' : 'assets/speaker-on-icon.png';
            icon.alt = paused ? 'Sound Off' : 'Sound On';
        });
    }

    function syncStateToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            time: audio.currentTime,
            paused: audio.paused,
            ts: Date.now()
        }));
    }

    // On storage event, sync audio position and play/pause state
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY && e.newValue) {
            try {
                const data = JSON.parse(e.newValue);
                // Only update if the event is not from this tab
                if (Math.abs(audio.currentTime - data.time) > 1) {
                    audio.currentTime = data.time;
                }
                if (data.paused !== audio.paused) {
                    if (data.paused) {
                        audio.pause();
                    } else {
                        audio.play();
                    }
                }
                updateSoundIcons(data.paused);
            } catch {}
        }
    });

    // On play/pause/seek, sync to storage
    audio.addEventListener('play', syncStateToStorage);
    audio.addEventListener('pause', syncStateToStorage);
    audio.addEventListener('seeked', syncStateToStorage);
    audio.addEventListener('timeupdate', function() {
        // Only sync every ~2 seconds to avoid spam
        if (!audio._lastSync || Date.now() - audio._lastSync > 2000) {
            syncStateToStorage();
            audio._lastSync = Date.now();
        }
    });

    // On page load, resume from last known state (wait for audio to be ready)
    document.addEventListener('DOMContentLoaded', function() {
        function resumeAudioFromStorage() {
            try {
                const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
                if (data && typeof data.time === 'number') {
                    // Wait for audio to be ready before setting currentTime
                    if (audio.readyState >= 1) {
                        audio.currentTime = Math.min(data.time, audio.duration || data.time);
                        if (data.paused) {
                            audio.pause();
                        } else {
                            audio.play().catch(() => {});
                        }
                        updateSoundIcons(data.paused);
                    } else {
                        audio.addEventListener('loadedmetadata', function handler() {
                            audio.removeEventListener('loadedmetadata', handler);
                            audio.currentTime = Math.min(data.time, audio.duration || data.time);
                            if (data.paused) {
                                audio.pause();
                            } else {
                                audio.play().catch(() => {});
                            }
                            updateSoundIcons(data.paused);
                        });
                    }
                }
            } catch {}
        }
        resumeAudioFromStorage();
    });

    // Sound toggle button logic (works for all pages)
    document.addEventListener('DOMContentLoaded', function() {
        const toggleBtn = document.getElementById('toggle-sound');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (audio.paused) {
                    audio.play();
                } else {
                    audio.pause();
                }
                updateSoundIcons(audio.paused);
                syncStateToStorage();
            });
        }
    });

    // Try to play on first user interaction (for autoplay restrictions)
    document.addEventListener('DOMContentLoaded', function() {
        const enableAudio = () => {
            if (audio.paused) audio.play();
        };
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
    });
})();
