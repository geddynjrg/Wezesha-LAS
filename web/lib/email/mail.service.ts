/**
 * Lightweight email helper for Majuu portal.
 * Uses SMTP when MAIL_HOST / SMTP_HOST is configured; otherwise logs and returns.
 * No PII beyond the provided recipient address is written to logs.
 * Never log OTP codes or message bodies that may contain them.
 */

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

type SendEmailResult = { success: boolean; error?: string; skipped?: boolean };

function trim(value: string | undefined): string {
  return value?.trim() ?? '';
}

function redactBody(text: string): string {
  return text.replace(/\b\d{4,8}\b/g, '******');
}

export async function sendPlainEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const host = trim(process.env.MAIL_HOST) || trim(process.env.SMTP_HOST);
  const port = Number(
    trim(process.env.MAIL_PORT) || trim(process.env.SMTP_PORT) || '587',
  );
  const user = trim(process.env.MAIL_USERNAME) || trim(process.env.SMTP_USER);
  const pass =
    trim(process.env.MAIL_PASSWORD) || trim(process.env.SMTP_PASSWORD);
  const from =
    trim(process.env.MAIL_FROM_ADDRESS) ||
    trim(process.env.SMTP_FROM) ||
    'noreply@uwezo.go.ke';
  const fromName =
    trim(process.env.MAIL_FROM_NAME) || 'Uwezo Fund Wezesha Majuu';

  if (!host) {
    console.info('[Mail] SMTP not configured — email skipped');
    return { success: false, skipped: true, error: 'SMTP not configured' };
  }

  try {
    // Dynamic import keeps the portal build working without a hard nodemailer dependency.
    const nodemailer = await import('nodemailer').catch(() => null);
    if (!nodemailer) {
      console.warn('[Mail] nodemailer package not installed — email skipped');
      return {
        success: false,
        skipped: true,
        error: 'nodemailer not installed',
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from: `"${fromName}" <${from}>`,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    console.info('[Mail] sent', {
      toDomain: input.to.includes('@') ? input.to.split('@')[1] : 'unknown',
      subject: input.subject,
      // body redacted — may contain OTP
      bodyPreview: redactBody(input.text).slice(0, 40),
    });

    return { success: true };
  } catch (error) {
    console.error(
      '[Mail] send failed:',
      error instanceof Error ? error.message : 'unknown',
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
