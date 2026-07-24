'use server';

import { parseLoanAmountForm } from '@/app/apply/group/[id]/loan-amount/loan-amount-schema';
import { GuarantorOtpStatus } from '@/generated/prisma';
import {
  loanAmountValidationToFieldErrors,
  validateGroupMemberLoanAmounts,
} from '@/lib/adjust-loan-amounts';
import { updateGroupProgress } from '@/lib/data/applications';
import {
  formatKenyanPhoneForDisplay,
  normalizeKenyanPhoneForApi,
} from '@/lib/phone/kenyan-phone';
import { prisma } from '@/lib/prisma';
import { resolveFormData } from '@/lib/resolve-form-data';
import {
  buildMemberConsentOtpMessage,
  generateOtpCode,
  isOtpExpired,
  sendSms,
} from '@/lib/sms/sms.service';
import { redirect } from 'next/navigation';

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_SENDS_PER_HOUR = 5;

function formatLoanAmount(amount: unknown): string {
  if (amount == null) return '0';
  const numeric =
    typeof amount === 'object' && amount !== null && 'toString' in amount
      ? Number(amount.toString())
      : Number(amount);
  if (Number.isNaN(numeric)) return '0';
  return numeric.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

function parseMemberAmount(formData: FormData, memberId: string): number | null {
  const raw = formData.get(`amount_${memberId}`);
  if (raw == null || String(raw).trim() === '') return null;
  const amount = Number(raw);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

function validateLoanAmountFormData(
  formData: FormData,
  memberIds: string[],
  formValues: Record<string, FormDataEntryValue>,
) {
  const parsed = parseLoanAmountForm(formData, memberIds);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      values: formValues,
    };
  }

  return { ok: true as const };
}

function validateSingleMemberAmount(
  formData: FormData,
  memberId: string,
  allMemberIds: string[],
  formValues: Record<string, FormDataEntryValue>,
) {
  const amount = parseMemberAmount(formData, memberId);
  if (amount == null) {
    return {
      ok: false as const,
      message: 'Please enter a valid loan amount before continuing.',
    };
  }

  const validationErrors = validateGroupMemberLoanAmounts(
    allMemberIds.map((id) => ({
      field: `amount_${id}`,
      amount: id === memberId ? amount : parseMemberAmount(formData, id) ?? 0,
    })),
  );

  if (validationErrors.length > 0) {
    const fieldErrors = loanAmountValidationToFieldErrors(validationErrors);
    const firstError = validationErrors[0]?.message ?? 'Invalid loan amount.';
    return {
      ok: false as const,
      message: firstError,
      errors: fieldErrors,
      values: formValues,
    };
  }

  return { ok: true as const, amount };
}

async function getMemberForApplication(applicationId: string, memberId: string) {
  return prisma.groupMember.findFirst({
    where: { id: memberId, applicationId },
  });
}

