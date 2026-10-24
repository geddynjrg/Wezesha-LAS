/** Plain-language status + apply guidance for Majuu assistive chat. */

export const MAJUU_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft — still being completed',
  GROUP_SUBMITTED: 'Group submitted — members can start individual applications',
  SUBMITTED: 'Submitted — waiting for constituency / HQ review',
  UNDER_REVIEW: 'Under review by officers',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  OFFER_ISSUED: 'Offer issued',
  PAYMENT_TRACKING: 'Payment / disbursement tracking',
};

export function plainMajuuStatus(status: string | null | undefined): string {
  if (!status) return 'Status not available yet';
  return MAJUU_STATUS_LABELS[status] || status.replace(/_/g, ' ').toLowerCase();
}

export type ChatQuickReply = { id: string; label: string; value: string };

export const MAIN_MENU_REPLIES: ChatQuickReply[] = [
  { id: 'apply', label: '1. Apply for a Loan', value: 'apply' },
  {
    id: 'status',
    label: '2. Check status of loan application',
    value: 'status',
  },
  {
    id: 'new_app',
    label: '3. New application',
    value: 'apply',
  },
  { id: 'logout', label: '4. Log out', value: 'logout' },
];

export const LOGOUT_CONFIRM_REPLIES: ChatQuickReply[] = [
  { id: 'logout-yes', label: 'Yes', value: 'logout_yes' },
  { id: 'logout-no', label: 'No', value: 'logout_no' },
];

export const APPLY_TYPE_REPLIES: ChatQuickReply[] = [
  {
    id: 'apply-group',
    label: 'Apply for a loan - Group loan',
    value: 'apply_group',
  },
  {
    id: 'apply-individual',
    label: 'Apply for a loan - Individual Application',
    value: 'apply_individual',
  },
];

export const STATUS_TYPE_REPLIES: ChatQuickReply[] = [
  {
    id: 'status-group',
    label: 'Apply for a loan - Group loan',
    value: 'status_group',
  },
  {
    id: 'status-individual',
    label: 'Apply for a loan - Individual Application',
    value: 'status_individual',
  },
];

export const MAJUU_APPLY_MENU = [
  {
    id: 'apply',
    label: 'Apply for a loan',
    reply:
      'New Application\n\n' +
      '1. Apply for a loan - Group loan\n' +
      '2. Apply for a loan - Individual Application\n\n' +
      'The same steps apply as the existing group and individual applications. An in-progress draft is offered before a new one is started.',
  },
  {
    id: 'status',
    label: 'Check status of loan application',
    reply:
      'Check status of a loan application.\n\n' +
      '1. Apply for a loan - Group loan\n' +
      '2. Apply for a loan - Individual Application\n\n' +
      'Only applications of that type on your account are listed.',
  },
] as const;

export const MAJUU_DOC_STEPS = [
  {
    key: 'national_id',
    label: 'National ID',
    tip: 'Upload a clear colour scan of both sides if possible. Full page, no glare.',
  },
  {
    key: 'kra_pin',
    label: 'KRA PIN certificate',
    tip: 'Upload the official KRA PIN PDF or a clear photo of the certificate.',
  },
  {
    key: 'passport',
    label: 'Passport',
    tip: 'Upload the bio-data page. Validity should cover your travel plans.',
  },
] as const;
