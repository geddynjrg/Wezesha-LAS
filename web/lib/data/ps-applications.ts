import { ApplicationStatus, UserRole, type Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const POST_SUBMISSION_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.APPROVED,
];

const tripartiteBaseFilter: Prisma.IndividualApplicationWhereInput = {
  tripartiteAccepted: true,
  status: { in: POST_SUBMISSION_STATUSES },
  tripartite: { isNot: null },
};

const pendingSignatureFilter = (role: UserRole): Prisma.IndividualApplicationWhereInput => {
  if (role === UserRole.PS_LABOUR) {
    return {
      ...tripartiteBaseFilter,
      tripartite: {
        is: {
          msmePsSignature: { not: null },
          labourPsSignature: null,
        },
      },
    };
  }

  if (role === UserRole.PS_MSME) {
    return {
      ...tripartiteBaseFilter,
      tripartite: { is: { msmePsSignature: null } },
    };
  }

  return tripartiteBaseFilter;
};

const signedSignatureFilter = (role: UserRole): Prisma.IndividualApplicationWhereInput => {
  if (role === UserRole.PS_LABOUR) {
    return {
      ...tripartiteBaseFilter,
      tripartite: { is: { labourPsSignature: { not: null } } },
    };
  }

  if (role === UserRole.PS_MSME) {
    return {
      ...tripartiteBaseFilter,
      tripartite: { is: { msmePsSignature: { not: null } } },
    };
  }

  return tripartiteBaseFilter;
};

const psApplicationInclude = {
  member: { include: { application: { include: { groupData: true } } } },
  tripartite: true,
  signature: true,
} as const;

export async function getPsPendingApplications(role: UserRole) {
  return prisma.individualApplication.findMany({
    where: pendingSignatureFilter(role),
    include: psApplicationInclude,
    orderBy: { submittedAt: 'desc' },
  });
}

export async function getPsSignedApplications(role: UserRole) {
  return prisma.individualApplication.findMany({
    where: signedSignatureFilter(role),
    include: psApplicationInclude,
    orderBy: { submittedAt: 'desc' },
  });
}

export async function getPsApplicationById(applicationId: string) {
  return prisma.individualApplication.findUnique({
    where: { id: applicationId },
    include: psApplicationInclude,
  });
}

export async function countPsPendingApplications(role: UserRole) {
  return prisma.individualApplication.count({
    where: pendingSignatureFilter(role),
  });
}

export async function countPsSignedApplications(role: UserRole) {
  return prisma.individualApplication.count({
    where: signedSignatureFilter(role),
  });
}
