 const generateDefaultPassword = (email) => {
  // Extract some unique elements from the email to create a somewhat personalized default password
  const emailPrefix = email.split('@')[0];
  const currentYear = new Date().getFullYear();
  
  // Use a combination of email prefix, current year, and a fixed suffix
  // This creates a somewhat predictable but not entirely fixed password
  return `Codemy${emailPrefix.slice(0,3)}${currentYear}!`;
};

module.exports=generateDefaultPassword;
