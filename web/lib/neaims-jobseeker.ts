/**
 * NEAIMS / Kazi254 jobseeker get via loans-admin Drupal REST proxy.
 */

export type NeaimsJobseeker = {
  nationalId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  kraPin?: string;
  email?: string;
  mobileNumber?: string;
  passportNo?: string | null;
  dob?: string;
  gender?: string;
  educationLevel?: string;
  [key: string]: unknown;
};

export type NeaimsJobseekerResult = {
  ok: boolean;
  nationalId: string;
  kraPin: string | null;
  passportNo: string | null;
  gender: string | null;
  dob: string | null;
  educationLevel: string | null;
  jobseeker: NeaimsJobseeker | null;
  message?: string;
  source: 'loans-admin' | 'error' | 'skipped';
};

const JOBSEEKER_GET_URL =
  process.env.NEAMIS_JOBSEEKER_GET_URL ||
  process.env.NEAIMS_JOBSEEKER_GET_URL ||
  `${(
    process.env.ADMIN_DOMAIN ||
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN ||
    'https://loans-admin.uwezo.go.ke'
  ).replace(/\/$/, '')}/api/v1/integrations/jobseeker/get?_format=json`;

function readNestedString(
  data: unknown,
  keys: string[],
): string | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : null;

  for (const key of keys) {
    const candidates = [nested?.[key], root[key]];
    for (const raw of candidates) {
      if (raw == null) continue;
      if (typeof raw !== 'string' && typeof raw !== 'number') continue;
      const value = String(raw).trim();
      if (!value || value.toLowerCase() === 'null') continue;
      return value;
    }
  }
  return null;
}

export function normalizeNeaimsGender(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === 'male' || v === 'm') return 'Male';
  if (v === 'female' || v === 'f') return 'Female';
  return null;
}

/** YYYY-MM-DD for HTML date inputs, or null if unusable. */
export function normalizeNeaimsDob(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) {
    const dd = dmy[1].padStart(2, '0');
    const mm = dmy[2].padStart(2, '0');
    return `${dmy[3]}-${mm}-${dd}`;
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Map NEAIMS education strings onto Majuu options:
 * KCPE | KCSE | None | University | Other (with free text).
 */
export function mapNeaimsEducationLevel(raw: string | null | undefined): {
  educationLevel: 'KCPE' | 'KCSE' | 'None' | 'University' | 'Other' | null;
  educationLevelOther: string;
} {
  if (!raw?.trim()) {
    return { educationLevel: null, educationLevelOther: '' };
  }
  const value = raw.trim();
  const lower = value.toLowerCase();

  if (lower === 'kcpe') return { educationLevel: 'KCPE', educationLevelOther: '' };
  if (lower === 'kcse') return { educationLevel: 'KCSE', educationLevelOther: '' };
  if (lower === 'none' || lower === 'n/a' || lower === 'na') {
    return { educationLevel: 'None', educationLevelOther: '' };
  }
  if (lower === 'university') {
    return { educationLevel: 'University', educationLevelOther: '' };
  }
  if (lower === 'other') {
    return { educationLevel: 'Other', educationLevelOther: '' };
  }

  if (
    /bachelor|masters?|master'?s|phd|doctor|degree|universit|diploma|college|undergraduate|postgraduate/.test(
      lower,
    )
  ) {
    return { educationLevel: 'University', educationLevelOther: '' };
  }

  return { educationLevel: 'Other', educationLevelOther: value };
}

function emptyResult(
  id: string,
  source: NeaimsJobseekerResult['source'],
  message?: string,
): NeaimsJobseekerResult {
  return {
    ok: false,
    nationalId: id,
    kraPin: null,
    passportNo: null,
    gender: null,
    dob: null,
    educationLevel: null,
    jobseeker: null,
    source,
    message,
  };
}

export async function fetchJobseekerGet(
  nationalId: string,
): Promise<NeaimsJobseekerResult> {
  const id = nationalId.trim().replace(/\s+/g, '');
  if (id.length < 5) {
    return emptyResult(id, 'skipped', 'National ID too short');
  }

  try {
    const res = await fetch(JOBSEEKER_GET_URL, {
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
      data?: NeaimsJobseeker | null;
    } | null;

    if (!data) {
      return emptyResult(id, 'error', `Jobseeker HTTP ${res.status}`);
    }

    const jobseeker =
      data.data && typeof data.data === 'object' ? data.data : null;
    const kraPin = readNestedString(data, ['kraPin', 'kra_pin']);
    const passportNo = readNestedString(data, [
      'passportNo',
      'passport_no',
      'passportNumber',
    ]);
    const gender = normalizeNeaimsGender(
      readNestedString(data, ['gender', 'sex']),
    );
    const dob = normalizeNeaimsDob(readNestedString(data, ['dob', 'dateOfBirth', 'date_of_birth']));
    const educationLevel = readNestedString(data, [
      'educationLevel',
      'education_level',
      'highestEducation',
    ]);

    return {
      ok:
        Boolean(data.success) ||
        kraPin != null ||
        passportNo != null ||
        gender != null ||
        dob != null ||
        educationLevel != null,
      nationalId: id,
      kraPin,
      passportNo,
      gender,
      dob,
      educationLevel,
      jobseeker,
      source: 'loans-admin',
      message: data.message,
    };
  } catch (e) {
    return emptyResult(
      id,
      'error',
      e instanceof Error ? e.message : 'Jobseeker lookup failed',
    );
  }
}
