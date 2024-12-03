const jwt = require("jsonwebtoken");


//   Middleware to verify the user and handle access token refresh if needed.

const verifyUser = async (req, res, next) => {
  
 
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    console.log("Received Tokens:", {
        accessToken: accessToken ,
        refreshToken: refreshToken 
    });

    if (accessToken) {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return handleRefreshToken(refreshToken, req, res, next);
                }
                return res.status(401).json({ message: "User not authorized, invalid access token" });
            }
            req.userDetails = decoded; 
            next();
        });
    } else {
        return handleRefreshToken(refreshToken, req, res, next);
    }
};


//   Handles the generation of a new access token using the refresh token.

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
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "10m" }
        );

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: "strict",
            maxAge: 10 * 60 * 1000, 
        });

        req.userDetails = decoded; 
        next();
    } catch (err) {
        console.error("Refresh token verification failed:", err);
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};

module.exports = verifyUser;
