'use client';

import { type FC, useEffect, useState } from 'react';

type PlacementCheck = {
  status: 'idle' | 'checking' | 'placed' | 'not-placed' | 'error';
  message?: string;
  placementsCount?: number;
};

/**
 * Non-blocking NEAIMS placements check for a group member national ID.
 * Advises when the jobseeker has no placement; never blocks Save & Continue.
 */
export const MemberPlacementNotice: FC<{
  nationalId: string;
  memberLabel?: string;
}> = ({ nationalId, memberLabel }) => {
  const [check, setCheck] = useState<PlacementCheck>({ status: 'idle' });

  useEffect(() => {
    const id = nationalId.trim().replace(/\s+/g, '');
    if (id.length < 5) {
      setCheck({ status: 'idle' });
      return;
    }

    const handle = window.setTimeout(() => {
      setCheck({ status: 'checking' });
      void fetch('/api/neaims/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: id }),
      })
        .then(async (res) => {
          const data = (await res.json()) as {
            ok?: boolean;
            placed?: boolean;
            placementsCount?: number;
            message?: string;
            source?: string;
          };
          if (!data.ok || data.source === 'error') {
            // Soft-fail: do not alarm on API outages.
            setCheck({ status: 'error', message: data.message });
            return;
          }
          if (data.placed) {
            setCheck({
              status: 'placed',
              placementsCount: data.placementsCount ?? 0,
            });
            return;
          }
          setCheck({
            status: 'not-placed',
            placementsCount: 0,
            message: data.message,
          });
        })
        .catch(() => {
          setCheck({ status: 'error' });
        });
    }, 450);

    return () => window.clearTimeout(handle);
  }, [nationalId]);

  if (check.status === 'idle') return null;

  if (check.status === 'checking') {
    return (
      <div className="md:col-span-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 typo-body-small text-neutral-700">
        Checking NEAIMS placement status for this national ID…
      </div>
    );
  }

  if (check.status === 'placed') {
    return (
      <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 typo-body-small text-emerald-900">
        NEAIMS shows {check.placementsCount ?? 1} placement
        {(check.placementsCount ?? 1) === 1 ? '' : 's'} for this jobseeker.
      </div>
    );
  }

  if (check.status === 'not-placed') {
    const who = memberLabel ? `${memberLabel} ` : 'This member ';
    return (
      <div
        className="md:col-span-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 typo-body-small text-amber-950"
        role="status"
      >
        <p className="font-semibold">Not placed on NEAIMS</p>
        <p className="mt-1">
          {who}
          has not been placed in any position according to NEAIMS Jobseeker
          Placements. Please consult your recruitment agent or NEA officials for
          more guidance.
        </p>
        <p className="mt-2 text-amber-900/80">
          You may still save and continue with this application.
        </p>
      </div>
    );
  }

  return null;
};
