import { PrescriptiveGuidance } from '@/components/prescriptive-guidance';
import { RecruitmentForm } from './recruitment-form';
import { getIndividualApplication } from '@/lib/data/applications';
import {
  fetchJobseekerPlacements,
  mapPlacementToRecruitment,
  pickPreferredPlacement,
  type RecruitmentPlacementField,
} from '@/lib/neaims-placements';
import { notFound } from 'next/navigation';

function formatDecimal(value: unknown): string | undefined {
  if (value == null) return undefined;
  const numeric =
    typeof value === 'object' && value !== null && 'toString' in value
      ? Number(value.toString())
      : Number(value);
  if (Number.isNaN(numeric)) return undefined;
  return numeric.toString();
}

export default async function RecruitmentPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);

  if (!app) {
    notFound();
  }

  const recruitment = app.recruitment;
  const savedDefaults = recruitment
    ? {
        agentNumber: recruitment.agentNumber ?? undefined,
        localAgentName: recruitment.localAgentName ?? undefined,
        employerAbroad: recruitment.employerAbroad ?? undefined,
        recruiterCode: recruitment.recruiterCode ?? undefined,
        countryOfDestination: recruitment.countryOfDestination ?? undefined,
        natureOfWork: recruitment.natureOfWork ?? undefined,
        durationType:
          recruitment.durationType === 'months' ||
          recruitment.durationType === 'years'
            ? recruitment.durationType
            : undefined,
        currency:
          recruitment.currency === 'KWD' ||
          recruitment.currency === 'AED' ||
          recruitment.currency === 'RUB'
            ? recruitment.currency
            : undefined,
        workDuration: recruitment.workDuration ?? undefined,
        monthlyRemuneration: formatDecimal(recruitment.monthlyRemuneration),
        convertedKesAmount: formatDecimal(recruitment.convertedKesAmount),
      }
    : {};

  const placementsResult = await fetchJobseekerPlacements(app.member.idNo);
  const preferred = placementsResult.placed
    ? pickPreferredPlacement(placementsResult.placements)
    : null;
  const mapped = preferred ? mapPlacementToRecruitment(preferred) : null;

  const defaultValues = { ...savedDefaults };
  const lockedFields: RecruitmentPlacementField[] = [];

  if (mapped) {
    for (const field of mapped.lockedFields) {
      const fromNeaims = mapped.values[field];
      if (!fromNeaims) continue;
      // Prefer NEAIMS when available so locked fields stay authoritative.
      defaultValues[field] = fromNeaims as never;
      lockedFields.push(field);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-4 pt-4">
        <PrescriptiveGuidance
          destinationCountry={defaultValues.countryOfDestination}
          hasPassport={Boolean(app.member.passportNo)}
          hasAgency={Boolean(defaultValues.localAgentName || defaultValues.employerAbroad)}
        />
      </div>
      <RecruitmentForm
      memberId={memberId}
      nationalId={app.member.idNo}
      defaultValues={defaultValues}
      lockedFields={lockedFields}
      unmatchedFields={mapped?.unmatchedFields ?? []}
      neaimsStatus={
        !placementsResult.ok || placementsResult.source === 'error'
          ? 'error'
          : placementsResult.placed
            ? 'placed'
            : 'not-placed'
      }
      placementsCount={placementsResult.placementsCount}
      placementStatus={
        preferred
          ? String(preferred.placementStatus || '').trim() || undefined
          : undefined
      }
    />
    </>
  );
}
