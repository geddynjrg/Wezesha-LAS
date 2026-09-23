import {
  getUserIndividualMemberships,
  type UserIndividualMembership,
} from '@/lib/data/applications';
import {
  getIndividualApplicationUrl,
  isIndividualApplicationSubmitted,
} from '@/lib/individual-application-url';

/**
 * Individual applications for the signed-in applicant only.
 * Matching is ID-first (see getUserIndividualMemberships) so shared group
 * phones/emails do not list other members on /my-application.
 */
export async function getMatchedIndividualMemberships(
  userId: string,
): Promise<UserIndividualMembership[]> {
  return getUserIndividualMemberships(userId);
}

export function individualMembershipUrl(member: UserIndividualMembership): string {
  const individual = member.individualApplication;

  return getIndividualApplicationUrl(
    member.id,
    individual?.progress ?? 1,
    isIndividualApplicationSubmitted(individual?.submittedAt, individual?.status),
  );
}

/** Direct link when the logged-in user has exactly one matched individual application. */
export async function resolveSingleIndividualApplicationUrl(
  userId: string,
): Promise<string | null> {
  const memberships = await getMatchedIndividualMemberships(userId);
  if (memberships.length !== 1) return null;
  return individualMembershipUrl(memberships[0]!);
}