async function assertOtpSendAllowed(memberId: string) {
  const member = await prisma.groupMember.findUniqueOrThrow({
    where: { id: memberId },
  });

  if (
    member.otpSentAt &&
    Date.now() - member.otpSentAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000
  ) {
    const waitSeconds = Math.ceil(
      (RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - member.otpSentAt.getTime())) / 1000,
    );
    throw new Error(`Please wait ${waitSeconds} seconds before requesting another OTP.`);
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentSendCount = await prisma.memberConsentOtpSend.count({
    where: {
      memberId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentSendCount >= MAX_OTP_SENDS_PER_HOUR) {
    throw new Error(
      `Too many OTP requests for this member (${MAX_OTP_SENDS_PER_HOUR} per hour). Please try again later.`,
    );
  }
}

export async function sendMemberConsentOtpAction(
  applicationId: string,
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const members = await prisma.groupMember.findMany({
    where: { applicationId },
    select: { id: true },
  });
  const memberIds = members.map((member) => member.id);
  const formValues = Object.fromEntries(formData.entries());

  const validation = validateSingleMemberAmount(
    formData,
    memberId,
    memberIds,
    formValues,
  );
  if (!validation.ok) {
    return {
      success: false as const,
      memberId,
      action: 'sendOtp' as const,
      message: validation.message,
    };
  }

  const amount = validation.amount;

  const member = await getMemberForApplication(applicationId, memberId);
  if (!member) {
    return {
      success: false as const,
      memberId,
      action: 'sendOtp' as const,
      message: 'Member not found.',
    };
  }

  if (!member.mobile?.trim()) {
    return {
      success: false as const,
      memberId,
      action: 'sendOtp' as const,
      message: 'Member does not have a phone number on file.',
    };
  }

  const phoneNumber = normalizeKenyanPhoneForApi(member.mobile);

  try {
    await assertOtpSendAllowed(memberId);
  } catch (error) {
    return {
      success: false as const,
      memberId,
      action: 'sendOtp' as const,
      message: error instanceof Error ? error.message : 'Unable to send OTP.',
    };
  }

  const otpCode = generateOtpCode();

  const message = buildMemberConsentOtpMessage({
    memberName: member.name,
    loanAmount: formatLoanAmount(amount),
    otpCode,
  });

  const smsResult = await sendSms(member.mobile, message);

  if (!smsResult.success) {
    return {
      success: false as const,
      memberId,
      action: 'sendOtp' as const,
      message:
        smsResult.error ??
        'Failed to send OTP SMS. Please verify the phone number and try again.',
    };
  }

  const now = new Date();

  await prisma.groupMember.update({
    where: { id: memberId },
    data: {
      amount,
      otpCode,
      otpStatus: GuarantorOtpStatus.SENT,
      otpVerified: false,
      otpVerifiedAt: null,
      otpSentAt: now,
      consentAmount: null,
    },
  });

  await prisma.memberConsentOtpSend.create({
    data: {
      memberId,
      phoneNumber,
    },
  });

  return {
    success: true as const,
    memberId,
    action: 'sendOtp' as const,
    message: `OTP sent to ${member.name} at ${formatKenyanPhoneForDisplay(member.mobile)}.`,
  };
}

export async function verifyMemberConsentOtpAction(
  applicationId: string,
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const otpInput = formData.get(`otp_${memberId}`)?.toString().trim();
  const members = await prisma.groupMember.findMany({
    where: { applicationId },
    select: { id: true },
  });
  const memberIds = members.map((member) => member.id);
  const formValues = Object.fromEntries(formData.entries());

  if (!otpInput) {
    return {
      success: false as const,
      memberId,
      action: 'verifyOtp' as const,
      message: 'Please enter the OTP code shared by the member.',
    };
  }

  const validation = validateSingleMemberAmount(
    formData,
    memberId,
    memberIds,
    formValues,
  );
  if (!validation.ok) {
    return {
      success: false as const,
      memberId,
      action: 'verifyOtp' as const,
      message: validation.message,
    };
  }

  const amount = validation.amount;

  const member = await getMemberForApplication(applicationId, memberId);
  if (!member) {
    return {
      success: false as const,
      memberId,
      action: 'verifyOtp' as const,
      message: 'Member not found.',
    };
  }

  if (
    member.otpStatus !== GuarantorOtpStatus.SENT ||
    !member.otpCode ||
    member.otpVerified
  ) {
    return {
      success: false as const,
      memberId,
      action: 'verifyOtp' as const,
      message: 'No OTP has been sent for this member yet. Send OTP first.',
    };
  }

  if (isOtpExpired(member.otpSentAt)) {
    await prisma.groupMember.update({
      where: { id: memberId },
      data: { otpStatus: GuarantorOtpStatus.EXPIRED, otpCode: null },
    });

    return {
      success: false as const,
      memberId,
      action: 'verifyOtp' as const,
      message: 'OTP has expired. Please send a new OTP.',
    };
  }

  if (member.otpCode !== otpInput) {
    return {
      success: false as const,
      memberId,
      action: 'verifyOtp' as const,
      message: 'Invalid OTP code. Please check with the member and try again.',
    };
  }

  await prisma.groupMember.update({
    where: { id: memberId },
    data: {
      amount,
      otpVerified: true,
      otpStatus: GuarantorOtpStatus.VERIFIED,
      otpVerifiedAt: new Date(),
      otpCode: null,
      consentAmount: amount,
    },
  });

  return {
    success: true as const,
    memberId,
    action: 'verifyOtp' as const,
    message: `${member.name} consent verified successfully.`,
  };
}

export async function saveLoanAmountAction(
  applicationId: string,
  prevOrFormData: unknown,
  maybeFormData?: FormData,
) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  const formValues = Object.fromEntries(formData.entries());
  const members = await prisma.groupMember.findMany({ where: { applicationId } });
  const memberIds = members.map((member) => member.id);

  const validation = validateLoanAmountFormData(formData, memberIds, formValues);
  if (!validation.ok) {
    return {
      success: false as const,
      errors: validation.errors,
      values: formValues,
      message:
        validation.errors[`amount_${memberIds[0]}`]?.[0] ??
        'Please correct the loan amounts before continuing.',
    };
  }

  for (const member of members) {
    const amount = parseMemberAmount(formData, member.id);
    if (amount != null) {
      const consentAmount =
        member.consentAmount != null ? Number(member.consentAmount.toString()) : null;
      const amountChanged = consentAmount != null && consentAmount !== amount;

      await prisma.groupMember.update({
        where: { id: member.id },
        data: {
          amount,
          ...(amountChanged
            ? {
                otpVerified: false,
                otpStatus: GuarantorOtpStatus.PENDING,
                otpCode: null,
                otpSentAt: null,
                otpVerifiedAt: null,
                consentAmount: null,
              }
            : {}),
        },
      });
    }
  }

  const refreshedMembers = await prisma.groupMember.findMany({
    where: { applicationId },
  });

  const membersNeedingConsent = refreshedMembers.filter(
    (member) => member.mobile?.trim() && member.amount != null && Number(member.amount) > 0,
  );

  const unverified = membersNeedingConsent.filter((member) => !member.otpVerified);

  if (unverified.length > 0) {
    return {
      success: false as const,
      message: `All members must verify OTP consent before continuing. Pending: ${unverified.map((m) => m.name).join(', ')}.`,
    };
  }

  if (membersNeedingConsent.length === 0) {
    return {
      success: false as const,
      message: 'Please enter loan amounts for all members.',
    };
  }

  await updateGroupProgress(applicationId, 6);
  redirect(`/apply/group/${applicationId}/terms`);
}
