const UNSPLASH_CONFIG = {
    ACCESS_KEY: 'p29nv_Gk3XXhdiyPqaQFBBfmOfzKummKPpxsR73yq6Y',
    SECRET_KEY: '3NUigVchRZLp7HAHOfScUVru498tWlG-bgvHSdZa0Ec',
    REDIRECT_URI: window.location.origin + '/auth/callback', // This will automatically use your site's domain
    AUTH_URL: 'https://unsplash.com/oauth/authorize',
    TOKEN_URL: 'https://unsplash.com/oauth/token',
    SCOPES: ['public', 'write_likes', 'read_photos', 'write_photos'] // Add or remove scopes as needed
};

export default UNSPLASH_CONFIG;