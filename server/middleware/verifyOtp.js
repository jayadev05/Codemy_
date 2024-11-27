require("dotenv").config();
const otpSchema =require('../model/otpStore')

const verifyOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    console.log('Received OTP request:', { otp, email }); // Add this

    const otpData = await otpSchema.findOne({ email });
    console.log('OTP data from DB:', otpData); // Add this

    if (!otpData) {
      return res
        .status(404)
        .json({ success: false, message: "OTP not found." });
    }

    if (otp === otpData.otp) {
      next(); 
    } else {
      console.log("Invalid OTP. Received:", otp, "Expected:", otpData.otp); // Add this
      return res.status(401).json({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { verifyOtp };