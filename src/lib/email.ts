//src\lib\email.ts
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/api/emailVerification?token=${token}`;

  // Add log to verify email and token
  console.log("Sending verification email to:", email);
  console.log("Verification URL:", verificationUrl);

  // Create a transporter object using a simple SMTP server
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST, // Mailtrap SMTP server
    port: parseInt(process.env.MAILTRAP_PORT || '2525'), // Mailtrap SMTP port
    secure: false,
    tls: {
      rejectUnauthorized: false, // Allows connecting without strict SSL verification
    },
    auth: {
      user: process.env.MAILTRAP_USER, // Mailtrap user (from Mailtrap dashboard)
      pass: process.env.MAILTRAP_PASS, // Mailtrap password (from Mailtrap dashboard)
    },
  });

  // Set up the email options
  const mailOptions = {
    from: "trickytechnique@gmail.com",  // Sender address
    to: email, // Receiver email address
    subject: "Please Verify Your Email Address",
    html: `
      <p>Hi,</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email.");
  }
};




