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

/** MSME-first signing queue: Labour PS only sees agreements after MSME has signed. */
const pendingSigningFilter = (role: UserRole): Prisma.IndividualApplicationWhereInput => {
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

const signedSigningFilter = (role: UserRole): Prisma.IndividualApplicationWhereInput => {
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

const psSigningApplicationInclude = {
  member: { include: { application: { include: { groupData: true } } } },
  tripartite: true,
  signature: true,
} as const;

export async function getPsSigningPendingApplications(role: UserRole) {
  return prisma.individualApplication.findMany({
    where: pendingSigningFilter(role),
    include: psSigningApplicationInclude,
    orderBy: { submittedAt: 'desc' },
  });
}

export async function getPsSigningSignedApplications(role: UserRole) {
  return prisma.individualApplication.findMany({
    where: signedSigningFilter(role),
    include: psSigningApplicationInclude,
    orderBy: { submittedAt: 'desc' },
  });
}

export async function getPsSigningApplicationById(applicationId: string) {
  return prisma.individualApplication.findUnique({
    where: { id: applicationId },
    include: psSigningApplicationInclude,
  });
}

export async function countPsSigningPendingApplications(role: UserRole) {
  return prisma.individualApplication.count({
    where: pendingSigningFilter(role),
  });
}

export async function countPsSigningSignedApplications(role: UserRole) {
  return prisma.individualApplication.count({
    where: signedSigningFilter(role),
  });
}

export function mapPsSigningApplicationsToMigrantRows(
  applications: Prisma.IndividualApplicationGetPayload<{
    include: {
      member: { include: { application: { include: { groupData: true } } } };
      tripartite: true;
      signature: true;
    };
  }>[],
) {
  return applications.map((application) => ({
    applicationId: application.id,
    name: application.tripartite?.migrantName ?? application.member.name,
    idNumber: application.tripartite?.idNumber ?? '',
    passportNumber: application.tripartite?.passportNumber ?? '',
    acknowledgmentNumber: application.acknowledgmentNumber,
    groupName: application.member.application.groupData?.groupName ?? '—',
  }));
}
