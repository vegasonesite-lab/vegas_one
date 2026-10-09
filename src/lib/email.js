import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER || 'support@vegasone.games',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[SMTP SIMULATED] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Vegas One" <${process.env.SMTP_FROM || 'support@vegasone.games'}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

export function getWelcomeEmailTemplate(username) {
  return `
    <div style="background-color: #080914; color: #ffffff; padding: 40px; font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 12px; border: 1px solid #7c3aed;">
      <h1 style="color: #f59e0b; margin-bottom: 8px;">VEGAS ONE</h1>
      <p style="color: #a855f7; font-size: 14px; margin-top: 0; letter-spacing: 2px;">LUXURY SWEEPSTAKES CASINO</p>
      <hr style="border-color: #3730a3; margin: 24px 0;" />
      <h2 style="font-size: 22px;">Welcome to the VIP High Rollers, ${username}!</h2>
      <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6;">
        Your Vegas One account is ready. You have received your <strong>Welcome Sweep Coins &amp; Gold Coins</strong>.
      </p>
      <div style="background-color: #1e1b4b; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #f59e0b;">
        <p style="margin: 0; font-size: 18px; color: #fde047; font-weight: bold;">Exclusive 140% First Deposit Match</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #e2e8f0;">Deposit today to get extra free SC for real cash redemptions.</p>
      </div>
      <a href="https://vegasone.games" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 16px;">
        PLAY NOW &amp; WIN
      </a>
      <p style="margin-top: 36px; font-size: 12px; color: #64748b;">
        No purchase necessary. Void where prohibited. Must be 18+ and a US resident.
      </p>
    </div>
  `;
}
