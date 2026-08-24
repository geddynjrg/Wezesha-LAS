import {
  getUserGroupApplications,
  getUserIndividualMemberships,
  type UserIndividualMembership,
} from '@/lib/data/applications';
import {
  getIndividualApplicationUrl,
  isIndividualApplicationSubmitted,
} from '@/lib/individual-application-url';

export async function getMatchedIndividualMemberships(
  userId: string,
): Promise<UserIndividualMembership[]> {
  const [applications, memberships] = await Promise.all([
    getUserGroupApplications(userId),
    getUserIndividualMemberships(userId),
  ]);

  const ownedGroupIds = new Set(applications.map((application) => application.id));

  return memberships.filter(
    (member) => !ownedGroupIds.has(member.applicationId) || member.individualApplication,
  );
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
