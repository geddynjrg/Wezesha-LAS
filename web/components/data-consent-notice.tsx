'use client';

import {
  DATA_CONSENT_COOKIE,
  DATA_CONSENT_COPY,
  DATA_CONSENT_VERSION,
  buildConsentPayload,
  consentStorageKey,
  parseConsentPayload,
  type DataConsentRecord,
} from '@/lib/data-consent';
import { Button } from '@workspace/ui/components/button';
import {
  Modal,
  ModalContent,
} from '@workspace/ui/components/modal';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, type FC } from 'react';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function writeCookie(name: string, value: string, maxAgeDays = 365 * 3) {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function readCachedConsent(userId?: string | null): DataConsentRecord | null {
  const fromCookie = parseConsentPayload(readCookie(DATA_CONSENT_COOKIE));
  if (fromCookie) return fromCookie;
  try {
    return parseConsentPayload(
      localStorage.getItem(consentStorageKey(userId)),
    );
  } catch {
    return null;
  }
}

function cacheConsent(record: DataConsentRecord, userId?: string | null) {
  const payload = JSON.stringify(record);
  writeCookie(DATA_CONSENT_COOKIE, payload);
  try {
    localStorage.setItem(consentStorageKey(userId), payload);
    if (userId) {
      localStorage.setItem(consentStorageKey(null), payload);
    }
  } catch {
    /* private mode */
  }
}

export const DataConsentNotice: FC<{
  userId?: string | null;
  applicationId?: string | null;
  /** When true, blocks apply UI until consent (non-dismissible). */
  gateApply?: boolean;
}> = ({ userId = null, applicationId = null, gateApply = true }) => {
  const pathname = usePathname() || '';
  const isPs = pathname.startsWith('/ps');
  const isApply = pathname.startsWith('/apply');
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPs) {
      setReady(true);
      return;
    }
    const existing = readCachedConsent(userId);
    if (existing?.version === DATA_CONSENT_VERSION) {
      setOpen(false);
    } else if (isApply || gateApply) {
      setOpen(true);
    } else {
      // Soft notice on non-apply pages only when never consented
      setOpen(true);
    }
    setReady(true);
  }, [userId, isPs, isApply, gateApply]);

  const persist = useCallback(async () => {
    if (!checked) {
      setError(DATA_CONSENT_COPY.requiredHint);
      return;
    }
    setSaving(true);
    setError(null);
    const record = buildConsentPayload({ userId, applicationId });
    cacheConsent(record, userId);

    try {
      await fetch('/api/data-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch {
      // Cookie/localStorage already set — server persist is best-effort
    }

    setSaving(false);
    setOpen(false);
  }, [checked, userId, applicationId]);

  if (!ready || isPs || !open) {
    return null;
  }

  const mustConsent = gateApply && isApply;

  return (
    <Modal open={open} onOpenChange={(next) => {
      if (mustConsent) return;
      setOpen(next);
    }}>
      <ModalContent
        size="md"
        showClose={!mustConsent}
        className="max-h-[90svh] overflow-y-auto p-4 sm:p-6"
        aria-describedby="data-consent-body"
      >
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          {DATA_CONSENT_COPY.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {DATA_CONSENT_COPY.subtitle}
        </p>

        <div id="data-consent-body" className="mt-4 space-y-4 text-sm">
          <section>
            <h3 className="font-semibold">{DATA_CONSENT_COPY.whatCollectedHeading}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {DATA_CONSENT_COPY.whatCollected.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold">{DATA_CONSENT_COPY.howUsedHeading}</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {DATA_CONSENT_COPY.howUsed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold">{DATA_CONSENT_COPY.howLongHeading}</h3>
            <p className="mt-1">{DATA_CONSENT_COPY.howLong}</p>
          </section>
          <p className="text-xs text-muted-foreground">
            {DATA_CONSENT_COPY.assistiveNote}
          </p>
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={checked}
            onChange={(e) => {
              setChecked(e.target.checked);
              setError(null);
            }}
          />
          <span>{DATA_CONSENT_COPY.acknowledge}</span>
        </label>

        {error ? (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={saving || !checked}
            onClick={() => void persist()}
          >
            {saving ? 'Saving…' : DATA_CONSENT_COPY.continueLabel}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};
