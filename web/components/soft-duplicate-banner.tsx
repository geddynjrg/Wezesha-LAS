'use client';

import type { SoftDuplicateResult } from '@/lib/soft-duplicate-check';
import { type FC, useEffect, useState } from 'react';

export const SoftDuplicateBanner: FC<{
  phone?: string;
  nationalId?: string;
  applicationId?: string;
  memberId?: string;
  acknowledged: boolean;
  onAcknowledgedChange: (value: boolean) => void;
  onDuplicateChange?: (hasDuplicate: boolean) => void;
  /** When false, hide checkbox until a duplicate is found. */
  enabled?: boolean;
}> = ({
  phone,
  nationalId,
  applicationId,
  memberId,
  acknowledged,
  onAcknowledgedChange,
  onDuplicateChange,
  enabled = true,
}) => {
  const [result, setResult] = useState<SoftDuplicateResult | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setResult(null);
      onDuplicateChange?.(false);
      return;
    }

    const phoneValue = (phone ?? '').trim();
    const idValue = (nationalId ?? '').trim();
    if (phoneValue.length < 9 && idValue.length < 5) {
      setResult(null);
      onDuplicateChange?.(false);
      return;
    }

    const handle = window.setTimeout(() => {
      setChecking(true);
      void fetch('/api/soft-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneValue,
          nationalId: idValue,
          applicationId,
          memberId,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            setResult(null);
            onDuplicateChange?.(false);
            return;
          }
          const data = (await res.json()) as SoftDuplicateResult;
          setResult(data);
          const has = Boolean(data.phoneDuplicate) || Boolean(data.nationalIdDuplicate);
          onDuplicateChange?.(has);
          if (!has) {
            onAcknowledgedChange(false);
          }
        })
        .catch(() => {
          setResult(null);
          onDuplicateChange?.(false);
        })
        .finally(() => setChecking(false));
    }, 450);

    return () => window.clearTimeout(handle);
  }, [
    phone,
    nationalId,
    applicationId,
    memberId,
    enabled,
    onAcknowledgedChange,
    onDuplicateChange,
  ]);

  const hasDuplicate =
    Boolean(result?.phoneDuplicate) || Boolean(result?.nationalIdDuplicate);

  if (!hasDuplicate) {
    return checking ? (
      <p className="mb-2 text-xs text-muted-foreground">Checking for duplicate contacts…</p>
    ) : null;
  }

  return (
    <div
      role="status"
      className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="font-semibold">Possible duplicate detected</p>
      <p className="mt-1">{result?.message}</p>
      <p className="mt-2 text-xs text-amber-800">
        No other applicant details are shown. Within this form, duplicate National IDs are still
        blocked.
      </p>
      <label className="mt-3 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={acknowledged}
          onChange={(e) => onAcknowledgedChange(e.target.checked)}
          name="softDuplicateAcknowledged"
          value="on"
        />
        <span>I understand and want to continue with these details.</span>
      </label>
    </div>
  );
};

/** Returns true when continue should be blocked (duplicate present and not acknowledged). */
export function softDuplicateBlocksContinue(
  result: SoftDuplicateResult | null | undefined,
  acknowledged: boolean,
): boolean {
  if (!result) return false;
  if (!result.phoneDuplicate && !result.nationalIdDuplicate) return false;
  return !acknowledged;
}
