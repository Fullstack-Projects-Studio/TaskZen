import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(email: string, code: string) {
  await transporter.sendMail({
    from: `TaskZen <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your verification code: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1; text-align: center;">TaskZen Verification</h2>
        <p style="text-align: center; color: #555;">Enter this code to verify your email:</p>
        <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${code}</span>
        </div>
        <p style="text-align: center; color: #888; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    `,
  });
}
