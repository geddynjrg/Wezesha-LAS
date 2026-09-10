import {
  generateRequestId,
  hashOtpCode,
} from '@/lib/auth/jwt';
import { issueTokensForUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { normalizeKenyanPhoneForApi } from '@/lib/phone/kenyan-phone';
import {
  generateOtpCode,
  sendSms,
} from '@/lib/sms/sms.service';
import { sendPlainEmail } from '@/lib/email/mail.service';
import { IdentifierType } from '@/generated/prisma';

const OTP_EXPIRY_SECONDS = 300;
const MAX_OTP_ATTEMPTS = 3;
const MAX_REQUESTS_PER_HOUR = 5;

export type OtpDeliveryChannel = 'sms' | 'email' | 'app';

export type RequestLoginOtpResult = {
  request_id: string;
  channel: OtpDeliveryChannel;
  message: string;
  maskedEmail?: string;
};

export class OtpDeliveryError extends Error {
  needEmail: boolean;

  constructor(message: string, needEmail = false) {
    super(message);
    this.name = 'OtpDeliveryError';
    this.needEmail = needEmail;
  }
}

function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return '***';
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.slice(0, Math.min(1, local.length));
  return `${visible}***@${domain}`;
}

function normalizeEmail(raw: string | undefined): string | null {
  const email = String(raw || '')
    .trim()
    .toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  return email;
}

async function findEmailForPhone(phoneNumber: string): Promise<string | null> {
  const digits = phoneNumber.replace(/\D/g, '');
  const variants = Array.from(
    new Set(
      [
        phoneNumber,
        phoneNumber.replace(/^\+/, ''),
        digits.startsWith('254') ? `+${digits}` : null,
        digits.startsWith('254') ? digits : null,
        digits.startsWith('254') && digits.length === 12
          ? `0${digits.slice(3)}`
          : null,
      ].filter(Boolean) as string[],
    ),
  );

  const user = await prisma.user.findFirst({
    where: {
      OR: variants.map((phoneNumber) => ({ phoneNumber })),
    },
    select: { email: true },
  });

  return normalizeEmail(user?.email || undefined);
}

/**
 * Request a login OTP. Tries Ebis SMS first; on SMS failure falls back to email.
 * WhatsApp OTP failover is intentionally not used yet (Meta Business API still
 * test-only for this tenant) — keep email as the production failover channel.
 */
export async function requestLoginOtp(
  phone: string,
  options?: { email?: string },
): Promise<RequestLoginOtpResult> {
  const phoneNumber = normalizeKenyanPhoneForApi(phone);
  const providedEmail = normalizeEmail(options?.email);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.otpRequest.count({
    where: {
      phoneNumber,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    throw new OtpDeliveryError(
      'Too many OTP requests. Please try again later.',
    );
  }

  const otpCode = generateOtpCode();
  const requestId = generateRequestId();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

  await prisma.otpRequest.create({
    data: {
      requestId,
      phoneNumber,
      otpHash: hashOtpCode(otpCode),
      expiresAt,
    },
  });

  const smsResult = await sendSms(
    phoneNumber,
    `Your login code is: ${otpCode}`,
  );

  const otpMessage = `Your login code is: ${otpCode}`;

  async function tryDeliverToApp(emailHint?: string | null) {
    if (process.env.APP_PUSH_ENABLED === 'false') {
      return { delivered: false, devices: 0 };
    }
    try {
      const { notifyAppUser } = await import('@/lib/push/app-push');
      return await notifyAppUser({
        title: 'Uwezo Fund login code',
        body: otpMessage,
        kind: 'otp',
        phone: phoneNumber,
        email: emailHint || providedEmail || undefined,
        meta: { requestId },
      });
    } catch (e) {
      console.warn('[OTP] app push notify failed', e);
      return { delivered: false, devices: 0 };
    }
  }

  if (smsResult.success) {
    // Bonus: also mirror to app when a device is linked.
    void tryDeliverToApp(providedEmail);
    return {
      request_id: requestId,
      channel: 'sms' as const,
      message:
        'OTP sent by SMS (and to the Uwezo Fund app if you are signed in). Enter the 6-digit code here. First-time numbers create an account automatically.',
    };
  }

  console.warn(
    '[OTP] SMS delivery failed; attempting email failover (code not logged)',
  );

  const email = providedEmail || (await findEmailForPhone(phoneNumber));
  if (email) {
    const mailResult = await sendPlainEmail({
      to: email,
      subject: 'Your Uwezo Fund login code',
      text:
        `Your login code is: ${otpCode}\n\n` +
        `It expires in 5 minutes.\n` +
        `If you did not request this code, you can ignore this email.`,
    });

    if (mailResult.success) {
      void tryDeliverToApp(email);
      const masked = maskEmail(email);
      return {
        request_id: requestId,
        channel: 'email' as const,
        maskedEmail: masked,
        message: `SMS unavailable — we sent a code to your email (${masked}). Enter it here.`,
      };
    }

    console.warn('[OTP] Email delivery failed; attempting Uwezo Fund app delivery');
    const appResult = await tryDeliverToApp(email);
    if (appResult.delivered) {
      return {
        request_id: requestId,
        channel: 'app' as const,
        message:
          'SMS and email were unavailable — we sent your login code to the Uwezo Fund app. Open the app (check the floating notification / Notifications) and enter the 6-digit code here.',
      };
    }

    await prisma.otpRequest.delete({ where: { requestId } }).catch(() => undefined);
    throw new OtpDeliveryError(
      'SMS, email, and Uwezo Fund app delivery all failed. Try eCitizen or email/password login.',
    );
  }

  // No email on file — try app before asking the user for an email.
  const appOnly = await tryDeliverToApp(null);
  if (appOnly.delivered) {
    return {
      request_id: requestId,
      channel: 'app' as const,
      message:
        'SMS unavailable — we sent your login code to the Uwezo Fund app. Open the app (check the floating notification / Notifications) and enter the 6-digit code here.',
    };
  }

  await prisma.otpRequest.delete({ where: { requestId } }).catch(() => undefined);
  throw new OtpDeliveryError(
    'SMS unavailable. Enter the email linked to this phone to receive a code, open the Uwezo Fund app if signed in, or use eCitizen / password login.',
    true,
  );
}

export async function verifyLoginOtp(requestId: string, otpCode: string) {
  const otpRequest = await prisma.otpRequest.findUnique({
    where: { requestId },
  });

  if (!otpRequest) {
    throw new Error('Invalid or expired OTP code');
  }

  if (otpRequest.expiresAt < new Date()) {
    throw new Error('Invalid or expired OTP code');
  }

  if (otpRequest.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error('Too many verification attempts. Please try again later.');
  }

  if (otpRequest.otpHash !== hashOtpCode(otpCode)) {
    await prisma.otpRequest.update({
      where: { id: otpRequest.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error('Invalid or expired OTP code');
  }

  const user = await prisma.user.upsert({
    where: { phoneNumber: otpRequest.phoneNumber },
    update: { identifierType: IdentifierType.PHONE },
    create: {
      phoneNumber: otpRequest.phoneNumber,
      identifierType: IdentifierType.PHONE,
    },
  });

  await prisma.otpRequest.delete({ where: { id: otpRequest.id } });

  const tokens = await issueTokensForUser(user.id);
  return tokens;
}
