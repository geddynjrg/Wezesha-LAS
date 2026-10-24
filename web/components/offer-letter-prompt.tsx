'use client';

import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { type FC, useState } from 'react';

interface OfferLetterPromptProps {
  href: string;
  amount: string;
  applicantName: string;
  mode?: 'profile' | 'offer';
  missingLabels?: string[];
}

export const OfferLetterPrompt: FC<OfferLetterPromptProps> = ({
  href,
  amount,
  applicantName,
  mode = 'offer',
  missingLabels = [],
}) => {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl">
        {mode === 'profile' ? (
          <>
            <h2 className="typo-h4">Complete your application first</h2>
            <p className="text-neutral-700">
              {applicantName}, your loan of <strong>KES {amount}</strong> is approved, but your
              individual application is incomplete. Fill the sections below and sign the tripartite
              agreement. You will then be required to sign the offer letter.
            </p>
            <ul className="list-disc pl-5 text-sm text-neutral-800">
              {missingLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={href}>Continue application</Link>
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Later
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="typo-h4">Sign your offer letter</h2>
            <p className="text-neutral-700">
              {applicantName}, your details and tripartite agreement are in place. Sign the offer
              letter for your approved loan of <strong>KES {amount}</strong>. The loan has not been
              disbursed yet.
            </p>
            <Button asChild>
              <Link href={href}>Sign Offer Letter</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
