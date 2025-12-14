import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Check if email credentials are set
if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_APP_PASSWORD) {
  console.warn("⚠️  Email credentials not set. Emails will not be sent.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL || "",
    pass: process.env.GOOGLE_APP_PASSWORD || "",
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
      from: `Ajani AI <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error.message);
  }
};

export default sendEmail;

// from: process.env.EMAIL_USER || process.env.GOOGLE_EMAIL,
