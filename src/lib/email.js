import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'false' ? false : true,
  auth: {
    user: process.env.SMTP_USER || 'verified@vegasone.games',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[SMTP SIMULATED] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'verified@vegasone.games';
    const info = await transporter.sendMail({
      from: `"Vegas One" <${fromAddress}>`,
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

export function getOtpEmailTemplate(otp, purpose = 'Account Verification') {
  return `
    <div style="background-color: #0E0816; color: #FFFFFF; padding: 40px 24px; font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: auto; border-radius: 16px; border: 1px solid rgba(255, 122, 89, 0.35); box-shadow: 0 20px 50px rgba(0,0,0,0.85);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FF7A59; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">VEGAS ONE</h1>
        <p style="color: #F5B461; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Luxury Sweepstakes Lounge</p>
      </div>
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; text-align: center;">
        <h2 style="font-size: 17px; margin: 0 0 10px 0; color: #FFFFFF;">${purpose} Code</h2>
        <p style="font-size: 13px; color: #9A91A8; margin: 0 0 22px 0; line-height: 1.5;">
          Use the 6-digit one-time security code below to complete your action. This code will expire in <strong>10 minutes</strong>.
        </p>
        <div style="display: inline-block; background: linear-gradient(135deg, rgba(255, 122, 89, 0.15), rgba(245, 180, 97, 0.15)); border: 2px dashed #FF7A59; padding: 14px 28px; border-radius: 12px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #FF7A59; font-family: monospace;">
          ${otp}
        </div>
      </div>
      <p style="margin-top: 24px; font-size: 11px; color: #64748B; text-align: center; line-height: 1.5;">
        If you did not request this security code, please ignore this email or reach out to 24/7 VIP Live Support.
      </p>
    </div>
  `;
}
