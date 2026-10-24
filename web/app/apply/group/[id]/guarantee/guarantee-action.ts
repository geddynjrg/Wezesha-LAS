'use server';

import { assertGroupChairAccess } from '@/lib/group-application-access';
import { updateGroupProgress } from '@/lib/data/applications';
import {
  buildGuaranteeConsentUrl,
  createGuaranteeConsentToken,
} from '@/lib/guarantee-consent-token';
import { notifyApplicationStatusChannels } from '@/lib/notify/notify-application-status';
import { buildGuaranteeConsentMessage } from '@/lib/sms/sms.service';
import { prisma } from '@/lib/prisma';
import { resolveFormData } from '@/lib/resolve-form-data';
import { redirect } from 'next/navigation';

function isMemberSigned(formData: FormData, memberId: string): boolean {
  return formData.get(`signature_${memberId}`) === 'on';
}

export async function requestGuaranteeConsentAction(applicationId: string) {
  await assertGroupChairAccess(applicationId);
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
  const members = application.members.filter(
    (member) => member.mobile?.trim() || member.email?.trim(),
  );

  if (members.length === 0) {
    return {
      success: false as const,
      message: 'No members with phone numbers or email addresses found.',
    };
  }

  const failures: string[] = [];
  let sentCount = 0;

  for (const member of members) {
    // Skip members who already consented — no need to re-request
    if (member.signature?.trim().toLowerCase() === 'accepted') {
      continue;
    }

    const token = createGuaranteeConsentToken({
      memberId: member.id,
      applicationId,
    });
    const consentUrl = buildGuaranteeConsentUrl(token);
    const message = buildGuaranteeConsentMessage({
      memberName: member.name,
      groupName,
      consentUrl,
    });

    const channels = await notifyApplicationStatusChannels({
      recipient: {
        name: member.name,
        phone: member.mobile,
        email: member.email,
      },
      title: 'Uwezo Fund — Guarantee consent request',
      emailSubject: `Consent required: ${groupName} loan repayment commitment`,
      message,
    });

    if (!channels.sms && !channels.email && !channels.app) {
      failures.push(member.name);
    } else {
      sentCount += 1;
    }
  }

  if (sentCount === 0 && failures.length === 0) {
    return {
      success: true as const,
      message: 'All members have already consented. Signed toggles should already be on.',
    };
  }

  if (failures.length === members.length || (sentCount === 0 && failures.length > 0)) {
    return {
      success: false as const,
      message:
        'Failed to send consent requests via SMS, email, or Uwezo App. Please verify member contacts and try again.',
    };
  }

  if (failures.length > 0) {
    return {
      success: true as const,
      message: `Consent requests sent via SMS, email, and Uwezo App where possible. Failed for: ${failures.join(', ')}.`,
    };
  }

  return {
    success: true as const,
    message:
      'Consent requests sent via SMS, email, and Uwezo App. Members should open the link and tap “I consent”.',
  };
}

export async function saveGuaranteeAction(
  applicationId: string,
  prevOrFormData: unknown,
  maybeFormData?: FormData,
) {
  await assertGroupChairAccess(applicationId);
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
    const existing = member.signature?.trim().toLowerCase();

    await prisma.groupMember.update({
      where: { id: member.id },
      data: {
        // Preserve remote decline unless chair explicitly toggled on
        signature: signed
          ? 'accepted'
          : existing === 'declined'
            ? 'declined'
            : null,
      },
    });
  }

  await updateGroupProgress(applicationId, 9);
  redirect(`/apply/group/${applicationId}/documents`);
}
