/**
 * Kenya DPA–aligned data processing consent for Wezesha Majuu applicants.
 * Cookie + localStorage cache consent; server API persists to data_consents when available.
 */

export const DATA_CONSENT_VERSION = 'majuu_dpa_v1';
export const DATA_CONSENT_COOKIE = 'majuu_data_consent_v1';
export const DATA_CONSENT_STORAGE_KEY = 'majuu_data_consent_v1';

/** Retention stated clearly for applicants (loan lifecycle + statutory buffer). */
export const DATA_RETENTION_YEARS_AFTER_CLOSURE = 7;

export type DataConsentRecord = {
  version: string;
  acceptedAt: string;
  userId?: string | null;
  applicationId?: string | null;
};

export const DATA_CONSENT_COPY = {
  title: 'Data processing consent',
  subtitle:
    'Before you continue your Wezesha Majuu application, please review how Uwezo Fund processes your personal data under the Kenya Data Protection Act, 2019.',
  whatCollectedHeading: 'What data is being collected?',
  whatCollected: [
    'Identity details (name, national ID / passport, date of birth, gender, KRA PIN)',
    'Contact details (mobile phone, email, physical location / ward)',
    'Supporting documents (ID scans, passport, bank details, guarantor and tripartite forms)',
    'Financial information (loan amounts, budgets, credit history, bank account details)',
    'Group membership and recruitment details (agency, destination country, nature of work)',
  ],
  howUsedHeading: 'How will the data collected be used?',
  howUsed: [
    'Processing and assessing your group and individual loan applications',
    'Eligibility checks, member verification, and compliance with Uwezo Fund rules',
    'Coordination with recruitment / labour-export pathways (visa, training, travel logistics) where applicable',
    'Disbursement, repayment tracking, and statutory reporting',
    'Aggregated analytics to improve programme delivery (not used to auto-reject without officer review)',
  ],
  howLongHeading: 'How long will the data be stored?',
  howLong: `Data is retained for the duration of the loan relationship and for up to ${DATA_RETENTION_YEARS_AFTER_CLOSURE} years after loan closure or application withdrawal, unless a longer period is required by Kenyan law or court order.`,
  acknowledge:
    'I understand the information above and consent to Uwezo Fund collecting and processing my personal data for these purposes.',
  continueLabel: 'I consent — continue application',
  requiredHint: 'You must consent before continuing the application.',
  assistiveNote:
    'This notice is required for transparency. Consent is stored securely and will not be asked again for this account once recorded.',
} as const;

export function parseConsentPayload(
  raw: string | null | undefined,
): DataConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DataConsentRecord;
    if (
      parsed?.version === DATA_CONSENT_VERSION &&
      typeof parsed.acceptedAt === 'string'
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function buildConsentPayload(input: {
  userId?: string | null;
  applicationId?: string | null;
}): DataConsentRecord {
  return {
    version: DATA_CONSENT_VERSION,
    acceptedAt: new Date().toISOString(),
    userId: input.userId ?? null,
    applicationId: input.applicationId ?? null,
  };
}

export function consentStorageKey(userId?: string | null): string {
  return userId
    ? `${DATA_CONSENT_STORAGE_KEY}:${userId}`
    : DATA_CONSENT_STORAGE_KEY;
}
