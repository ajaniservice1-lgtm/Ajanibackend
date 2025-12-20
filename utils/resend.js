import { Resend } from "resend";
import dotenv from "dotenv";

// Load .env.local only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
}

// Check if API key is set
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY not set. Emails will not be sent.");
}

// Resend requires a verified domain or their default domain
// Use RESEND_FROM_EMAIL (e.g., "onboarding@resend.dev" or "noreply@yourdomain.com")
// If not set, will use a default Resend format
const RESEND_FROM_EMAIL = process.env.EMAIL_USER || "noreply@ajani.ai";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailResend = async ({ to, subject, html }) => {
  // Skip sending if API key is missing
  if (!process.env.RESEND_API_KEY) {
    console.log("⚠️  Email not sent - missing RESEND_API_KEY");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Ajani AI <${RESEND_FROM_EMAIL}>`,
      to: [to],
      subject: subject,
      html: html,
      // replyTo: "support@ajani.ai",
    });

    if (error) {
      console.log("Email sending failed:", error);
    }

    return data;
  } catch (error) {
    console.log("Email sending failed:", error);
  }
};

export default sendEmailResend;
