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
                  <li>Log in to your account to access your tutor dashboard. Your old account has been deleted </li>
                  <li>Your new Password is <strong>${randomPassword} </strong> , Please change the password after Login!</li>
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
    const currentYear = new Date().getFullYear();
  
    return {
      subject: "Reset Your Codemy Password",
      htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Codemy Password</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #fa7516;">
              <img src="https://yourwebsite.com/logo.png" alt="Codemy Logo" style="max-width: 150px; height: auto;">
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h1 style="color: #fa7516; margin-bottom: 20px; font-size: 24px;">Reset Your Password</h1>
              <p style="margin-bottom: 20px;">We received a request to reset the password for your Codemy account. If you didn't make this request, you can safely ignore this email.</p>
              <p style="margin-bottom: 30px;">To reset your password, click the button below:</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${resetURL}" style="display: inline-block; background-color: #fa7516; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold; text-transform: uppercase; font-size: 16px; transition: background-color 0.3s ease;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; font-size: 14px; color: #1a73e8; margin-bottom: 30px;">${resetURL}</p>
              <p style="font-size: 14px; color: #666; margin-bottom: 0;">This password reset link will expire in 24 hours for security reasons.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">© ${currentYear} Codemy. All rights reserved.</p>
              <p style="margin: 10px 0 0;">If you have any questions, please contact our support team at <a href="mailto:support@codemy.com" style="color: #fa7516; text-decoration: none;">support@codemy.com</a></p>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `
    };
  };

  
  
 
  
  
  
module.exports = { mailSender,passwordResetTemplate ,otpEmailTemplate,tutorApprovedEmailTemplate };
