const jwt = require('jsonwebtoken');
const Blacklist = require('../model/blacklistModel');

const verifyUser = async (req, res, next) => {

  const accessToken = req.headers.authorization?.split(' ')[1] || req.cookies.accessToken;
  const refreshToken = req.headers['x-refresh-token'] || req.cookies.refreshToken;

  console.log("middleware active");

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: 'No tokens provided' });
  }

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        //check if user is blacklisted
        const isBlacklisted=await Blacklist.findOne({userId:decoded.id});

        console.log("isblacklisted",isBlacklisted)

        if(isBlacklisted) return res.status(403).json({message:"User is invalidated. Please try to login again or check mail if you have requested to be a tutor!"});


      req.user = decoded;

      return next();
    } catch (err) {
      if (err.name !== 'TokenExpiredError' || !refreshToken) {
        return res.status(401).json({ message: 'Invalid access token' });
      }
    }
  }

  // Handle refresh token
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, type: decoded.type },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10m' }
    );

    // Send new access token in response headers
    res.set('Authorization', `Bearer ${newAccessToken}`);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Refresh token verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

module.exports = verifyUser;