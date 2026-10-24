'use client';

import { buildApplicantPathwayTips } from '@/lib/prescriptive-guidance';
import type { FC } from 'react';

export const PrescriptiveGuidance: FC<{
  destinationCountry?: string | null;
  hasPassport?: boolean;
  hasAgency?: boolean;
}> = ({ destinationCountry, hasPassport, hasAgency }) => {
  const tips = buildApplicantPathwayTips({
    destinationCountry,
    hasPassport,
    hasAgency,
  });

  return (
    <aside
      aria-label="Labour-export pathway recommendations"
      className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-semibold">{tips.title}</p>
      <p className="mt-1 text-xs text-amber-800">{tips.disclaimer}</p>
      <p className="mt-2 text-xs font-medium">{tips.amountHint}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {tips.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
    </aside>
  );
};
