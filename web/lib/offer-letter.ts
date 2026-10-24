export type OfferLetterAction = 'sign' | 'download';

export type OfferStep = {
  key: string;
  label: string;
  path: string;
};

type MaybeAmount = { toString(): string } | number | string | null | undefined;

export function offerLetterAction(app: {
  exitedCountry?: boolean | null;
  loanAmountApproved?: boolean | null;
  offerLetterSignedAt?: Date | string | null;
} | null | undefined): OfferLetterAction | null {
  if (!app?.exitedCountry || !app.loanAmountApproved) return null;
  return app.offerLetterSignedAt ? 'download' : 'sign';
}

export function missingOfferSteps(app: {
  location?: { county?: string | null } | null;
  guarantors?: readonly { id?: string }[] | null;
  recruitment?: {
    countryOfDestination?: string | null;
    employerAbroad?: string | null;
    natureOfWork?: string | null;
  } | null;
  budgetItems?: readonly { id?: string }[] | null;
  bankAccount?: { accountNumber?: string | null } | null;
  signature?: { digitalSignature?: string | null } | null;
  tripartiteAccepted?: boolean | null;
} | null | undefined): OfferStep[] {
  if (!app) return [];

  const missing: OfferStep[] = [];
  if (!app.location?.county?.trim()) {
    missing.push({ key: 'location', label: 'Location', path: '/location' });
  }
  if (!app.guarantors?.length) {
    missing.push({ key: 'guarantors', label: 'Guarantors', path: '/guarantor' });
  }
  const recruitment = app.recruitment;
  if (
    !recruitment?.countryOfDestination?.trim() &&
    !recruitment?.employerAbroad?.trim() &&
    !recruitment?.natureOfWork?.trim()
  ) {
    missing.push({ key: 'recruitment', label: 'Recruitment', path: '/recruitment' });
  }
  if (!app.budgetItems?.length) {
    missing.push({ key: 'budget', label: 'Budget items', path: '/budget' });
  }
  if (!app.bankAccount?.accountNumber?.trim()) {
    missing.push({ key: 'bank', label: 'Bank account', path: '/bank' });
  }
  if (!app.signature?.digitalSignature) {
    missing.push({ key: 'signature', label: 'Signature', path: '/signature' });
  }
  if (!app.tripartiteAccepted) {
    missing.push({ key: 'tripartite', label: 'Tripartite agreement', path: '/tripartite' });
  }
  return missing;
}

export function nextOfferStepUrl(memberId: string, app: Parameters<typeof missingOfferSteps>[0]): string {
  const next = missingOfferSteps(app)[0];
  if (!next) return `/apply/individual/${memberId}/offer-letter`;
  return `/apply/individual/${memberId}${next.path}`;
}

export function moneyAmount(value: MaybeAmount): number {
  if (value == null || value === '') return 0;
  const n = Number(typeof value === 'object' ? value.toString() : value);
  return Number.isFinite(n) ? n : 0;
}

export function formatKes(amount: number): string {
  return amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function offerBreakdown(app: {
  airTicketAmount?: MaybeAmount;
  visaApplicationAmount?: MaybeAmount;
  upkeepTradeAmount?: MaybeAmount;
  awardAmount?: MaybeAmount;
}) {
  const airTicket = moneyAmount(app.airTicketAmount);
  const visaApplication = moneyAmount(app.visaApplicationAmount);
  const upkeepTrade = moneyAmount(app.upkeepTradeAmount);
  const parts = airTicket + visaApplication + upkeepTrade;
  const total = parts > 0 ? parts : moneyAmount(app.awardAmount);

  return { airTicket, visaApplication, upkeepTrade, total };
}
