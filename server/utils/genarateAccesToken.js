const jwt = require("jsonwebtoken");

function genarateAccessToken(res, payload) {
  try {
      
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "10m",
      });

      console.log("access token:",token )

      
      res.cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 10 * 60 * 1000, // 10 minutes
      });

      

      return token;

     

  } catch (error) {
      console.error("Complete Access Token Generation Error:", error);
      res.status(500).json({ message: "Token generation failed", error: error.message });
  }
}


module.exports = genarateAccessToken;
