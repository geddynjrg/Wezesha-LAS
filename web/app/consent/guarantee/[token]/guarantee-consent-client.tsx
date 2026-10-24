'use client';

import { submitGuaranteeConsentDecision } from './actions';
import { Button } from '@workspace/ui/components/button';
import { type FC, useState, useTransition } from 'react';

type Status = 'pending' | 'accepted' | 'declined';

export const GuaranteeConsentClient: FC<{
  token: string;
  groupName: string;
  memberName: string;
  initialStatus: Status;
}> = ({ token, groupName, memberName, initialStatus }) => {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const decide = (decision: 'accepted' | 'declined') => {
    if (status !== 'pending' || isPending) return;

    const confirmed =
      decision === 'accepted'
        ? window.confirm(
            `Confirm that you, ${memberName}, consent to the loan repayment commitment for ${groupName}?`,
          )
        : window.confirm(
            `Confirm that you, ${memberName}, decline the loan repayment commitment for ${groupName}? This cannot be undone from this link.`,
          );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await submitGuaranteeConsentDecision(token, decision);
      if (result.status === 'accepted' || result.status === 'declined') {
        setStatus(result.status);
      }
      setMessage(result.message || null);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="typo-h4 text-neutral-900">Members Guarantee &amp; Commitment</h1>
        <p className="mt-2 typo-body-medium text-neutral-700">
          Dear <strong>{memberName}</strong>, please review and respond to the repayment
          commitment for <strong>{groupName}</strong>.
        </p>

        <div className="typo-body-medium mt-6 space-y-3 text-neutral-800">
          <p>We the undersigned hereby:</p>
          <ol className="list-none space-y-2 pl-0">
            <li>
              (i) Confirm that we are members of the{' '}
              <strong>
                <u>{groupName}</u>
              </strong>{' '}
              group.
            </li>
            <li>
              (ii) Declare that the information provided herein is true to the best of our
              knowledge,
            </li>
            <li>
              (iii) We further authorize Uwezo Fund to verify the information and reference
              provided here-in,
            </li>
            <li>
              (iv) We agree that jointly and severally we are liable for repayment of the loan,
            </li>
            <li>
              (v) In the event of default, we shall be subjected to the terms and conditions of
              this loan,
            </li>
            <li>
              (vi) We shall not be eligible for additional loans until the amount in default has
              been cleared in full.
            </li>
            <li>
              (vii) Consent that the Fund may share our data for credit referencing as may be
              applicable.
            </li>
          </ol>
        </div>

        {status === 'pending' ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="rounded-full px-8"
              disabled={isPending}
              onClick={() => decide('accepted')}
            >
              {isPending ? 'Saving…' : 'I consent'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-8"
              disabled={isPending}
              onClick={() => decide('declined')}
            >
              Decline
            </Button>
          </div>
        ) : (
          <div
            className={`mt-8 rounded-lg border px-4 py-3 typo-body-medium ${
              status === 'accepted'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            {status === 'accepted'
              ? 'You have consented. You may close this page.'
              : 'You have declined. You may close this page.'}
          </div>
        )}

        {message ? (
          <p className="typo-body-small mt-4 text-neutral-600">{message}</p>
        ) : null}
      </div>
    </div>
  );
};
