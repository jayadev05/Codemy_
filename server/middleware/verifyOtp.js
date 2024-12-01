require("dotenv").config();
const otpSchema =require('../model/otpStore')

const verifyOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    console.log('Received OTP request:', { otp, email }); 

    const otpData = await otpSchema.findOne({ email });
    console.log('OTP data from DB:', otpData); 

    if (!otpData) {
      return res
        .status(404)
        .json({ success: false, message: "OTP not found." });
    }

    if (otp === otpData.otp) {

      // Delete OTP after successful verification
      await otpSchema.deleteOne({ email });
      next(); 
      
    } else {
      console.log("Invalid OTP. Received:", otp, "Expected:", otpData.otp); 
      return res.status(401).json({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { verifyOtp };