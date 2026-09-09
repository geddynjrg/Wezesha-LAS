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

export type OtpDeliveryChannel = 'sms' | 'email';

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

  if (smsResult.success) {
    return {
      request_id: requestId,
      channel: 'sms',
      message:
        'OTP sent by SMS. Enter the 6-digit code here. First-time numbers create an account automatically.',
    };
  }

  console.warn(
    '[OTP] SMS delivery failed; attempting email failover (code not logged)',
  );

  const email = providedEmail || (await findEmailForPhone(phoneNumber));
  if (!email) {
    await prisma.otpRequest.delete({ where: { requestId } }).catch(() => undefined);
    throw new OtpDeliveryError(
      'SMS unavailable. Enter the email linked to this phone to receive a code, or use eCitizen / password login.',
      true,
    );
  }

  const mailResult = await sendPlainEmail({
    to: email,
    subject: 'Your Uwezo Fund login code',
    text:
      `Your login code is: ${otpCode}\n\n` +
      `It expires in 5 minutes.\n` +
      `If you did not request this code, you can ignore this email.`,
  });

  if (!mailResult.success) {
    await prisma.otpRequest.delete({ where: { requestId } }).catch(() => undefined);
    const detail =
      mailResult.skipped
        ? 'Email is not configured on this server.'
        : 'Email delivery failed.';
    throw new OtpDeliveryError(
      `SMS unavailable and ${detail} Try eCitizen or email/password login.`,
    );
  }

  const masked = maskEmail(email);
  return {
    request_id: requestId,
    channel: 'email',
    maskedEmail: masked,
    message: `SMS unavailable — we sent a code to your email (${masked}). Enter it here.`,
  };
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
