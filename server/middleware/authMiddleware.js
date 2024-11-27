const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return handleRefreshToken(refreshToken, req, res, next);
                }
                return res.status(401).json({ message: "User not authorized, token verification failed" });
            }
            req.admin = decoded.admin;
            next();
        });
    } else {
        return handleRefreshToken(refreshToken, req, res, next);
    }
};

const handleRefreshToken = async (refreshToken, req, res, next) => {
    if (refreshToken) {
        try {
            const decodeRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const newAccessToken = jwt.sign(
                { admin: decodeRefresh.admin },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "2m" }
            );

            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 1000,
            });
            next();
        } catch (err) {
            res.status(403).json({ message: "Refresh token is invalid or expired" });
        }
    } else {
        res.status(401).json({ message: "No access token and no refresh token provided" });
    }
};

module.exports = verifyUser;
