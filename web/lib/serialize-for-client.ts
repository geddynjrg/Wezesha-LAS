export function decimalToString(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object' && 'toString' in value) {
    return (value as { toString(): string }).toString();
  }

  return String(value);
}

export interface ClientMemberRow {
  name: string;
  idNo: string;
  mobile: string;
  email: string;
  passportNo: string;
  purpose: string;
  amount: string;
}

export interface ClientMemberSummary {
  id: string;
  name: string;
  idNo: string;
  passportNo: string;
  email: string;
  mobile: string;
  amount: string;
  amountRepaid: string;
  signature: string | null;
  otpVerified: boolean;
  otpStatus: string;
}

export function emptyClientMemberRow(): ClientMemberRow {
  return {
    name: '',
    idNo: '',
    mobile: '',
    email: '',
    passportNo: '',
    purpose: '',
    amount: '',
  };
}

export function toClientMemberRow(
  member?: {
    name?: string | null;
    idNo?: string | null;
    mobile?: string | null;
    email?: string | null;
    passportNo?: string | null;
    purpose?: string | null;
    amount?: unknown;
  } | null,
): ClientMemberRow {
  if (!member) {
    return emptyClientMemberRow();
  }

  return {
    name: member.name ?? '',
    idNo: member.idNo ?? '',
    mobile: member.mobile ?? '',
    email: member.email ?? '',
    passportNo: member.passportNo ?? '',
    purpose: member.purpose ?? '',
    amount: decimalToString(member.amount),
  };
}

export function toClientMemberSummary(
  member: {
    id: string;
    name: string;
    idNo?: string | null;
    passportNo?: string | null;
    email?: string | null;
    mobile?: string | null;
    amount?: unknown;
    amountRepaid?: unknown;
    signature?: string | null;
    otpVerified?: boolean;
    otpStatus?: string;
  },
): ClientMemberSummary {
  return {
    id: member.id,
    name: member.name,
    idNo: member.idNo ?? '',
    passportNo: member.passportNo ?? '',
    email: member.email ?? '',
    mobile: member.mobile ?? '',
    amount: decimalToString(member.amount),
    amountRepaid: decimalToString(member.amountRepaid),
    signature: member.signature ?? null,
    otpVerified: member.otpVerified ?? false,
    otpStatus: member.otpStatus ?? 'PENDING',
  };
}
