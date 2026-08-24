import { GROUP_STEPS, INDIVIDUAL_STEPS } from '@/lib/constants/majuu-steps';

export type GuidanceStepKey = string;

export type StepGuidance = {
  key: GuidanceStepKey;
  title: string;
  prepare: string[];
  commonMistakes: string[];
};

const GROUP_GUIDANCE: Record<string, Omit<StepGuidance, 'key' | 'title'>> = {
  'group-information': {
    prepare: [
      'Have your MSEA registration certificate ready.',
      'Confirm the group name matches the certificate exactly.',
      'Know your county, constituency, ward, and cluster category.',
    ],
    commonMistakes: [
      'Typing a different group name than on the MSEA certificate.',
      'Selecting the wrong constituency for the group’s location.',
      'Leaving registration number or date blank.',
    ],
  },
  membership: {
    prepare: [
      'Count male, female, and persons with disability members accurately.',
      'Totals must match the members you will list later.',
    ],
    commonMistakes: [
      'Member totals that do not add up.',
      'Under-counting members so later forms do not match.',
    ],
  },
  background: {
    prepare: [
      'Describe the group purpose in clear, plain language.',
      'List proposed activities that match the loan purpose.',
    ],
    commonMistakes: [
      'Copy-paste text that does not match this group.',
      'Vague activities with no link to migrant worker support.',
    ],
  },
  'member-details': {
    prepare: [
      'Collect each member’s National ID and mobile number.',
      'Use the same phone number as on each member’s MSEA-related records where applicable.',
      'Confirm loan amounts stay within individual and group limits.',
    ],
    commonMistakes: [
      'Reusing the same National ID for two members.',
      'Wrong mobile digits that block OTP or SMS later.',
      'Exceeding per-member or group loan caps.',
    ],
  },
  'loan-amount': {
    prepare: [
      'Review the total calculated from member amounts.',
      'Ensure the group can justify the requested total.',
    ],
    commonMistakes: [
      'Changing amounts here without updating member details.',
    ],
  },
  terms: {
    prepare: [
      'Read the group loan terms carefully before accepting.',
    ],
    commonMistakes: [
      'Accepting without sharing terms with group leaders.',
    ],
  },
  bank: {
    prepare: [
      'Use the group bank account (not a personal account).',
      'Account name must match the registered group name.',
      'Have bank name, branch, and account number ready.',
    ],
    commonMistakes: [
      'Entering a personal account instead of the group account.',
      'Account name that does not match the group name.',
    ],
  },
  guarantee: {
    prepare: [
      'Confirm members understand the repayment commitment.',
    ],
    commonMistakes: [
      'Skipping acknowledgment of collective repayment responsibility.',
    ],
  },
  documents: {
    prepare: [
      'Upload clear scans or photos of every required document.',
      'Group certificate, group KRA, expression of interest, and each member’s ID, passport photo, and KRA.',
    ],
    commonMistakes: [
      'Blurry or cropped ID images.',
      'Missing one member’s documents before submit.',
    ],
  },
};

const INDIVIDUAL_GUIDANCE: Record<string, Omit<StepGuidance, 'key' | 'title'>> = {
  'individual-information': {
    prepare: [
      'Confirm your name and National ID shown are correct.',
      'Have your KRA PIN and education details ready.',
    ],
    commonMistakes: [
      'Entering a KRA PIN that does not match your certificate.',
      'Leaving dependants or postal details blank.',
    ],
  },
  location: {
    prepare: [
      'Use your current residential location details.',
    ],
    commonMistakes: [
      'Selecting a constituency that does not match your ward.',
    ],
  },
  guarantor: {
    prepare: [
      'Guarantors need valid National ID and reachable phone numbers.',
      'Guarantors must be able to complete OTP verification.',
    ],
    commonMistakes: [
      'Using your own ID as a guarantor.',
      'Wrong guarantor phone numbers that block OTP.',
    ],
  },
  recruitment: {
    prepare: [
      'Have agency, destination, and recruitment details ready.',
    ],
    commonMistakes: [
      'Inconsistent destination country versus group records.',
    ],
  },
  budget: {
    prepare: [
      'Break down costs that match your approved purpose.',
    ],
    commonMistakes: [
      'Budget lines that do not add up to the loan amount.',
    ],
  },
  bank: {
    prepare: [
      'Account name must match your name on the application.',
      'Double-check account number digits.',
    ],
    commonMistakes: [
      'Account name that does not match your National ID name.',
    ],
  },
  'credit-history': {
    prepare: [
      'Disclose existing loans honestly.',
    ],
    commonMistakes: [
      'Omitting active loans that may appear in clearance checks.',
    ],
  },
  signature: {
    prepare: [
      'Sign clearly; this confirms your application details.',
    ],
    commonMistakes: [
      'Saving without completing the signature pad.',
    ],
  },
  tripartite: {
    prepare: [
      'Read the full tripartite agreement before signing.',
      'Confirm your name, ID, and passport details on the form.',
    ],
    commonMistakes: [
      'Signing before checking that personal details are correct.',
    ],
  },
};

function stepKeyFromPath(path: string): string {
  const cleaned = path.replace(/\/+$/, '');
  const segment = cleaned.split('/').filter(Boolean).pop() ?? '';
  return segment;
}

export function resolveGuidanceForPath(
  pathname: string,
  flow: 'group' | 'individual',
): StepGuidance | null {
  const key = stepKeyFromPath(pathname);
  const steps = flow === 'group' ? GROUP_STEPS : INDIVIDUAL_STEPS;
  const step = steps.find((s) => (s.path ?? '').replace(/^\//, '') === key);
  const map = flow === 'group' ? GROUP_GUIDANCE : INDIVIDUAL_GUIDANCE;
  const body = map[key];
  if (!step || !body) {
    return null;
  }
  return {
    key,
    title: step.title,
    prepare: body.prepare,
    commonMistakes: body.commonMistakes,
  };
}

export function guidanceKeysForFlow(flow: 'group' | 'individual'): string[] {
  return (flow === 'group' ? GROUP_STEPS : INDIVIDUAL_STEPS)
    .map((s) => (s.path ?? '').replace(/^\//, ''))
    .filter(Boolean);
}
