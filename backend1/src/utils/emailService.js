const nodemailer = require("nodemailer");

// Create transporter for Brevo SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER || "9b726c001@smtp-brevo.com",
    pass:
      process.env.BREVO_SMTP_KEY ||
      "xsmtpsib-2348a8514da12117aeb643ffbf39ee7f41df00135f5bf77e81d32c8eb5f5c7f9-sPQru53wdAXVNBBw",
  },
});

// Send welcome/invitation email to new user
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const senderEmail = "chanduvara26@gmail.com";

    const mailOptions = {
      from: `Barter King <${senderEmail}>`,
      to: userEmail,
      subject: "Welcome to Barter King!",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Barter King!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for joining Barter King. We're excited to have you on board!</p>
            <p>Your account has been successfully created. You can now start trading and bartering with other users.</p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <p>Happy Trading!</p>
            <p>Best regards,<br>The Barter King Team</p>
          </div>
        </div>
      </body>
      </html>
      `,
      text: `
      Welcome to Barter King!
      
      Hello ${userName}!
      
      Thank you for joining Barter King. We're excited to have you on board!
      
      Your account has been successfully created. You can now start trading and bartering with other users.
      
      If you have any questions or need assistance, feel free to reach out to our support team.
      
      Happy Trading!
      
      Best regards,
      The Barter King Team
      `,
    };

    // Send email via Brevo SMTP
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent via Brevo SMTP:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending welcome email via Brevo:", error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
};
