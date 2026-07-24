'use server';

import { updateGroupProgress } from '@/lib/data/applications';
import {
  buildGuaranteeConsentMessage,
  sendSms,
} from '@/lib/sms/sms.service';
import { prisma } from '@/lib/prisma';
import { resolveFormData } from '@/lib/resolve-form-data';
import { redirect } from 'next/navigation';

function isMemberSigned(formData: FormData, memberId: string): boolean {
  return formData.get(`signature_${memberId}`) === 'on';
}

export async function requestGuaranteeConsentAction(applicationId: string) {
  const application = await prisma.groupApplication.findUnique({
    where: { id: applicationId },
    include: {
      groupData: true,
      members: true,
    },
  });

  if (!application) {
    return {
      success: false as const,
      message: 'Application not found.',
    };
  }

  const groupName = application.groupData?.groupName?.trim() || 'your group';
  const membersWithMobile = application.members.filter((member) => member.mobile?.trim());

  if (membersWithMobile.length === 0) {
    return {
      success: false as const,
      message: 'No members with phone numbers found.',
    };
  }

  const failures: string[] = [];

  for (const member of membersWithMobile) {
    const message = buildGuaranteeConsentMessage({
      memberName: member.name,
      groupName,
    });

    const result = await sendSms(member.mobile, message);
    if (!result.success) {
      failures.push(member.name);
    }
  }

  if (failures.length === membersWithMobile.length) {
    return {
      success: false as const,
      message:
        'Failed to send consent requests. Please verify member phone numbers and try again.',
    };
  }

  if (failures.length > 0) {
    return {
      success: true as const,
      message: `Consent requests sent. Failed for: ${failures.join(', ')}.`,
    };
  }

  return {
    success: true as const,
    message: 'Consent requests sent successfully to all members.',
  };
}

export async function saveGuaranteeAction(
  applicationId: string,
  prevOrFormData: unknown,
  maybeFormData?: FormData,
) {
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  const members = await prisma.groupMember.findMany({ where: { applicationId } });

  const missingSignatures = members.filter((member) => !isMemberSigned(formData, member.id));

  if (missingSignatures.length > 0) {
    return {
      success: false as const,
      message: `Please ensure all members have signed the commitment. Missing signatures for: ${missingSignatures.map((member) => member.name).join(', ')}.`,
      errors: {},
      values: {},
    };
  }

  for (const member of members) {
    const signed = isMemberSigned(formData, member.id);

    await prisma.groupMember.update({
      where: { id: member.id },
      data: {
        signature: signed ? 'accepted' : null,
      },
    });
  }

  await updateGroupProgress(applicationId, 9);
  redirect(`/apply/group/${applicationId}/documents`);
}
