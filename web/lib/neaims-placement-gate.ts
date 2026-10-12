import { prisma } from '@/lib/prisma';
import { fetchJobseekerPlacements } from '@/lib/neaims-placements';
import {
  isNeaimsPlacementRequired,
  NEAIMS_PLACEMENT_GRACE_UNTIL,
} from '@/lib/neaims-placement-policy';

export { isNeaimsPlacementRequired, NEAIMS_PLACEMENT_GRACE_UNTIL };

export const JOBSEEKER_PLACEMENT_REQUIRED =
  'A job placement must exist for every job seeker.';

export type PlacementPerson = { nationalId: string; name?: string | null };

export type UnplacedJobseeker = {
  nationalId: string;
  name?: string | null;
  detail: string;
};

export async function unplacedJobseekers(
  people: PlacementPerson[],
): Promise<UnplacedJobseeker[]> {
  if (!isNeaimsPlacementRequired()) {
    return [];
  }

  const unique = new Map<string, PlacementPerson>();
  for (const person of people) {
    const nationalId = person.nationalId.trim();
    if (!unique.has(nationalId)) unique.set(nationalId, { ...person, nationalId });
  }

  const checked = await Promise.all(
    [...unique.values()].map(async (person) => {
      const nationalId = person.nationalId;
      const who = person.name?.trim()
        ? `${person.name.trim()} (${nationalId || 'no National ID'})`
        : nationalId || 'This job seeker';

      if (!nationalId || nationalId.startsWith('DRAFT-')) {
        return {
          nationalId,
          name: person.name,
          detail: `${who} has no NEAIMS job placement. ${JOBSEEKER_PLACEMENT_REQUIRED}`,
        };
      }

      const placements = await fetchJobseekerPlacements(nationalId);
      if (placements.ok && placements.placed) return null;

      const detail =
        !placements.ok || placements.source === 'error'
          ? `NEAIMS could not confirm a job placement for ${who}. ${JOBSEEKER_PLACEMENT_REQUIRED}`
          : `${who} has no NEAIMS job placement. ${JOBSEEKER_PLACEMENT_REQUIRED}`;

      return { nationalId, name: person.name, detail };
    }),
  );

  return checked.filter((row): row is UnplacedJobseeker => row != null);
}

export async function unplacedGroupMembers(applicationId: string) {
  const members = await prisma.groupMember.findMany({
    where: { applicationId },
    select: { idNo: true, name: true },
  });
  return unplacedJobseekers(
    members.map((member) => ({ nationalId: member.idNo, name: member.name })),
  );
}

export function placementBlockMessage(missing: UnplacedJobseeker[]): string {
  return missing.map((row) => row.detail).join(' ');
}
