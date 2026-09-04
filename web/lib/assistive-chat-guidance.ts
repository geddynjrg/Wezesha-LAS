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

export const MAJUU_APPLY_MENU = [
  {
    id: 'apply',
    label: 'Apply for a loan',
    reply:
      'You can start or continue a Wezesha Majuu application:\n' +
      '• Group chair: /apply/create\n' +
      '• Individual member: /apply/individual\n' +
      '• Dashboard: /dashboard\n\n' +
      'I can guide document uploads here. Reply with: ID, KRA, or passport — then attach the file. ' +
      'Or open the Documents step in the apply wizard for the full checklist.',
  },
  {
    id: 'status',
    label: 'Check status of loan application',
    reply:
      'Send your acknowledgment / reference number (for example UWZ-… or UWZ-…-IDNO). ' +
      'I will look up status for applications linked to your account only.',
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
