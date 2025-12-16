import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load .env.local only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
}

// Check if email credentials are set
if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_APP_PASSWORD) {
  console.warn("⚠️  Email credentials not set. Emails will not be sent.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
  },
});

const sendEmail = async ({ to, subject, html }) => {
  // Skip sending if credentials are missing
  if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_APP_PASSWORD) {
    console.log("⚠️  Email not sent - missing credentials");
    return;
  }

  console.log("Sending email to", to);

  try {
    await transporter.sendMail({
      from: `Ajani AI <${process.env.GOOGLE_EMAIL || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error.message, error);
    // Don't throw - email failures shouldn't break the app
  }
};

export default sendEmail;

// from: process.env.EMAIL_USER || process.env.GOOGLE_EMAIL,

const vendorRegistrationEmailTemplate = async ({ to, subject, html }) => {
  return `
    <p>Hi ${firstName || "there"},</p>
    <p>Congratulations! Your vendor account has been successfully created.</p>
    <p>Please wait for your account to be approved by the admin as it currently under review. This may take up to 24 hours.</p>
    <p>Once approved, you will receive an email with full access to your vendor account.</p>
    <a href="${process.env.FRONTEND_URL}/vendor/login" style="text-decoration: none; padding: 10px; border-radius: 5px; background-color: #007bff; display: inline-block; margin-top: 10px; color: white;">Login to your vendor account</a>
    <p>Thank you for joining us!</p>
    <p>Best regards,</p>
    <p>Ajani Team</p>
  `;
};
