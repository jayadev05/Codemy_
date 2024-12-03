const jwt = require("jsonwebtoken");

function genarateRefreshToken(res, userId, userType) {
  try {
      const payload = { id: userId, type: userType };

      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: "14d",
      });

      
      res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      });

     

  } catch (error) {
      console.error("Complete Refresh Token Generation Error:", error);
      res.status(500).json({ message: "Refresh token generation failed", error: error.message });
  }
}

module.exports = genarateRefreshToken;
