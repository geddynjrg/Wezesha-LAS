import { ApplicationStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

const POST_SUBMISSION_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.APPROVED,
];

export interface TripartiteApplicantRecord {
  applicationId: string;
  acknowledgmentNumber: string;
  name: string;
  idNumber: string;
  passportNumber: string;
  signature: string | null;
}

export type TripartiteSigningStatus = 'awaiting_msme' | 'awaiting_labour' | 'fully_signed';

export function getTripartiteSigningStatus(tripartite: {
  msmePsSignature: string | null;
  labourPsSignature: string | null;
}): TripartiteSigningStatus {
  if (!tripartite.msmePsSignature) {
    return 'awaiting_msme';
  }
  if (!tripartite.labourPsSignature) {
    return 'awaiting_labour';
  }
  return 'fully_signed';
}

export function getTripartiteSigningStatusLabel(status: TripartiteSigningStatus): string {
  switch (status) {
    case 'awaiting_msme':
      return 'Awaiting MSME PS signature';
    case 'awaiting_labour':
      return 'Awaiting Labour PS signature';
    case 'fully_signed':
      return 'Fully signed';
  }
}

export async function getTripartiteApplicantsForApplication(
  applicationId: string,
): Promise<TripartiteApplicantRecord[]> {
  const application = await prisma.individualApplication.findUnique({
    where: { id: applicationId },
    include: {
      member: true,
      tripartite: true,
      signature: true,
    },
  });

  if (!application?.tripartite) {
    return [];
  }

  const groupApplicationId = application.member.applicationId;

  const groupMembers = await prisma.groupMember.findMany({
    where: { applicationId: groupApplicationId },
    include: {
      individualApplication: {
        include: {
          tripartite: true,
          signature: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const applicants = groupMembers
    .map((member) => member.individualApplication)
    .filter(
      (individualApp): individualApp is NonNullable<typeof individualApp> =>
        Boolean(
          individualApp?.tripartiteAccepted &&
            individualApp.tripartite &&
            POST_SUBMISSION_STATUSES.includes(individualApp.status),
        ),
    )
    .map((individualApp) => ({
      applicationId: individualApp.id,
      acknowledgmentNumber: individualApp.acknowledgmentNumber,
      name: individualApp.tripartite!.migrantName,
      idNumber: individualApp.tripartite!.idNumber,
      passportNumber: individualApp.tripartite!.passportNumber,
      signature: individualApp.signature?.digitalSignature ?? null,
    }));

  if (applicants.length > 0) {
    return applicants;
  }

  return [
    {
      applicationId: application.id,
      acknowledgmentNumber: application.acknowledgmentNumber,
      name: application.tripartite.migrantName,
      idNumber: application.tripartite.idNumber,
      passportNumber: application.tripartite.passportNumber,
      signature: application.signature?.digitalSignature ?? null,
    },
  ];
}
