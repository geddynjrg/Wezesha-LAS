import { INDIVIDUAL_STEPS } from '@/lib/constants/majuu-steps';

/** Where an applicant should continue or view their individual application. */
export function getIndividualApplicationUrl(
  memberId: string,
  progress = 1,
  submitted = false,
): string {
  if (submitted) {
    return `/apply/individual/${memberId}/dashboard`;
  }

  const stepIndex = Math.max(0, Math.min(progress - 1, INDIVIDUAL_STEPS.length - 1));
  const path = INDIVIDUAL_STEPS[stepIndex]?.path ?? '/individual-information';
  return `/apply/individual/${memberId}${path}`;
}

export function isIndividualApplicationSubmitted(
  submittedAt?: Date | null,
  status?: string | null,
): boolean {
  return Boolean(submittedAt) || (status != null && status !== 'DRAFT');
}
