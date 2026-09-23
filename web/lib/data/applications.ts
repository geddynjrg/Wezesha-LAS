import { buildIndividualApplicationStartUrl } from '@/lib/app-url';
import { triggerLmsSync } from '@/lib/lms/sync';
import { prisma } from '@/lib/prisma';
import { generateAcknowledgmentNumber } from '@/lib/constants/majuu-steps';
import { getIndividualAwardAmount } from '@/lib/loan/award-amount';
import { getSessionUserId } from '@/lib/auth/session';
import {
  normalizeKenyanPhoneForApi,
  normalizeKenyanPhoneLocal,
} from '@/lib/phone/kenyan-phone';
import { buildGroupSubmissionConfirmationMessage } from '@/lib/sms/sms.service';
import { notifyApplicationStatusChannels } from '@/lib/notify/notify-application-status';
import { ApplicationPhase, ApplicationStatus, Prisma } from '@/generated/prisma';

async function generateUniqueAcknowledgmentNumber() {
  let acknowledgmentNumber = generateAcknowledgmentNumber();
  let exists = await prisma.groupApplication.findUnique({
    where: { acknowledgmentNumber },
  });

  while (exists) {
    acknowledgmentNumber = generateAcknowledgmentNumber();
    exists = await prisma.groupApplication.findUnique({
      where: { acknowledgmentNumber },
    });
  }

  return acknowledgmentNumber;
}

export async function createGroupApplication(userId: string) {
  const acknowledgmentNumber = await generateUniqueAcknowledgmentNumber();

  return prisma.groupApplication.create({
    data: {
      acknowledgmentNumber,
      status: ApplicationStatus.DRAFT,
      phase: ApplicationPhase.GROUP,
      progress: 1,
      userId,
    },
  });
}

export async function getOrCreateGroupApplication() {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error('Authentication required');
  }

  const existingDraft = await prisma.groupApplication.findFirst({
    where: {
      userId,
      status: ApplicationStatus.DRAFT,
      phase: ApplicationPhase.GROUP,
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (existingDraft) {
    return existingDraft;
  }

  return createGroupApplication(userId);
}

const groupApplicationListInclude = {
  groupData: true,
  members: {
    include: {
      individualApplication: true,
    },
  },
} as const;

function digitsOnly(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

function phoneMatchVariants(phone: string | null | undefined): string[] {
  const local = phone ? normalizeKenyanPhoneLocal(phone) : null;
  if (!local) return [];

  return Array.from(
    new Set([local, `0${local}`, `254${local}`, `+254${local}`]),
  );
}

async function loadUserIdentity(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, idNumber: true, phoneNumber: true, email: true },
  });
}

export type ApplicantIdentity = {
  idNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
};

export type MemberIdentity = {
  idNo: string;
  mobile: string | null;
  email: string | null;
};

