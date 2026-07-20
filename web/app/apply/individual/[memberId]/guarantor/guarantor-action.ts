'use server';

import {
  extractGuarantorInput,
  guarantorFieldsSchema,
  guarantorFormSchema,
  parseGuarantorFormData,
} from './guarantor-schema';
import { GuarantorOtpStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import {
  buildGuarantorOtpMessage,
  generateOtpCode,
  isOtpExpired,
  sendSms,
} from '@/lib/sms/sms.service';
import { redirect } from 'next/navigation';

function formatLoanAmount(amount: unknown): string {
  if (amount == null) return '0';
  const numeric = typeof amount === 'object' && amount !== null && 'toString' in amount
    ? Number(amount.toString())
    : Number(amount);
  if (Number.isNaN(numeric)) return '0';
  return numeric.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

async function getApplicationContext(memberId: string) {
  return prisma.individualApplication.findUniqueOrThrow({
    where: { memberId },
    include: {
      member: true,
      guarantors: true,
    },
  });
}

async function upsertGuarantor(
  applicationId: string,
  guarantorNumber: 1 | 2,
  data: ReturnType<typeof extractGuarantorInput>,
) {
  return prisma.guarantorData.upsert({
    where: {
      applicationId_guarantorNumber: {
        applicationId,
        guarantorNumber,
      },
    },
    create: {
      applicationId,
      guarantorNumber,
      ...data,
    },
    update: {
      ...data,
    },
  });
}

export async function sendGuarantorOtpAction(
  memberId: string,
  guarantorNumber: 1 | 2,
  _prev: unknown,
  formData: FormData,
) {
  const raw = parseGuarantorFormData(formData);
  const parsed = guarantorFieldsSchema.safeParse(extractGuarantorInput(raw, guarantorNumber));

  if (!parsed.success) {
    return {
      success: false as const,
      guarantorNumber,
      action: 'sendOtp' as const,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please complete all guarantor fields before sending OTP.',
      values: raw,
    };
  }

  const app = await getApplicationContext(memberId);
  const otpCode = generateOtpCode();

  await upsertGuarantor(app.id, guarantorNumber, parsed.data);

  await prisma.guarantorData.update({
    where: {
      applicationId_guarantorNumber: {
        applicationId: app.id,
        guarantorNumber,
      },
    },
    data: {
      otpCode,
      otpStatus: GuarantorOtpStatus.SENT,
      otpVerified: false,
      otpSentAt: new Date(),
      otpVerifiedAt: null,
    },
  });

  const message = buildGuarantorOtpMessage({
    guarantorName: parsed.data.name,
    applicantName: app.member.name,
    loanAmount: formatLoanAmount(app.member.amount),
    otpCode,
  });

  const smsResult = await sendSms(parsed.data.phone, message);

  if (!smsResult.success) {
    return {
      success: false as const,
      guarantorNumber,
      action: 'sendOtp' as const,
      message: smsResult.error ?? 'Failed to send OTP SMS. Please verify the phone number and try again.',
      values: raw,
    };
  }

  return {
    success: true as const,
    guarantorNumber,
    action: 'sendOtp' as const,
    message: `OTP sent to ${parsed.data.name} at ${parsed.data.phone}. Ask them to share the code with you.`,
    values: raw,
  };
}

export async function verifyGuarantorOtpAction(
  memberId: string,
  guarantorNumber: 1 | 2,
  _prev: unknown,
  formData: FormData,
) {
  const raw = parseGuarantorFormData(formData);
  const otpInput = raw[`guarantor${guarantorNumber}_otp`]?.trim();

  if (!otpInput) {
    return {
      success: false as const,
      guarantorNumber,
      action: 'verifyOtp' as const,
      message: 'Please enter the OTP code shared by the guarantor.',
      values: raw,
    };
  }

  const app = await getApplicationContext(memberId);
  const guarantor = app.guarantors.find((g) => g.guarantorNumber === guarantorNumber);

  if (!guarantor || guarantor.otpStatus !== GuarantorOtpStatus.SENT || !guarantor.otpCode) {
    return {
      success: false as const,
      guarantorNumber,
      action: 'verifyOtp' as const,
      message: 'No OTP has been sent for this guarantor yet. Send OTP first.',
      values: raw,
    };
  }

  if (isOtpExpired(guarantor.otpSentAt)) {
    await prisma.guarantorData.update({
      where: { id: guarantor.id },
      data: { otpStatus: GuarantorOtpStatus.EXPIRED, otpCode: null },
    });

    return {
      success: false as const,
      guarantorNumber,
      action: 'verifyOtp' as const,
      message: 'OTP has expired. Please send a new OTP.',
      values: raw,
    };
  }

  if (guarantor.otpCode !== otpInput) {
    return {
      success: false as const,
      guarantorNumber,
      action: 'verifyOtp' as const,
      message: 'Invalid OTP code. Please check with the guarantor and try again.',
      values: raw,
    };
  }

  await prisma.guarantorData.update({
    where: { id: guarantor.id },
    data: {
      otpVerified: true,
      otpStatus: GuarantorOtpStatus.VERIFIED,
      otpVerifiedAt: new Date(),
      otpCode: null,
    },
  });

  return {
    success: true as const,
    guarantorNumber,
    action: 'verifyOtp' as const,
    message: `Guarantor ${guarantorNumber} consent verified successfully.`,
    values: raw,
  };
}

export async function saveGuarantorsAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const raw = parseGuarantorFormData(formData);
  const parsed = guarantorFormSchema.safeParse({
    guarantor1: extractGuarantorInput(raw, 1),
    guarantor2: extractGuarantorInput(raw, 2),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(fieldErrors.guarantor1 ?? {})) {
      errors[`guarantor1_${key}`] = value ?? [];
    }
    for (const [key, value] of Object.entries(fieldErrors.guarantor2 ?? {})) {
      errors[`guarantor2_${key}`] = value ?? [];
    }

    return {
      success: false as const,
      errors,
      message: 'Please complete all required guarantor fields.',
      values: raw,
    };
  }

  const app = await getApplicationContext(memberId);

  await upsertGuarantor(app.id, 1, parsed.data.guarantor1);
  await upsertGuarantor(app.id, 2, parsed.data.guarantor2);

  const refreshed = await getApplicationContext(memberId);
  const g1 = refreshed.guarantors.find((g) => g.guarantorNumber === 1);
  const g2 = refreshed.guarantors.find((g) => g.guarantorNumber === 2);

  if (!g1?.otpVerified || !g2?.otpVerified) {
    return {
      success: false as const,
      message: 'Both guarantors must verify OTP consent before continuing.',
      values: raw,
    };
  }

  await prisma.individualApplication.update({
    where: { id: app.id },
    data: { progress: 3 },
  });

  redirect(`/apply/individual/${memberId}/recruitment`);
}
