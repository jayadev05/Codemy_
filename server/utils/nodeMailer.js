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
  
module.exports = { mailSender, otpEmailTemplate };
