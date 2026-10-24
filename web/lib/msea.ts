const MSEA_API_URL =
  process.env.MSEA_API_URL ?? 'https://msea.ecitizen.go.ke/api/businesses';
const MSEA_USERNAME = process.env.MSEA_USERNAME ?? 'wezesha';
const MSEA_PASSWORD = process.env.MSEA_PASSWORD ?? '';
const NAIROBI_TZ = 'Africa/Nairobi';

function parseNairobiMidnight(dateStr: string): Date | null {
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  return new Date(`${trimmed}T00:00:00+03:00`);
}

function formatNairobiDate(dateStr: string): string {
  const date = parseNairobiMidnight(dateStr);
  if (!date) {
    return dateStr;
  }

  return new Intl.DateTimeFormat('en-KE', {
    timeZone: NAIROBI_TZ,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getMseaResumeDate(): string | null {
  const resumeDate = process.env.MSEA_API_RESUME_DATE?.trim();
  if (!resumeDate) {
    return null;
  }

  return parseNairobiMidnight(resumeDate) ? resumeDate : null;
}

export function isMseaApiEnabled(): boolean {
  const resumeDate = getMseaResumeDate();
  if (resumeDate) {
    const resumeAt = parseNairobiMidnight(resumeDate);
    if (resumeAt && Date.now() < resumeAt.getTime()) {
      return false;
    }
  }

  const enabled = process.env.MSEA_API_ENABLED?.trim().toLowerCase();
  if (enabled === 'false' || enabled === '0' || enabled === 'no') {
    return false;
  }

  return true;
}

export function getMseaDisabledMessage(): string {
  const resumeDate = getMseaResumeDate();
  if (resumeDate && !isMseaApiEnabled()) {
    return `MSEA registration lookup is temporarily unavailable for scheduled maintenance and will resume on ${formatNairobiDate(resumeDate)} (East Africa Time). Please enter your group details manually.`;
  }

  return 'MSEA registration service is unavailable. Please enter your group details manually.';
}

export interface MseaPartner {
  name?: string;
  id_number?: string;
  phone_number?: string;
  type?: string;
  id_type?: string;
}

/** True when MSEA partner type indicates the group chair / lead official. */
export function isMseaChairPartner(partner: MseaPartner): boolean {
  const type = `${partner.type || ''}`.toLowerCase();
  return /chair|chairman|chairperson|official|proprietor|director|leader|president/.test(
    type,
  );
}

/** Partners flagged as chair/official in the MSEA registration JSON. */
export function findMseaChairPartners(partners: MseaPartner[]): MseaPartner[] {
  return (partners || []).filter(isMseaChairPartner);
}

/**
 * Strip all whitespace (leading, trailing, and within) and uppercase.
 * e.g. "RA- 77SR67" → "RA-77SR67", " ASS RA-X " → "ASSRA-X"
 */
export function normalizeMseaRegistrationNumber(registrationNumber: string): string {
  // Remove all whitespace (leading/trailing/within), e.g. "RA- 77SR67" → "RA-77SR67"
  let cleaned = `${registrationNumber || ''}`.replace(/\s+/g, '').toUpperCase();
  // MSEA stores bare RA-/WYG- numbers — "ASS RA-…" / "ASS-RA-…" must become "RA-…"
  cleaned = cleaned.replace(/^ASS-?/, '');
  return cleaned;
}

interface MseaBusinessRecord {
  business_name?: string;
  registration_number?: string;
  registration_date?: string;
  status?: string;
  partners?: MseaPartner[];
}

interface MseaLookupResponse {
  count?: number;
  records?: MseaBusinessRecord[];
}

function getAuthHeader(): string | null {
  if (!MSEA_PASSWORD) {
    return null;
  }

  const credentials = Buffer.from(`${MSEA_USERNAME}:${MSEA_PASSWORD}`).toString(
    'base64',
  );
  return `Basic ${credentials}`;
}

export async function checkMseaReachable(): Promise<boolean> {
  if (!isMseaApiEnabled()) {
    return false;
  }

  const authorization = getAuthHeader();
  if (!authorization) {
    return false;
  }

  try {
    const url = new URL(MSEA_API_URL);
    url.searchParams.set('registration_number', '__healthcheck__');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return false;
    }

    await response.json().catch(() => ({}));
    return response.status < 500;
  } catch {
    return false;
  }
}

export async function lookupMseaBusiness(registrationNumber: string): Promise<{
  partners: MseaPartner[];
  totalMembers: number;
  business_name?: string;
  registration_number?: string;
  registration_date?: string;
} | null> {
  if (!isMseaApiEnabled()) {
    return null;
  }

  const trimmed = normalizeMseaRegistrationNumber(registrationNumber);
  if (!trimmed) {
    return null;
  }

  const authorization = getAuthHeader();
  if (!authorization) {
    return null;
  }

  try {
    const url = new URL(MSEA_API_URL);
    url.searchParams.set('registration_number', trimmed);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: authorization,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    const data = (await response.json()) as MseaLookupResponse;
    if (response.status !== 200 || data.count !== 1 || !data.records?.length) {
      return null;
    }

    const record = data.records[0];
    if (record.status && record.status !== 'registered') {
      return null;
    }

    const partners = record.partners ?? [];
    return {
      partners,
      totalMembers: partners.length,
      business_name: record.business_name,
      registration_number: normalizeMseaRegistrationNumber(
        record.registration_number || trimmed,
      ),
      registration_date: record.registration_date,
    };
  } catch {
    return null;
  }
}