/** True when the logged-in person is the same individual as this group member. */
export function sessionUserMatchesMember(
  user: ApplicantIdentity,
  member: MemberIdentity,
): boolean {
  const idDigits = digitsOnly(user.idNumber);
  // If the account has a national ID, only that ID may match — never phone/email.
  // Shared group phones/emails otherwise surface other members on /my-application.
  if (idDigits) {
    return digitsOnly(member.idNo) === idDigits;
  }

  const localPhone = user.phoneNumber ? normalizeKenyanPhoneLocal(user.phoneNumber) : null;
  if (localPhone && normalizeKenyanPhoneLocal(member.mobile) === localPhone) return true;

  if (
    user.phoneNumber &&
    member.mobile &&
    normalizeKenyanPhoneForApi(user.phoneNumber) === normalizeKenyanPhoneForApi(member.mobile)
  ) {
    return true;
  }

  if (
    user.email &&
    member.email &&
    user.email.trim().toLowerCase() === member.email.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
}

export function userHasApplicantIdentity(user: ApplicantIdentity): boolean {
  return Boolean(
    digitsOnly(user.idNumber) ||
      (user.phoneNumber && normalizeKenyanPhoneLocal(user.phoneNumber)) ||
      user.email?.trim(),
  );
}

export async function loadSessionApplicantIdentity(userId: string) {
  return loadUserIdentity(userId);
}

function memberIdentityFiltersFromUser(user: {
  idNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
}): Prisma.GroupMemberWhereInput[] {
  const filters: Prisma.GroupMemberWhereInput[] = [];
  const idDigits = digitsOnly(user.idNumber);

  // Prefer exact national ID candidates when present (no phone/email OR).
  if (idDigits) {
    const idCandidates = new Set<string>();
    if (user.idNumber?.trim()) idCandidates.add(user.idNumber.trim());
    idCandidates.add(idDigits);
    const noLeadingZeros = idDigits.replace(/^0+/, '') || idDigits;
    idCandidates.add(noLeadingZeros);
    for (const candidate of idCandidates) {
      filters.push({ idNo: candidate });
    }
    return filters;
  }

  for (const variant of phoneMatchVariants(user.phoneNumber)) {
    // Exact equals only — never contains (shared prefixes pull other members).
    filters.push({ mobile: variant });
  }

  if (user.email?.trim()) {
    filters.push({ email: user.email.trim() });
  }

  return filters;
}

export async function getUserGroupApplications(userId: string) {
  const user = await loadUserIdentity(userId);
  if (!user) return [];

  // Group applications belong to the chair who created them — never list a
  // group merely because the user appears as a member (shared phones/IDs).
  const relatedUserOr: Prisma.UserWhereInput[] = [{ id: userId }];
  if (user.email) relatedUserOr.push({ email: user.email });
  if (user.idNumber) relatedUserOr.push({ idNumber: user.idNumber });
  if (user.phoneNumber) {
    relatedUserOr.push({ phoneNumber: user.phoneNumber });
    for (const variant of phoneMatchVariants(user.phoneNumber)) {
      relatedUserOr.push({ phoneNumber: variant });
    }
  }

  const relatedUsers = await prisma.user.findMany({
    where: { OR: relatedUserOr },
    select: { id: true },
  });
  const relatedUserIds = Array.from(new Set(relatedUsers.map((row) => row.id)));

  return prisma.groupApplication.findMany({
    where: { userId: { in: relatedUserIds } },
    include: groupApplicationListInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

/** Individual applications for the logged-in person (matched by ID, phone, or email). */
export async function getUserIndividualMemberships(userId: string) {
  await bindApplicantPhoneFromGroupMembers(userId);

  const user = await loadUserIdentity(userId);
  if (!user) return [];

  const or = memberIdentityFiltersFromUser(user);
  if (or.length === 0) return [];

  const members = await prisma.groupMember.findMany({
    where: { OR: or },
    include: {
      individualApplication: true,
      application: { include: { groupData: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const matched = members.filter((member) => sessionUserMatchesMember(user, member));

  // Phone-only accounts: if several different national IDs share the phone, do
  // not guess — require national ID (eCitizen) before listing.
  if (!digitsOnly(user.idNumber)) {
    const distinctIds = new Set(
      matched.map((m) => digitsOnly(m.idNo)).filter(Boolean),
    );
    if (distinctIds.size > 1) return [];
  }

  return matched;
}

/**
 * Bind the phone captured on the applicant's group member row(s) onto the user
 * account when the national ID matches and the account phone is empty/pending.
 */
export async function bindApplicantPhoneFromGroupMembers(userId: string) {
  const user = await loadUserIdentity(userId);
  if (!user) return;

  const idDigits = digitsOnly(user.idNumber);
  if (!idDigits) return;

  const members = await prisma.groupMember.findMany({
    where: {
      OR: [
        ...(user.idNumber?.trim() ? [{ idNo: user.idNumber.trim() }] : []),
        { idNo: idDigits },
      ],
    },
    select: { idNo: true, mobile: true },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  });

  const mine = members.filter((m) => digitsOnly(m.idNo) === idDigits);
  const memberPhone = mine
    .map((m) => m.mobile?.trim())
    .find((mobile) => mobile && mobile.toLowerCase() !== 'pending' && /\d/.test(mobile));

  if (!memberPhone) return;

  const userLocal = user.phoneNumber
    ? normalizeKenyanPhoneLocal(user.phoneNumber)
    : null;
  const memberLocal = normalizeKenyanPhoneLocal(memberPhone);
  if (!memberLocal) return;
  if (userLocal && userLocal === memberLocal) return;

  // Only fill missing phone — never overwrite a different verified phone.
  if (userLocal) return;

  const apiPhone = normalizeKenyanPhoneForApi(memberPhone);
  await prisma.user.update({
    where: { id: userId },
    data: { phoneNumber: apiPhone || memberPhone },
  });
}

export type UserIndividualMembership = Awaited<
  ReturnType<typeof getUserIndividualMemberships>
>[number];

export async function getGroupApplication(id: string) {
  return prisma.groupApplication.findUnique({
    where: { id },
    include: {
      groupData: true,
      membership: true,
      background: true,
      bankAccount: true,
      members: true,
      documents: true,
    },
  });
}

export async function getGroupApplicationByAck(acknowledgmentNumber: string) {
  return prisma.groupApplication.findUnique({
    where: { acknowledgmentNumber },
    include: {
      groupData: true,
      members: true,
    },
  });
}

export async function updateGroupProgress(id: string, progress: number) {
  return prisma.groupApplication.update({
    where: { id },
    data: { progress: Math.max(progress, 1) },
  });
}

async function notifyGroupMembersOfSubmission(application: {
  acknowledgmentNumber: string;
  groupData: { groupName: string } | null;
  members: Array<{ id: string; name: string; idNo: string; mobile: string; email?: string | null }>;
}) {
  const groupName = application.groupData?.groupName?.trim() || 'your group';
  const failures: string[] = [];

  for (const member of application.members) {
    if (!member.mobile?.trim() && !member.email?.trim()) {
      console.warn(`[notify] Skipping member ${member.name} — no mobile or email`);
      failures.push(member.name);
      continue;
    }

    const applyLink = buildIndividualApplicationStartUrl(member.idNo);
    const message = buildGroupSubmissionConfirmationMessage({
      memberName: member.name,
      groupName,
      acknowledgmentNumber: application.acknowledgmentNumber,
      applyLink,
    });

    const result = await notifyApplicationStatusChannels({
      recipient: {
        name: member.name,
        phone: member.mobile,
        email: member.email,
      },
      title: 'Wezesha Majuu application update',
      emailSubject: 'Your Wezesha Majuu group application was submitted',
      message,
    });
    if (!result.sms && !result.email && !result.app) {
      console.error(`[notify] Failed to notify ${member.name} on SMS, email, and app`);
      failures.push(member.name);
    }
  }

  if (failures.length > 0) {
    console.warn(
      `[SMS] Group submission notifications failed or skipped for: ${failures.join(', ')}`,
    );
  }
}

export async function submitGroupApplication(id: string) {
  const application = await prisma.groupApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.GROUP_SUBMITTED,
      phase: ApplicationPhase.INDIVIDUAL,
      progress: 9,
      submittedAt: new Date(),
    },
    include: {
      groupData: true,
      members: true,
    },
  });

  for (const member of application.members) {
    try {
      await getOrCreateIndividualApplication(member.id);
    } catch (error) {
      console.error(
        `[Applications] Failed to create individual application for ${member.name}:`,
        error,
      );
    }
  }

  await notifyGroupMembersOfSubmission(application);

  void triggerLmsSync(application.acknowledgmentNumber);

  return application;
}

export async function getIndividualApplication(memberId: string) {
  return prisma.individualApplication.findUnique({
    where: { memberId },
    include: {
      member: { include: { application: { include: { groupData: true } } } },
      location: true,
      guarantors: true,
      recruitment: true,
      budgetItems: true,
      bankAccount: true,
      creditHistory: true,
      creditHistoryLoans: true,
      signature: true,
      tripartite: true,
      documents: true,
    },
  });
}

export async function getOrCreateIndividualApplication(memberId: string) {
  const existing = await getIndividualApplication(memberId);
  if (existing) return existing;

  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    include: { application: true },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  if (member.application.status !== ApplicationStatus.GROUP_SUBMITTED) {
    throw new Error('Group application must be submitted first');
  }

  let acknowledgmentNumber = `${member.application.acknowledgmentNumber}-${member.idNo}`;
  return prisma.individualApplication.create({
    data: {
      memberId,
      acknowledgmentNumber,
      status: ApplicationStatus.DRAFT,
      progress: 1,
    },
    include: {
      member: { include: { application: { include: { groupData: true } } } },
    },
  });
}

export async function submitIndividualApplication(id: string) {
  const existing = await prisma.individualApplication.findUniqueOrThrow({
    where: { id },
    include: { member: true, budgetItems: true },
  });

  const awardAmount = getIndividualAwardAmount(
    existing.member.amount,
    existing.budgetItems,
  );

  const application = await prisma.individualApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.SUBMITTED,
      progress: 9,
      submittedAt: new Date(),
      tripartiteAccepted: true,
      awardAmount: new Prisma.Decimal(awardAmount),
    },
    include: { member: true },
  });

  await prisma.groupMember.update({
    where: { id: application.memberId },
    data: { loanStatus: 'INDIVIDUAL_SUBMITTED' },
  });

  const groupApp = await prisma.groupApplication.findUnique({
    where: { id: application.member.applicationId },
    include: { members: true },
  });

  await notifyApplicationStatusChannels({
    recipient: {
      name: application.member.name,
      phone: application.member.mobile,
      email: application.member.email,
    },
    title: 'Wezesha Majuu application submitted',
    emailSubject: 'Your Wezesha Majuu individual application was submitted',
    message: `Dear ${application.member.name}, your Uwezo Fund Wezesha Majuu individual application (Ref: ${application.acknowledgmentNumber}) has been submitted and is awaiting review. Track it on majuu.uwezo.go.ke or the Uwezo Fund app.`,
  });

  if (groupApp) {
    void triggerLmsSync(groupApp.acknowledgmentNumber);
  }

  return application;
}
