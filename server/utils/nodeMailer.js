const nodemailer = require("nodemailer");

// Function to send an email
const mailSender = async (email, subject, htmlContent) => {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      let info = await transporter.sendMail({
        from: `"Codemy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: `Your OTP Code is: ${subject.match(/\d+/)?.[0] || ''}`, // Extract OTP from subject for plain text
        html: htmlContent,
      });
  
      console.log("Email sent successfully:", info);
      return info;
    } catch (err) {
      console.error("Error sending email:", err);
      throw new Error("Failed to send email");
    }
  };
  
// Function to generate the email template
const otpEmailTemplate = (otp) => {
    console.log("Generating email template with OTP:", otp);
    return {
      subject: `Your OTP Code - ${otp} - Codemy`,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your OTP Code</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="background: #fa7516; color: #ffffff; text-align: center; padding: 20px;">
                <h1 style="margin: 0; font-size: 24px;">Your OTP Code - Codemy</h1>
              </div>
              <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for authentication is:</p>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #fa7516;">${otp}</span>
                </div>
                <p style="font-size: 16px; color: #333;">This OTP is valid for a limited time. Please do not share this code with anyone.</p>
                <p style="font-size: 14px; color: #666;">If you didn't request this OTP, please ignore this email or contact our support team.</p>
              </div>
              <div style="background: #f0f0f0; text-align: center; padding: 10px; font-size: 12px; color: #666;">
                <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
                <p style="margin: 0;">© 2024 Codemy. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };
  };

const tutorApprovedEmailTemplate = (tutorName,randomPassword) => {

  
    
    return {
      subject: `Welcome to Codemy - You're Now an Approved Tutor!`,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Codemy</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #eb5a0c; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="background: #eb5a0c; color: #ffffff; text-align: center; padding: 20px;">
                <h1 style="margin: 0; font-size: 24px;">Welcome to Codemy!</h1>
              </div>
              <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">Dear <strong>${tutorName}</strong>,</p>
                <p style="font-size: 16px; color: #333;">
                  Congratulations! Your application to become a tutor on Codemy has been approved. 
                  We are thrilled to have you join our platform and can't wait to see the amazing courses you'll create.
                </p>
                <p style="font-size: 16px; color: #333;">Here are some next steps to get started:</p>
                <ul style="font-size: 16px; color: #333; padding-left: 20px;">
                  <li>Log in to your account to access your tutor dashboard.</li>
                  <li>Your Password is <strong>${randomPassword}</strong>, Please change the password after Login!</li>
                  <li>Start creating and publishing your courses.</li>
                  <li>Engage with students and build your community.</li>
                </ul>
                <p style="font-size: 16px; color: #333;">
                  Need help? Feel free to reach out to our support team for assistance.
                </p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="http://localhost:5173/login" style="display: inline-block; padding: 10px 20px; background: #4caf50; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px;">
                    Log In Now
                  </a>
                </div>
                <p style="font-size: 14px; color: #666;">Thank you for being part of Codemy. We look forward to supporting your journey as a tutor!</p>
              </div>
              <div style="background: #f0f0f0; text-align: center; padding: 10px; font-size: 12px; color: #666;">
                <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
                <p style="margin: 0;">© 2024 Codemy. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
  };
  
  const passwordResetTemplate = (resetURL) => {
    return {
      subject: "Password Reset Request",
      htmlContent: `
        <h1>Password Reset Request</h1>
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };
  };

  
module.exports = { mailSender,passwordResetTemplate ,otpEmailTemplate,tutorApprovedEmailTemplate };
