const jwt = require("jsonwebtoken");

function genarateRefreshTocken(res, admin) {
  const refreshToken = jwt.sign({ admin }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "90d", 
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // You may want to set this to true in production
    sameSite: "strict",
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  });
}

module.exports = genarateRefreshTocken;
