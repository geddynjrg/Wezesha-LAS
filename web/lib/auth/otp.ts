import {
  generateRequestId,
  hashOtpCode,
} from '@/lib/auth/jwt';
import { issueTokensForUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { formatKenyanPhoneForApi, kenyanPhoneLookupVariants, normalizeKenyanPhoneForApi } from '@/lib/phone/kenyan-phone';
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

  // Start app inbox/FCM alongside SMS so a slow SMS HTTP response is not
  // followed by a second wait on peer fanout / FCM before the OTP UI appears.
  const appInFlight = tryDeliverToApp(providedEmail);

  const smsResult = await sendSms(phoneNumber, otpMessage);

  if (smsResult.success) {
    // Do not await app delivery — OTP entry must appear as soon as SMS returns.
    void appInFlight.catch(() => undefined);
    return {
      request_id: requestId,
      channel: 'sms' as const,
      message:
        'OTP sent by SMS (and to the Uwezo Fund app if you stayed signed in). Enter the 6-digit code here. First-time numbers create an account automatically.',
    };
  }

  console.warn(
    '[OTP] SMS delivery failed; attempting email failover (code not logged)',
  );

  const email = providedEmail || (await findEmailForPhone(phoneNumber));
  if (email) {
    const mailResult = await Promise.race([
      sendPlainEmail({
        to: email,
        subject: 'Your Uwezo Fund login code',
        text:
          `Your login code is: ${otpCode}\n\n` +
          `It expires in 5 minutes.\n` +
          `If you did not request this code, you can ignore this email.`,
      }),
      new Promise<{ success: false; error: string }>((resolve) =>
        setTimeout(
          () => resolve({ success: false, error: 'Email send timed out' }),
          5_000,
        ),
      ),
    ]);

    if (mailResult.success) {
      void appInFlight.catch(() => undefined);
      const masked = maskEmail(email);
      return {
        request_id: requestId,
        channel: 'email' as const,
        maskedEmail: masked,
        message: `SMS unavailable — we sent a code to your email (${masked}). Enter it here. If you stayed signed in on the Uwezo Fund app, check Notifications there too.`,
      };
    }

    console.warn('[OTP] Email delivery failed; attempting Uwezo Fund app delivery');
    const appResult = await Promise.race([
      appInFlight,
      new Promise<{ delivered: false; devices: 0 }>((resolve) =>
        setTimeout(() => resolve({ delivered: false, devices: 0 }), 3_000),
      ),
    ]);
    if (appResult.delivered) {
      return {
        request_id: requestId,
        channel: 'app' as const,
        message:
          'SMS and email were unavailable — we sent your login code to the Uwezo Fund app. Open the app (check Notifications) and enter the 6-digit code here.',
      };
    }

    return {
      request_id: requestId,
      channel: 'app' as const,
      message:
        'We could not confirm SMS or email. If you stayed signed in on the Uwezo Fund app, open Notifications for the 6-digit code and enter it here.',
    };
  }

  // No email on file — try app before asking the user for an email.
  const appOnly = await Promise.race([
    appInFlight,
    new Promise<{ delivered: false; devices: 0 }>((resolve) =>
      setTimeout(() => resolve({ delivered: false, devices: 0 }), 3_000),
    ),
  ]);
  if (appOnly.delivered) {
    return {
      request_id: requestId,
      channel: 'app' as const,
      message:
        'SMS unavailable — we sent your login code to the Uwezo Fund app. Open the app (check Notifications) and enter the 6-digit code here.',
    };
  }

  return {
    request_id: requestId,
    channel: 'app' as const,
    message:
      'SMS unavailable. If you stayed signed in on the Uwezo Fund app, open Notifications for the 6-digit code and enter it here. You can also enter the email linked to this phone.',
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

  const variants = kenyanPhoneLookupVariants(otpRequest.phoneNumber);
  const matches = variants.length
    ? await prisma.user.findMany({ where: { OR: variants.map((phoneNumber) => ({ phoneNumber })) } })
    : [];
  const user =
    matches.sort((a, b) => {
      const score = (row: { passwordHash?: string | null; email?: string | null; idNumber?: string | null; name?: string | null }) =>
        (row.passwordHash ? 8 : 0) + (row.email ? 4 : 0) + (row.idNumber ? 2 : 0) + (row.name ? 1 : 0);
      return score(b) - score(a);
    })[0] ||
    (await prisma.user.create({
      data: {
        phoneNumber: formatKenyanPhoneForApi(otpRequest.phoneNumber) || otpRequest.phoneNumber,
        identifierType: IdentifierType.PHONE,
      },
    }));

  await prisma.otpRequest.delete({ where: { id: otpRequest.id } });

  const tokens = await issueTokensForUser(user.id);
  return tokens;
}


export type ContactConfirmationResult = {
  emailRequestId: string;
  phoneRequestId: string;
  phoneChannel: 'sms' | 'email';
  maskedEmail: string;
  message: string;
};

/**
 * Separate codes for an email and a phone that is not the number on this SIM.
 * If SMS fails, the phone code is emailed so both can still be confirmed.
 */
export async function requestContactConfirmation(
  emailRaw: string,
  phoneRaw: string,
): Promise<ContactConfirmationResult> {
  const email = normalizeEmail(emailRaw);
  if (!email) {
    throw new OtpDeliveryError('Enter a valid email address.');
  }
  const phoneNumber = normalizeKenyanPhoneForApi(phoneRaw);
  if (!phoneNumber) {
    throw new OtpDeliveryError('Enter a valid phone number.');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.otpRequest.count({
    where: { phoneNumber, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount + 2 > MAX_REQUESTS_PER_HOUR) {
    throw new OtpDeliveryError('Too many OTP requests. Please try again later.');
  }

  let emailCode = generateOtpCode();
  let phoneCode = generateOtpCode();
  if (phoneCode === emailCode) {
    phoneCode = generateOtpCode();
  }
  const emailRequestId = generateRequestId();
  const phoneRequestId = generateRequestId();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

  await prisma.otpRequest.createMany({
    data: [
      {
        requestId: emailRequestId,
        phoneNumber,
        otpHash: hashOtpCode(emailCode),
        expiresAt,
      },
      {
        requestId: phoneRequestId,
        phoneNumber,
        otpHash: hashOtpCode(phoneCode),
        expiresAt,
      },
    ],
  });

  const emailMail = await sendPlainEmail({
    to: email,
    subject: 'Confirm your email for Uwezo Fund',
    text:
      `Your email confirmation code is: ${emailCode}\n\n` +
      `It expires in 5 minutes.\n` +
      `If you did not try to register, you can ignore this email.`,
  });
  if (!emailMail.success) {
    await prisma.otpRequest.deleteMany({
      where: { requestId: { in: [emailRequestId, phoneRequestId] } },
    });
    throw new OtpDeliveryError('The email confirmation code could not be sent. Try again.');
  }

  const smsResult = await sendSms(
    phoneNumber,
    `Your Uwezo Fund phone confirmation code is: ${phoneCode}`,
  );
  let phoneChannel: 'sms' | 'email' = 'sms';
  if (!smsResult.success) {
    phoneChannel = 'email';
    const phoneMail = await sendPlainEmail({
      to: email,
      subject: 'Confirm your phone number for Uwezo Fund',
      text:
        `We could not send an SMS to ${phoneNumber}.\n\n` +
        `Your phone confirmation code is: ${phoneCode}\n\n` +
        `Enter it with the separate email confirmation code. It expires in 5 minutes.`,
    });
    if (!phoneMail.success) {
      await prisma.otpRequest.deleteMany({
        where: { requestId: { in: [emailRequestId, phoneRequestId] } },
      });
      throw new OtpDeliveryError(
        'SMS is unavailable and the phone confirmation code could not be emailed. Try again.',
      );
    }
  }

  const masked = maskEmail(email);
  const message =
    phoneChannel === 'sms'
      ? `Enter the email code sent to ${masked} and the phone code sent by SMS.`
      : `SMS is unavailable. Enter the email code and the phone code; both were sent to ${masked}.`;

  return {
    emailRequestId,
    phoneRequestId,
    phoneChannel,
    maskedEmail: masked,
    message,
  };
}

export async function confirmContactCodes(input: {
  emailRequestId: string;
  emailCode: string;
  phoneRequestId: string;
  phoneCode: string;
}): Promise<void> {
  const emailId = await matchOtpCode(
    input.emailRequestId,
    input.emailCode,
    'Email confirmation code is not valid.',
  );
  const phoneId = await matchOtpCode(
    input.phoneRequestId,
    input.phoneCode,
    'Phone confirmation code is not valid.',
  );
  await prisma.otpRequest.deleteMany({ where: { id: { in: [emailId, phoneId] } } });
}

async function matchOtpCode(requestId: string, otpCode: string, invalidMessage: string) {
  const otpRequest = await prisma.otpRequest.findUnique({ where: { requestId } });
  if (!otpRequest || otpRequest.expiresAt < new Date()) {
    throw new Error(invalidMessage);
  }
  if (otpRequest.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error('Too many verification attempts. Please try again later.');
  }
  if (otpRequest.otpHash !== hashOtpCode(otpCode.trim())) {
    await prisma.otpRequest.update({
      where: { id: otpRequest.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error(invalidMessage);
  }
  return otpRequest.id;
}
