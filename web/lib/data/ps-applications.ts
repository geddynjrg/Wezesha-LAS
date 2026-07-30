import { ApplicationStatus, UserRole, type Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const POST_SUBMISSION_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.APPROVED,
];

const pendingSignatureFilter = (role: UserRole): Prisma.IndividualApplicationWhereInput => {
  const base: Prisma.IndividualApplicationWhereInput = {
    tripartiteAccepted: true,
    status: { in: POST_SUBMISSION_STATUSES },
    tripartite: { isNot: null },
  };

  if (role === UserRole.PS_LABOUR) {
    return {
      ...base,
      tripartite: { is: { labourPsSignature: null } },
    };
  }

  if (role === UserRole.PS_MSME) {
    return {
      ...base,
      tripartite: { is: { msmePsSignature: null } },
    };
  }

  return base;
};

export async function getPsPendingApplications(role: UserRole) {
  return prisma.individualApplication.findMany({
    where: pendingSignatureFilter(role),
    include: {
      member: { include: { application: { include: { groupData: true } } } },
      tripartite: true,
      signature: true,
    },
    orderBy: { submittedAt: 'desc' },
  });
}

export async function getPsApplicationById(applicationId: string) {
  return prisma.individualApplication.findUnique({
    where: { id: applicationId },
    include: {
      member: { include: { application: { include: { groupData: true } } } },
      tripartite: true,
      signature: true,
    },
  });
}

export async function countPsPendingApplications(role: UserRole) {
  return prisma.individualApplication.count({
    where: pendingSignatureFilter(role),
  });
}
