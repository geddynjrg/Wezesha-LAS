/**
 * NEAIMS / Kazi254 jobseeker placements via loans-admin Drupal REST proxy.
 */

export type NeaimsPlacement = {
  agencyName?: string;
  agencyKraPin?: string;
  agencyRegistrationNumber?: string;
  agentNumber?: string;
  advertTitle?: string;
  position?: string;
  natureOfWork?: string;
  employerAbroad?: string;
  employerCode?: string;
  countryOfDestination?: string;
  durationMonths?: number | string;
  currency?: string;
  grossPay?: number | string;
  paymentFrequency?: string;
  placementStatus?: string;
  [key: string]: unknown;
};

export type NeaimsPlacementsResult = {
  ok: boolean;
  placed: boolean;
  nationalId: string;
  message?: string;
  placementsCount: number;
  placements: NeaimsPlacement[];
  source: 'loans-admin' | 'error' | 'skipped';
};

export const RECRUITMENT_PLACEMENT_FIELDS = [
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

export type RecruitmentPlacementField =
  (typeof RECRUITMENT_PLACEMENT_FIELDS)[number];

export const RECRUITMENT_FIELD_LABELS: Record<RecruitmentPlacementField, string> =
  {
    agentNumber: 'Agent Number (NEA)',
    localAgentName: 'Name of Local Recruitment Agent',
    employerAbroad: 'Employer Abroad',
    recruiterCode: 'Employer Code',
    countryOfDestination: 'Country of Destination',
    natureOfWork: 'Nature of Work',
    durationType: 'Duration Type',
    workDuration: 'Duration/Tenure of Work',
    currency: 'Currency',
    monthlyRemuneration: 'Monthly Remuneration (Gross)',
  };

/** Currencies the recruitment form currently accepts. */
export const RECRUITMENT_CURRENCIES = ['KWD', 'AED', 'RUB'] as const;

export type RecruitmentFromPlacement = {
  values: Partial<Record<RecruitmentPlacementField, string>>;
  lockedFields: RecruitmentPlacementField[];
  unmatchedFields: RecruitmentPlacementField[];
};

const PLACEMENTS_URL =
  process.env.NEAMIS_PLACEMENTS_URL ||
  process.env.NEAIMS_PLACEMENTS_URL ||
  `${(
    process.env.ADMIN_DOMAIN ||
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN ||
    'https://loans-admin.uwezo.go.ke'
  ).replace(/\/$/, '')}/api/v1/integrations/jobseeker/placements?_format=json`;

const PREFERRED_STATUSES = [
  'HIRED',
  'ATTESTING',
  'OFFERED',
  'SHORTLISTED',
  'PLACED',
];

function asTrimmedString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function normalizePlacement(raw: unknown): NeaimsPlacement {
  if (!raw || typeof raw !== 'object') return {};
  return raw as NeaimsPlacement;
}

export function pickPreferredPlacement(
  placements: NeaimsPlacement[],
): NeaimsPlacement | null {
  if (!placements.length) return null;
  const ranked = [...placements].sort((a, b) => {
    const aIdx = PREFERRED_STATUSES.indexOf(
      asTrimmedString(a.placementStatus).toUpperCase(),
    );
    const bIdx = PREFERRED_STATUSES.indexOf(
      asTrimmedString(b.placementStatus).toUpperCase(),
    );
    const aRank = aIdx === -1 ? 99 : aIdx;
    const bRank = bIdx === -1 ? 99 : bIdx;
    return aRank - bRank;
  });
  return ranked[0] ?? null;
}

/**
 * Map a NEAIMS placement onto recruitment form fields.
 * Matching values are returned for autofill/lock; missing or incompatible
 * values are listed in unmatchedFields so the UI can alert and keep them editable.
 */
export function mapPlacementToRecruitment(
  placement: NeaimsPlacement,
): RecruitmentFromPlacement {
  const values: Partial<Record<RecruitmentPlacementField, string>> = {};
  const lockedFields: RecruitmentPlacementField[] = [];
  const unmatchedFields: RecruitmentPlacementField[] = [];

  const setOrUnmatched = (
    field: RecruitmentPlacementField,
    value: string | undefined,
  ) => {
    const trimmed = (value ?? '').trim();
    if (trimmed) {
      values[field] = trimmed;
      lockedFields.push(field);
    } else {
      unmatchedFields.push(field);
    }
  };

  setOrUnmatched('agentNumber', asTrimmedString(placement.agentNumber));
  setOrUnmatched('localAgentName', asTrimmedString(placement.agencyName));
  setOrUnmatched('employerAbroad', asTrimmedString(placement.employerAbroad));
  setOrUnmatched('recruiterCode', asTrimmedString(placement.employerCode));
  setOrUnmatched(
    'countryOfDestination',
    asTrimmedString(placement.countryOfDestination),
  );

  const nature =
    asTrimmedString(placement.natureOfWork) ||
    asTrimmedString(placement.position) ||
    asTrimmedString(placement.advertTitle);
  setOrUnmatched('natureOfWork', nature);

  const durationRaw = placement.durationMonths;
  const durationNum =
    typeof durationRaw === 'number'
      ? durationRaw
      : Number(asTrimmedString(durationRaw));
  if (!Number.isNaN(durationNum) && durationNum > 0) {
    values.durationType = 'months';
    values.workDuration = String(durationNum);
    lockedFields.push('durationType', 'workDuration');
  } else {
    unmatchedFields.push('durationType', 'workDuration');
  }

  const currency = asTrimmedString(placement.currency).toUpperCase();
  if ((RECRUITMENT_CURRENCIES as readonly string[]).includes(currency)) {
    values.currency = currency;
    lockedFields.push('currency');
  } else {
    unmatchedFields.push('currency');
  }

  const grossRaw = placement.grossPay;
  const grossNum =
    typeof grossRaw === 'number'
      ? grossRaw
      : Number(asTrimmedString(grossRaw).replace(/,/g, ''));
  if (!Number.isNaN(grossNum) && grossNum > 0) {
    values.monthlyRemuneration = String(grossNum);
    lockedFields.push('monthlyRemuneration');
  } else {
    unmatchedFields.push('monthlyRemuneration');
  }

  return {
    values,
    lockedFields: [...new Set(lockedFields)],
    unmatchedFields: [...new Set(unmatchedFields)],
  };
}

export async function fetchJobseekerPlacements(
  nationalId: string,
): Promise<NeaimsPlacementsResult> {
  const id = nationalId.trim().replace(/\s+/g, '');
  if (id.length < 5) {
    return {
      ok: false,
      placed: false,
      nationalId: id,
      placementsCount: 0,
      placements: [],
      source: 'skipped',
      message: 'National ID too short',
    };
  }

  try {
    const res = await fetch(PLACEMENTS_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nationalId: id }),
      signal: AbortSignal.timeout(25000),
      cache: 'no-store',
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      count?: number;
      data?: { placements?: unknown[] } | null;
    } | null;

    if (!data) {
      return {
        ok: false,
        placed: false,
        nationalId: id,
        placementsCount: 0,
        placements: [],
        source: 'error',
        message: `Placements HTTP ${res.status}`,
      };
    }

    const placements = Array.isArray(data.data?.placements)
      ? data.data!.placements!.map(normalizePlacement)
      : [];
    const count =
      typeof data.count === 'number' ? data.count : placements.length;
    const placed = Boolean(data.success) && placements.length > 0 && count > 0;

    return {
      ok: true,
      placed,
      nationalId: id,
      placementsCount: placements.length,
      placements,
      source: 'loans-admin',
      message: data.message,
    };
  } catch (e) {
    return {
      ok: false,
      placed: false,
      nationalId: id,
      placementsCount: 0,
      placements: [],
      source: 'error',
      message: e instanceof Error ? e.message : 'Placements lookup failed',
    };
  }
}
