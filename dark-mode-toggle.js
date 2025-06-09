class DarkModeManager {
    constructor() {
        this.init();
    }

    init() {
        // Load saved preference
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        // Set up toggle functionality
        this.setupToggle();
        
        // Listen for storage changes (sync across tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'darkMode') {
                const isDarkMode = e.newValue === 'true';
                this.setDarkMode(isDarkMode);
            }
        });
    }

    setupToggle() {
        // Find dark mode toggle on current page
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        
        if (darkModeToggle) {
            // Set initial state
            const isDarkMode = document.body.classList.contains('dark-mode');
            if (isDarkMode) {
                darkModeToggle.classList.add('active');
            }

            // Add click handler
            darkModeToggle.addEventListener('click', () => {
                this.toggle();
            });
        }
    }

    toggle() {
        const isDarkMode = !document.body.classList.contains('dark-mode');
        this.setDarkMode(isDarkMode);
        
        // Save preference
        localStorage.setItem('darkMode', isDarkMode);
        
        // Show notification if function exists
        if (typeof showNotification === 'function') {
            const message = isDarkMode ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️';
            showNotification(message);
        }
    }

    setDarkMode(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update toggle state if it exists
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) {
            if (isDarkMode) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    }

    isDarkMode() {
        return document.body.classList.contains('dark-mode');
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.darkModeManager = new DarkModeManager();
});

// Notification function for pages that don't have it
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #1f0f35;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };
}
