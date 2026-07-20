import { prisma } from '@/lib/prisma';
import { generateAcknowledgmentNumber } from '@/lib/constants/majuu-steps';
import { ApplicationPhase, ApplicationStatus } from '@/generated/prisma';

export async function createGroupApplication() {
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

  return prisma.groupApplication.create({
    data: {
      acknowledgmentNumber,
      status: ApplicationStatus.DRAFT,
      phase: ApplicationPhase.GROUP,
      progress: 1,
    },
  });
}

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

export async function submitGroupApplication(id: string) {
  return prisma.groupApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.GROUP_SUBMITTED,
      phase: ApplicationPhase.INDIVIDUAL,
      progress: 9,
      submittedAt: new Date(),
    },
  });
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
      signature: true,
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
  const application = await prisma.individualApplication.update({
    where: { id },
    data: {
      status: ApplicationStatus.SUBMITTED,
      progress: 9,
      submittedAt: new Date(),
      tripartiteAccepted: true,
    },
    include: { member: true },
  });

  await prisma.groupMember.update({
    where: { id: application.memberId },
    data: { loanStatus: 'INDIVIDUAL_SUBMITTED' },
  });

  return application;
}
