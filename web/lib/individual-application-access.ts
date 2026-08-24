import type { ApplicationStatus, IndividualApplication, TripartiteData } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type ApplicationLike = Pick<
  IndividualApplication,
  | 'status'
  | 'submittedAt'
  | 'loanAmountApproved'
  | 'loanAmountApprovedAt'
  | 'awardAmount'
  | 'predisbursementAccepted'
  | 'predisbursementAcceptedAt'
  | 'tripartiteAccepted'
>;

/** Submitted (or later) applications are view-only for the applicant. */
export function isIndividualApplicationEditable(app: ApplicationLike): boolean {
  if (app.submittedAt) return false;
  return app.status === 'DRAFT';
}

export function isIndividualApplicationSubmitted(app: ApplicationLike): boolean {
  return !isIndividualApplicationEditable(app);
}

export function isTripartiteFullySigned(
  tripartite: Pick<
    TripartiteData,
    'labourPsSignedAt' | 'msmePsSignedAt' | 'labourPsSignature' | 'msmePsSignature'
  > | null | undefined,
): boolean {
  if (!tripartite) return false;
  return Boolean(
    tripartite.labourPsSignedAt &&
      tripartite.msmePsSignedAt &&
      tripartite.labourPsSignature &&
      tripartite.msmePsSignature,
  );
}

/** Loan amount approved by staff / LMS — unlocks predisbursement consent. */
export function isLoanAmountApproved(app: ApplicationLike): boolean {
  if (app.loanAmountApproved || app.loanAmountApprovedAt) return true;
  return app.status === 'APPROVED';
}

export function canConsentToPredisbursement(app: ApplicationLike): boolean {
  return isIndividualApplicationSubmitted(app) && isLoanAmountApproved(app);
}

const POST_SUBMISSION: ApplicationStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
];

export function formatApplicationStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'SUBMITTED':
      return 'Submitted';
    case 'UNDER_REVIEW':
      return 'Under review';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status;
  }
}

export function isPostSubmissionStatus(status: ApplicationStatus): boolean {
  return POST_SUBMISSION.includes(status);
}

/** Guard for server actions that mutate individual application data. */
export async function assertIndividualEditable(memberId: string) {
  const app = await prisma.individualApplication.findUnique({ where: { memberId } });
  if (!app) {
    throw new Error('Application not found');
  }
  if (!isIndividualApplicationEditable(app)) {
    throw new Error('This application has been submitted and can no longer be edited.');
  }
  return app;
}
