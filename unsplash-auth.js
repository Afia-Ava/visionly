import UNSPLASH_CONFIG from './unsplash-config.js';

class UnsplashAuth {
    constructor() {
        this.accessToken = localStorage.getItem('unsplash_access_token');
        this.initializeAuth();
    }

    initializeAuth() {
        // Check if we're handling a callback with auth code
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            this.handleAuthCallback(code);
        }
    }

    isAuthenticated() {
        return !!this.accessToken;
    }

    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: UNSPLASH_CONFIG.ACCESS_KEY,
            redirect_uri: UNSPLASH_CONFIG.REDIRECT_URI,
            response_type: 'code',
            scope: UNSPLASH_CONFIG.SCOPES.join('+')
        });

        return `${UNSPLASH_CONFIG.AUTH_URL}?${params.toString()}`;
    }

    async handleAuthCallback(code) {
        try {
            const response = await fetch(UNSPLASH_CONFIG.TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: UNSPLASH_CONFIG.ACCESS_KEY,
                    client_secret: UNSPLASH_CONFIG.SECRET_KEY,
                    redirect_uri: UNSPLASH_CONFIG.REDIRECT_URI,
                    code: code,
                    grant_type: 'authorization_code'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            localStorage.setItem('unsplash_access_token', this.accessToken);

            // Redirect back to the main page
            window.location.href = '/';
        } catch (error) {
            console.error('Authentication error:', error);
            // Handle error appropriately
        }
    }

    getAuthHeaders() {
        if (!this.accessToken) {
            return {
                Authorization: `Client-ID ${UNSPLASH_CONFIG.ACCESS_KEY}`
            };
        }
        return {
            Authorization: `Bearer ${this.accessToken}`
        };
    }

    logout() {
        this.accessToken = null;
        localStorage.removeItem('unsplash_access_token');
    }
}

export default new UnsplashAuth(); 