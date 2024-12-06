const Tutor=require("../model/tutorModel");
const bcrypt = require ("bcryptjs")


const changePassword = async (req, res) => {
    const { currentPassword, newPassword, email } = req.body.passwordChange;
    console.log(req.body)
   console.log(email)
    try {
      // Find user by email
      const tutor = await Tutor.findOne({email});
      console.log(tutor);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
  
      // Check if the current password matches the stored hashed password
      const isPasswordMatch = await bcrypt.compare(currentPassword, tutor.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Current password is Incorrect" });
      }

      if(currentPassword===newPassword){
        return res.status(409).json({message:"New Password cannot be same as Current Password"})
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the password in the database
      tutor.password = hashedNewPassword;
      await tutor.save();
  
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  const updateTutor = async (req, res) => {
    try {
       
        const { email, userName, phone, profileImg, bio, jobTitle, firstName, lastName } = req.body;
        const fullName = `${firstName} ${lastName}`;  // Concatenate first and last name
       

        const tutor = await Tutor.findOne({ email });
        if (!tutor) {
            console.log('Tutor not found:');
            return res.status(404).json({ message: "Tutor not found" });
        }

        // Construct the updated data object conditionally based on what was provided
        const updatedData = { 
            ...(fullName && {  fullName }),  
            ...(email && { email }), 
            ...(userName && { userName }),  
            ...(phone && { phone }),
            ...(profileImg && { profileImg }),
            ...(bio && { bio }),
            ...(jobTitle && { jobTitle })
        };


        // Update the tutor document and return the updated object
        const updatedTutor = await Tutor.findByIdAndUpdate(tutor._id, updatedData, { new: true });
    
        res.status(200).json({ message: "Update successful", updatedTutor });
    } catch (error) {
        console.error("Error in updateUser:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

  const logoutTutor = (req, res) => {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken')
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports={logoutTutor,changePassword,updateTutor};