//src\lib\email.ts
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/api/emailVerification?token=${token}`;

  // Add log to verify email and token
  console.log("Sending verification email to:", email);
  console.log("Verification URL:", verificationUrl);

  // Create a transporter object using a simple SMTP server
  // const transporter = nodemailer.createTransport({
  //   host: process.env.MAILTRAP_HOST, // Mailtrap SMTP server
  //   port: parseInt(process.env.MAILTRAP_PORT || '2525'), // Mailtrap SMTP port
  //   secure: false,
  //   tls: {
  //     rejectUnauthorized: false, // Allows connecting without strict SSL verification
  //   },
  //   auth: {
  //     user: process.env.MAILTRAP_USER, // Mailtrap user (from Mailtrap dashboard)
  //     pass: process.env.MAILTRAP_PASS, // Mailtrap password (from Mailtrap dashboard)
  //   },
  // });


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your App Password (16-character)
  },
});

  // Set up the email options
  const mailOptions = {
    from: "synchindustries@gmail.com",  // Sender address
    to: email, // Receiver email address
    subject: "Africa Energy Indaba Prize giveaway",
    html: `
      <p>Thank you for registering for the SYNCH INDUSTRIES giveaway</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>In your inbox, you will find your unique code to see if you win.</p>
      <p>Follow the instructions to claim your prize.</p>
      <p>In case you close the tab, you may click the link again to retrieve your code.</p>
      <p>Thank you for participating in the giveaway.</p>
      <p>Best regards,</p>
      <p>SYNCH INDUSTRIES</p>
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




