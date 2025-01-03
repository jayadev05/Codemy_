const jwt = require("jsonwebtoken");
const Blacklist = require('../model/blacklistModel.js')

const verifyUser = async (req, res, next) => {
    const accessToken = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    const refreshToken = req.headers['x-refresh-token'] || req.cookies.refreshToken;

    if (accessToken) {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return handleRefreshToken(refreshToken, req, res, next);
                }
                return res.status(401).json({ message: "Unauthorized: Invalid access token"});
            }

            // Check if user is blacklisted
            const isBlacklisted = await Blacklist.findOne({ userId: decoded.id });
            if (isBlacklisted) {
                return res.status(403).json({ message: "Session invalidated. Please log in again." });
            }

            req.user = decoded;

            next();
        });
    } else {
        return handleRefreshToken(refreshToken, req, res, next);
    }
};


const handleRefreshToken = async (refreshToken, req, res, next) => {
    if (!refreshToken) {
        return res.status(401).json({ message: "No access token or refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Generate a new access token
        const newAccessToken = jwt.sign(
            { id: decoded.id, type: decoded.type }, 
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10m" }
        );

        
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);

        req.user = decoded; 
        next();
    } catch (err) {
        console.error("Refresh token verification failed:", err);
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};

module.exports = verifyUser;
