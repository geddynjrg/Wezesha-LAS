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
import { IdentifierType } from '@/generated/prisma';

const OTP_EXPIRY_SECONDS = 300;
const MAX_OTP_ATTEMPTS = 3;
const MAX_REQUESTS_PER_HOUR = 5;

export async function requestLoginOtp(phone: string) {
  const phoneNumber = normalizeKenyanPhoneForApi(phone);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.otpRequest.count({
    where: {
      phoneNumber,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    throw new Error('Too many OTP requests. Please try again later.');
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

  if (!smsResult.success) {
    throw new Error(smsResult.error ?? 'Failed to send OTP');
  }

  return { request_id: requestId };
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
