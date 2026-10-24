/**
 * Applicant-facing labour-export pathway guidance (assistive / recommend only).
 */

export type DestinationHeuristic = {
  country: string;
  aliases: string[];
  suggestedLoanKes: number;
  trainingModules: string[];
  notes: string;
};

export const DESTINATION_COST_HEURISTICS: DestinationHeuristic[] = [
  {
    country: 'Saudi Arabia',
    aliases: ['ksa', 'saudi'],
    suggestedLoanKes: 180000,
    trainingModules: [
      'Pre-departure orientation (rights & contracts)',
      'Cultural & workplace readiness',
      'Financial literacy for remittances',
    ],
    notes: 'Budget typically covers agency fees, medicals, visa, and initial travel buffer.',
  },
  {
    country: 'Qatar',
    aliases: ['qatar', 'doha'],
    suggestedLoanKes: 170000,
    trainingModules: [
      'Pre-departure orientation',
      'Document readiness (passport, contract attestation)',
      'Health & safety briefing',
    ],
    notes: 'Confirm agency fee schedule before finalising loan amount.',
  },
  {
    country: 'UAE',
    aliases: ['uae', 'dubai', 'abu dhabi', 'emirates'],
    suggestedLoanKes: 160000,
    trainingModules: [
      'Pre-departure orientation',
      'Contract understanding',
      'Travel logistics checklist',
    ],
    notes: 'Visa medicals and Emirates ID logistics vary by emirate — follow agency checklist.',
  },
  {
    country: 'Kuwait',
    aliases: ['kuwait'],
    suggestedLoanKes: 165000,
    trainingModules: [
      'Pre-departure orientation',
      'Domestic / facility work readiness (if applicable)',
      'Remittance planning',
    ],
    notes: 'Ensure passport validity ≥ 6 months beyond intended travel.',
  },
  {
    country: 'Other / unspecified',
    aliases: [],
    suggestedLoanKes: 150000,
    trainingModules: [
      'General pre-departure orientation',
      'Pre disbursement training',
      'Document completeness',
      'Flight booking only after officer clearance',
    ],
    notes: 'Use destination-specific costs from your recruitment agency when known.',
  },
];

export function resolveDestinationHeuristic(
  country?: string | null,
): DestinationHeuristic {
  const raw = (country || '').trim().toLowerCase();
  if (!raw) {
    return DESTINATION_COST_HEURISTICS[DESTINATION_COST_HEURISTICS.length - 1]!;
  }
  for (const row of DESTINATION_COST_HEURISTICS) {
    if (row.country.toLowerCase() === raw) return row;
    if (row.aliases.some((a) => raw.includes(a))) return row;
  }
  return DESTINATION_COST_HEURISTICS[DESTINATION_COST_HEURISTICS.length - 1]!;
}

export function buildApplicantPathwayTips(input: {
  destinationCountry?: string | null;
  hasPassport?: boolean;
  hasAgency?: boolean;
}): { title: string; steps: string[]; amountHint: string; disclaimer: string } {
  const h = resolveDestinationHeuristic(input.destinationCountry);
  const steps = [
    'Confirm destination country and recruitment agency details on the recruitment step.',
    input.hasPassport
      ? 'Passport on file — verify validity dates before visa lodging.'
      : 'Upload a clear passport bio-page scan before visa processing.',
    input.hasAgency
      ? 'Agency listed — keep the signed recruitment contract ready for officers.'
      : 'Add local/foreign agency names so officers can verify the placement.',
    ...h.trainingModules.map((m) => `Suggested training: ${m}`),
    'Do not book non-refundable flights until vetting and disbursement guidance allow it.',
  ];

  return {
    title: `Pathway tips for ${h.country}`,
    steps,
    amountHint: `Heuristic optimal loan band for ${h.country}: about KES ${h.suggestedLoanKes.toLocaleString()} (assistive only — officers confirm). ${h.notes}`,
    disclaimer:
      'Assistive recommendations only. Uwezo Fund officers confirm loan amounts and compliance routing.',
  };
}
