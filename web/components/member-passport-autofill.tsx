'use client';

import { type FC, useEffect } from 'react';

/**
 * Autofills passportNo_{index} from NEAIMS Jobseeker Get when the
 * response includes a non-null passport number.
 */
export const MemberPassportAutofill: FC<{
  nationalId: string;
  index: number;
}> = ({ nationalId, index }) => {
  useEffect(() => {
    const id = nationalId.trim().replace(/\s+/g, '');
    if (id.length < 5) return;

    const handle = window.setTimeout(() => {
      void fetch('/api/neaims/jobseeker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: id }),
      })
        .then(async (res) => {
          const data = (await res.json()) as {
            ok?: boolean;
            passportNo?: string | null;
            jobseeker?: { passportNo?: string | null } | null;
          };
          const raw =
            data.passportNo ??
            data.jobseeker?.passportNo ??
            null;
          if (raw == null) return;
          const passport = String(raw).trim();
          if (!passport || passport.toLowerCase() === 'null') return;

          const input = document.querySelector<HTMLInputElement>(
            `input[name="passportNo_${index}"]`,
          );
          if (!input) return;
          input.value = passport;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })
        .catch(() => {
          /* soft-fail: leave passport field as-is */
        });
    }, 450);

    return () => window.clearTimeout(handle);
  }, [nationalId, index]);

  return null;
};
