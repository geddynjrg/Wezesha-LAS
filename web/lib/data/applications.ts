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
import {
  buildGroupSubmissionConfirmationMessage,
  sendSms,
} from '@/lib/sms/sms.service';
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

function memberIdentityFiltersFromUser(user: {
  idNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
}): Prisma.GroupMemberWhereInput[] {
  const filters: Prisma.GroupMemberWhereInput[] = [];
  const idDigits = digitsOnly(user.idNumber);
  if (user.idNumber?.trim()) {
    filters.push({ idNo: user.idNumber.trim() });
  }
  if (idDigits) {
    filters.push({ idNo: idDigits });
  }

  for (const variant of phoneMatchVariants(user.phoneNumber)) {
    filters.push({ mobile: { contains: variant } });
  }

  if (user.email?.trim()) {
    filters.push({ email: user.email.trim() });
  }

  return filters;
}

export async function getUserGroupApplications(userId: string) {
  const user = await loadUserIdentity(userId);
  if (!user) return [];

  const memberFilters = memberIdentityFiltersFromUser(user);
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
    where: {
      OR: [
        { userId: { in: relatedUserIds } },
        ...(memberFilters.length > 0 ? [{ members: { some: { OR: memberFilters } } }] : []),
      ],
    },
    include: groupApplicationListInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

/** Individual applications for the logged-in person (matched by ID, phone, or email). */
export async function getUserIndividualMemberships(userId: string) {
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

  const idDigits = digitsOnly(user.idNumber);
  const localPhone = user.phoneNumber ? normalizeKenyanPhoneLocal(user.phoneNumber) : null;

  return members.filter((member) => {
    if (idDigits && digitsOnly(member.idNo) === idDigits) return true;
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
  members: Array<{ id: string; name: string; idNo: string; mobile: string }>;
}) {
  const groupName = application.groupData?.groupName?.trim() || 'your group';
  const failures: string[] = [];

  for (const member of application.members) {
    if (!member.mobile?.trim()) {
      console.warn(`[SMS] Skipping member ${member.name} — no mobile number`);
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

    const result = await sendSms(member.mobile, message);
    if (!result.success) {
      console.error(`[SMS] Failed to notify ${member.name}:`, result.error);
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

  if (groupApp) {
    void triggerLmsSync(groupApp.acknowledgmentNumber);
  }

  return application;
}
