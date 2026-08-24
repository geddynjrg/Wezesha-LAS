export const GROUP_BANK_OPTIONS = [
  'Equity Bank',
  'Family Bank',
  'ABSA Bank',
  'Co-operative Bank',
  'KCB Bank',
  'UBA Bank',
  'SBM Bank',
  'I&M Bank',
  'National Bank',
  'Diamond Trust Bank',
  'Standard Chartered Bank',
  'Stanbic Bank',
  'NCBA Bank',
] as const;

export type GroupBankName = (typeof GROUP_BANK_OPTIONS)[number];
