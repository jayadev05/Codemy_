const { oauth2client } = require('../config/googleConfig'); // Import the OAuth client

/**
 * Handles Google OAuth2 callback and token exchange
 */
exports.googleAuthCallback = async (req, res) => {
    const code = req.query.code; // Retrieve the authorization code from query parameters

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'Authorization code is missing',
        });
    }

    try {
        // Exchange the authorization code for tokens
        const { tokens } = await oauth2client.getToken(code);
        oauth2client.setCredentials(tokens);

        // You can return the tokens or use them for further API calls
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            tokens,
        });
    } catch (error) {
        console.error('Error during token exchange:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message,
        });
    }
};
