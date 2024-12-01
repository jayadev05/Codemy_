const jwt = require("jsonwebtoken");

function genarateRefreshToken(res, admin) {
  const refreshToken = jwt.sign({ admin }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "90d", 
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, //  set this to true in production
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

module.exports = genarateRefreshToken;
