import { Prisma } from '@/generated/prisma';
import { searchAgenciesUnified, type RecruitmentAgency } from '@/lib/neaims-agencies';
import {
  fetchJobseekerGet,
  mapNeaimsEducationLevel,
} from '@/lib/neaims-jobseeker';
import {
  fetchJobseekerPlacements,
  mapPlacementToRecruitment,
  pickPreferredPlacement,
  type RecruitmentPlacementField,
} from '@/lib/neaims-placements';
import { prisma } from '@/lib/prisma';

const RECRUITMENT_KEYS = [
  'agentNumber',
  'localAgentName',
  'employerAbroad',
  'recruiterCode',
  'countryOfDestination',
  'natureOfWork',
  'durationType',
  'workDuration',
  'currency',
  'monthlyRemuneration',
] as const;

export async function neaimsLockedRecruitmentFields(
  nationalId: string,
): Promise<RecruitmentPlacementField[]> {
  const placements = await fetchJobseekerPlacements(nationalId);
  if (!placements.ok || !placements.placed) return [];
  const preferred = pickPreferredPlacement(placements.placements);
  if (!preferred) return [];
  return mapPlacementToRecruitment(preferred).lockedFields;
}

/** Jobseeker Get + Placements, same sources as the individual and member forms. */
export async function applyNeaimsJobseekerToMember(
  memberId: string,
  nationalId: string,
): Promise<string> {
  const id = nationalId.trim();
  if (id.length < 5 || id.startsWith('DRAFT-')) {
    return '';
  }

  const [jobseeker, placements] = await Promise.all([
    fetchJobseekerGet(id),
    fetchJobseekerPlacements(id),
  ]);
  const lines: string[] = [];

  if (!jobseeker.ok || jobseeker.source === 'error') {
    lines.push(
      `NEAIMS jobseeker lookup did not complete${jobseeker.message ? ` (${jobseeker.message})` : ''}. Enter profile details manually.`,
    );
  } else if (!jobseeker.jobseeker) {
    lines.push(
      'No NEAIMS jobseeker profile was found for that National ID. Enter gender, date of birth, education, and KRA PIN manually.',
    );
  } else {
    const member = await prisma.groupMember.findUnique({ where: { id: memberId } });
    if (member) {
      const data: Record<string, unknown> = {};
      if (jobseeker.kraPin) data.kraPin = jobseeker.kraPin;
      if (jobseeker.gender && !member.gender) data.gender = jobseeker.gender;
      if (jobseeker.dob && !member.dob) {
        const dob = new Date(jobseeker.dob);
        if (!Number.isNaN(dob.getTime())) data.dob = dob;
      }
      if (jobseeker.educationLevel && !member.educationLevel) {
        const mapped = mapNeaimsEducationLevel(jobseeker.educationLevel);
        data.educationLevel =
          mapped.educationLevel === 'Other'
            ? mapped.educationLevelOther || jobseeker.educationLevel
            : mapped.educationLevel || jobseeker.educationLevel;
      }
      if (jobseeker.passportNo && !member.passportNo) {
        data.passportNo = jobseeker.passportNo;
      }
      if (Object.keys(data).length) {
        await prisma.groupMember.update({ where: { id: memberId }, data });
        lines.push(`NEAIMS jobseeker filled: ${Object.keys(data).join(', ')}.`);
        if (data.kraPin) {
          lines.push('KRA PIN is from NEAIMS and stays locked.');
        }
      } else {
        lines.push('NEAIMS jobseeker profile found. Those fields were already filled.');
      }
    }
  }

  if (!placements.ok || placements.source === 'error') {
    lines.push('NEAIMS placement check did not complete. The application cannot continue until a placement is confirmed.');
  } else if (placements.placed) {
    lines.push(
      `NEAIMS placements: ${placements.placementsCount} placement${placements.placementsCount === 1 ? '' : 's'} for this National ID.`,
    );
  } else {
    lines.push(
      'NEAIMS placements: no placement for this National ID. A job placement must exist for every job seeker before the application can continue.',
    );
  }

  return lines.join(' ');
}

/** Write matching placement fields onto recruitment, same mapping as the recruitment form. */
export async function ensureRecruitmentFromPlacement(memberId: string): Promise<string> {
  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: { idNo: true },
  });
  if (!member?.idNo || member.idNo.startsWith('DRAFT-')) {
    return 'Enter a National ID before NEAIMS can check placements.';
  }

  const placements = await fetchJobseekerPlacements(member.idNo);
  if (!placements.ok || placements.source === 'error') {
    return 'NEAIMS placements could not be checked. A job placement must exist for every job seeker before the application can continue.';
  }
  if (!placements.placed) {
    return (
      'No NEAIMS placement was found for this National ID. ' +
      'A job placement must exist for every job seeker before the application can continue.'
    );
  }

  const preferred = pickPreferredPlacement(placements.placements);
  if (!preferred) {
    return 'NEAIMS reported a placement but returned no details. Enter recruitment details manually.';
  }

  const mapped = mapPlacementToRecruitment(preferred);
  const ind = await prisma.individualApplication.findUnique({ where: { memberId } });
  if (!ind) return 'Individual application was not found.';

  const data: Record<string, unknown> = {};
  for (const field of mapped.lockedFields) {
    const value = mapped.values[field];
    if (!value) continue;
    data[field] =
      field === 'monthlyRemuneration' ? new Prisma.Decimal(value) : value;
  }
  if (Object.keys(data).length) {
    await prisma.recruitmentData.upsert({
      where: { applicationId: ind.id },
      create: { applicationId: ind.id, ...data },
      update: data,
    });
  }

  const locked = mapped.lockedFields.join(', ') || 'none';
  const open = mapped.unmatchedFields.join(', ') || 'none';
  return `NEAIMS placement applied (${preferred.placementStatus || 'placed'}). Locked: ${locked}. Still to enter: ${open}.`;
}

export async function recruitmentFieldLocked(
  nationalId: string,
  fieldKey: string,
): Promise<boolean> {
  if (!(RECRUITMENT_KEYS as readonly string[]).includes(fieldKey)) return false;
  const locked = await neaimsLockedRecruitmentFields(nationalId);
  return locked.includes(fieldKey as RecruitmentPlacementField);
}

export async function matchLicensedAgencies(query: string): Promise<RecruitmentAgency[]> {
  const { results } = await searchAgenciesUnified(query);
  return results;
}
