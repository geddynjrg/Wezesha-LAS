'use server';

import {
  verifyGuaranteeConsentToken,
} from '@/lib/guarantee-consent-token';
import { prisma } from '@/lib/prisma';

export type GuaranteeConsentView = {
  ok: boolean;
  message?: string;
  groupName?: string;
  memberName?: string;
  status?: 'pending' | 'accepted' | 'declined';
  memberId?: string;
  applicationId?: string;
};

export async function loadGuaranteeConsent(
  token: string,
): Promise<GuaranteeConsentView> {
  const payload = verifyGuaranteeConsentToken(token);
  if (!payload) {
    return { ok: false, message: 'This consent link is invalid or has expired.' };
  }

  const member = await prisma.groupMember.findUnique({
    where: { id: payload.memberId },
    include: {
      application: { include: { groupData: true } },
    },
  });

  if (!member || member.applicationId !== payload.applicationId) {
    return { ok: false, message: 'Member not found for this consent link.' };
  }

  const signature = member.signature?.trim().toLowerCase() || null;
  const status: GuaranteeConsentView['status'] =
    signature === 'accepted'
      ? 'accepted'
      : signature === 'declined'
        ? 'declined'
        : 'pending';

  return {
    ok: true,
    groupName: member.application.groupData?.groupName?.trim() || 'your group',
    memberName: member.name,
    status,
    memberId: member.id,
    applicationId: member.applicationId,
  };
}

export async function submitGuaranteeConsentDecision(
  token: string,
  decision: 'accepted' | 'declined',
): Promise<GuaranteeConsentView> {
  const current = await loadGuaranteeConsent(token);
  if (!current.ok || !current.memberId) {
    return current;
  }

  if (current.status === 'accepted' || current.status === 'declined') {
    return {
      ...current,
      message:
        current.status === 'accepted'
          ? 'You have already consented to this guarantee.'
          : 'You have already declined this guarantee.',
    };
  }

  await prisma.groupMember.update({
    where: { id: current.memberId },
    data: { signature: decision },
  });

  return {
    ...current,
    status: decision,
    message:
      decision === 'accepted'
        ? 'Thank you. Your consent has been recorded.'
        : 'Your decision to decline has been recorded.',
  };
}
