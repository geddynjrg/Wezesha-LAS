import type { ApplicationStatus, IndividualApplication, TripartiteData } from '@/generated/prisma';
import {
  loadSessionApplicantIdentity,
  sessionUserMatchesMember,
  userHasApplicantIdentity,
} from '@/lib/data/applications';
import { getSessionUserId } from '@/lib/auth/session';
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

export class IndividualApplicantAccessError extends Error {
  readonly code: 'unauthenticated' | 'identity-required' | 'forbidden' | 'not-found';

  constructor(
    code: IndividualApplicantAccessError['code'],
    message: string,
  ) {
    super(message);
    this.name = 'IndividualApplicantAccessError';
    this.code = code;
  }
}

/**
 * Ensures the logged-in user is the same person as the group member whose
 * individual application is being opened (matched by national ID, phone, or email).
 * Group chairs cannot open another member's individual application.
 */
export async function assertIndividualApplicantAccess(memberId: string) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new IndividualApplicantAccessError(
      'unauthenticated',
      'Authentication required',
    );
  }

  const [user, member] = await Promise.all([
    loadSessionApplicantIdentity(userId),
    prisma.groupMember.findUnique({
      where: { id: memberId },
      select: { id: true, idNo: true, mobile: true, email: true },
    }),
  ]);

  if (!member) {
    throw new IndividualApplicantAccessError('not-found', 'Member not found');
  }

  if (!user || !userHasApplicantIdentity(user)) {
    throw new IndividualApplicantAccessError(
      'identity-required',
      'Complete your profile (national ID, phone, or email) before applying for yourself.',
    );
  }

  if (!sessionUserMatchesMember(user, member)) {
    throw new IndividualApplicantAccessError(
      'forbidden',
      'You can only continue an individual application that belongs to you.',
    );
  }

  return { userId, user, member };
}

/** Guard for server actions that mutate individual application data. */
export async function assertIndividualEditable(memberId: string) {
  await assertIndividualApplicantAccess(memberId);

  const app = await prisma.individualApplication.findUnique({ where: { memberId } });
  if (!app) {
    throw new Error('Application not found');
  }
  if (!isIndividualApplicationEditable(app)) {
    throw new Error('This application has been submitted and can no longer be edited.');
  }
  return app;
}
