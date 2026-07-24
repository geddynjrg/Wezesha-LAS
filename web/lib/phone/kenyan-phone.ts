/** Kenyan mobile operator prefixes (Safaricom, Airtel, Telkom). */
const KENYAN_MOBILE_PREFIXES = new Set([
  '070',
  '071',
  '072',
  '073',
  '074',
  '075',
  '076',
  '077',
  '078',
  '079',
  '010',
  '011',
  '012',
]);

/** Normalize to 254XXXXXXXXX for SMS API and database storage. */
export function normalizeKenyanPhoneForApi(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = `254${digits.slice(1)}`;
  } else if (digits.startsWith('254')) {
    // already international
  } else if (digits.length === 9 && /^[17]/.test(digits)) {
    digits = `254${digits}`;
  }

  return digits;
}

/** Format for user-friendly local display: 07XX XXX XXX */
export function formatKenyanPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  let local = '';

  if (digits.startsWith('254')) {
    local = `0${digits.slice(3, 12)}`;
  } else if (digits.startsWith('0')) {
    local = digits.slice(0, 10);
  } else if (/^[17]/.test(digits)) {
    local = `0${digits}`.slice(0, 10);
  } else {
    local = digits.slice(0, 10);
  }

  if (local.length <= 4) return local;
  if (local.length <= 7) return `${local.slice(0, 4)} ${local.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 10)}`;
}

export function isValidKenyanMobile(phone: string): boolean {
  const normalized = normalizeKenyanPhoneForApi(phone);

  if (!/^254[17]\d{8}$/.test(normalized)) {
    return false;
  }

  const localPrefix = `0${normalized.slice(3, 5)}`;
  return KENYAN_MOBILE_PREFIXES.has(localPrefix);
}

export function digitsFromKenyanPhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 12);
}

const KENYA_LOCAL_PHONE_REGEX = /^[17]\d{8}$/;

/** Normalize to 9-digit local number (no country code). */
export function normalizeKenyanPhoneLocal(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('254') && digits.length === 12) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }

  if (!KENYA_LOCAL_PHONE_REGEX.test(digits)) {
    return null;
  }

  return digits;
}

export function isValidKenyanPhoneNumber(phone: string): boolean {
  return normalizeKenyanPhoneLocal(phone) !== null;
}

/** Format as +254XXXXXXXXX for auth APIs. */
export function formatKenyanPhoneForApi(phone: string): string | null {
  const local = normalizeKenyanPhoneLocal(phone);
  return local ? `+254${local}` : null;
}
