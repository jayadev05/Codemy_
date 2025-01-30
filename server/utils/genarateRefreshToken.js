const jwt = require("jsonwebtoken");

function genarateRefreshToken(res, payload) {
  try {
   
      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: "14d",
      });

    console.log("refresh token:",refreshToken)

    
      
      res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      });


     return refreshToken;

  } catch (error) {
      console.error("Complete Refresh Token Generation Error:", error);
      res.status(500).json({ message: "Refresh token generation failed", error: error.message });
  }
}

module.exports = genarateRefreshToken;
