const jwt = require("jsonwebtoken");

function genarateAccesTocken(res, admin) {
  const token = jwt.sign({ admin }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1 * 60 * 1000,
  });
  console.log("cookie created");
  
}



module.exports = genarateAccesTocken;
