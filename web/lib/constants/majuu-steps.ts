import type { Step } from '@workspace/ui/components/stepper';

export const GROUP_STEPS: Step[] = [
  { index: 1, title: 'Group Information', path: '/group-information' },
  { index: 2, title: 'Membership Profile', path: '/membership' },
  { index: 3, title: 'Brief Background', path: '/background' },
  { index: 4, title: 'Member Details', path: '/member-details' },
  { index: 5, title: 'Loan Amount', path: '/loan-amount' },
  { index: 6, title: 'Terms & Conditions', path: '/terms' },
  { index: 7, title: 'Bank Account', path: '/bank' },
  { index: 8, title: 'Repayment Commitment', path: '/guarantee' },
  { index: 9, title: 'Upload Documents', path: '/documents' },
];

export const INDIVIDUAL_STEPS: Step[] = [
  { index: 1, title: 'Individual Information', path: '/individual-information' },
  { index: 2, title: 'Location', path: '/location' },
  { index: 3, title: 'Guarantor', path: '/guarantor' },
  { index: 4, title: 'Recruitment Details', path: '/recruitment' },
  { index: 5, title: 'Budget Breakdown', path: '/budget' },
  { index: 6, title: 'Bank Account', path: '/bank' },
  { index: 7, title: 'Credit History', path: '/credit-history' },
  { index: 8, title: 'Signature', path: '/signature' },
  { index: 9, title: 'Tripartite Agreement', path: '/tripartite' },
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const FILE_ACCEPT = {
  'image/*': ['.jpg', '.jpeg', '.png'],
  'application/pdf': ['.pdf'],
};

export function generateAcknowledgmentNumber(prefix = 'UWZ') {
  return `${prefix}-${Date.now()}`;
}

export function getGroupStepPath(progress: number): string {
  const stepIndex = Math.max(0, Math.min(progress - 1, GROUP_STEPS.length - 1));
  return GROUP_STEPS[stepIndex]?.path ?? GROUP_STEPS[0]!.path!;
}

export function getGroupApplicationUrl(
  id: string,
  progress: number,
  status: string,
): string {
  if (status === 'DRAFT') {
    return `/apply/group/${id}${getGroupStepPath(progress)}`;
  }

  return `/apply/group/${id}/complete`;
}

export function getGroupProgressLabel(progress: number): string {
  const stepIndex = Math.max(0, Math.min(progress - 1, GROUP_STEPS.length - 1));
  const step = GROUP_STEPS[stepIndex];
  return step ? `Step ${step.index} of ${GROUP_STEPS.length}: ${step.title}` : '';
}
