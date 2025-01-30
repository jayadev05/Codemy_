const crypto = require('crypto');

const generateDefaultPassword = (email) => {

  // Extract some unique elements from the email to personalize the password
  const emailPrefix = email.split('@')[0].slice(0, 3); // First 3 characters of email prefix
  const currentYear = new Date().getFullYear();

  // Generate a secure random string
  const randomString = crypto.randomBytes(4).toString('hex'); 

  // Combine components to form the password
  return `Codemy${emailPrefix}${currentYear}${randomString}`;
};

module.exports = generateDefaultPassword;
