import nodemailer from "nodemailer";

/**
 * Utility to send emails using nodemailer or log to console in development.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Subject line
 * @param {string} options.text - Plaintext body
 * @param {string} [options.html] - HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } = process.env;

    const isPlaceholder = 
      !EMAIL_USER || 
      !EMAIL_PASS || 
      EMAIL_USER.includes("your-email") || 
      EMAIL_PASS.includes("your-app-password");

    if (EMAIL_SERVICE && EMAIL_USER && EMAIL_PASS && !isPlaceholder) {
      const transporter = nodemailer.createTransport({
        service: EMAIL_SERVICE,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `Taskmate <${EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Email sent successfully to: ${to}`);
      return { success: true };
    } else {
      // Local development/testing mode fallback: Log the email to console
      console.log("\n-----------------------------------------");
      console.log("MOCK EMAIL SENT (Development Mode):");
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message:\n${text}`);
      console.log("-----------------------------------------\n");
      return { success: true, devMode: true };
    }
  } catch (error) {
    console.error(`[Email Service] Error sending email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};
