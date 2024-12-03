const jwt = require("jsonwebtoken");

function genarateAccessToken(res, userId, userType) {
  try {
      const payload = { id: userId, type: userType };

      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "10m",
      });

      console.log(token )
      
      res.cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 10 * 60 * 1000, // 10 minutes
      });

     

  } catch (error) {
      console.error("Complete Access Token Generation Error:", error);
      res.status(500).json({ message: "Token generation failed", error: error.message });
  }
}


module.exports = genarateAccessToken;
