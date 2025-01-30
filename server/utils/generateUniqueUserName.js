
const Tutor= require('../model/tutorModel');

const generateUniqueUsername = async (email) => {
  // Extract email prefix and remove any non-alphanumeric characters
  const prefix= email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const userId = `${prefix}${randomNumber}`;
    const exists = await Tutor.findOne({ userName: userId });
    return exists ? generateUniqueUsername(prefix) : userId;
};

module.exports=generateUniqueUsername;