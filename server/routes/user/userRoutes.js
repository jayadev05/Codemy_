const express = require("express");
const userRoute = express.Router();
const {
  googleLogin,
  signUp,
  login,
  logoutUser,
  updateUser,
  sendOtp,
  changePassword,
  toggleNotifications,
  deleteNotification,
  getCoupons,
} = require("../../controller/userController");
const { verifyOtp } = require("../../middleware/verifyOtp");
const verifyUser = require("../../middleware/authMiddleware");
const { getWishlist, addToWishlist, removeFromWishlist } = require("../../controller/courseController");
const { viewCart, addToCart, removeFromCart } = require("../../controller/cartController");

userRoute.get("/coupons/:userId",verifyUser, getCoupons);
userRoute.get('/wishlist',verifyUser,getWishlist);
userRoute.get('/cart',verifyUser,viewCart);

userRoute.post("/otp/send", sendOtp);
userRoute.post("/users", verifyOtp, signUp);
userRoute.post('/wishlist',addToWishlist);
userRoute.post('/cart',addToCart);
userRoute.post("/login", login);
userRoute.post("/login/google", googleLogin);
userRoute.post("/auth/logout", logoutUser);

userRoute.put("/password", verifyUser, changePassword);
userRoute.put("/profile", verifyUser, updateUser);
userRoute.put("/notifications/toggle", toggleNotifications);

userRoute.patch("/users/:userId/notifications/clear", deleteNotification);

userRoute.delete('/wishlist/remove',verifyUser,removeFromWishlist);
userRoute.delete('/cart/remove',verifyUser,removeFromCart);

module.exports = userRoute;
