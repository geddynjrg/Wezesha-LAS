'use client';

import { FieldGuidance } from '@/components/field-guidance';
import { FormField } from '@/components/form-field';
import type { FormFieldState } from '@workspace/ui/components/form';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { IconSearch } from '@tabler/icons-react';
import { type FC, useCallback, useEffect, useState } from 'react';

interface MseaBusinessRecord {
  business_name?: string;
  registration_number?: string;
  registration_date?: string;
  status?: string;
}

interface MseaLookupResponse {
  count?: number;
  records?: MseaBusinessRecord[];
  error?: string;
}

export interface MseaRegistrationFieldsProps {
  state?: FormFieldState<Record<string, unknown>>;
  defaultValues?: {
    groupName?: string;
    registrationNumber?: string;
    registrationDate?: string;
  };
  onLookupStateChange?: (validated: boolean) => void;
}

function formatRegistrationDate(dateString?: string): string {
  if (!dateString) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toISOString().slice(0, 10);
}

export const MseaRegistrationFields: FC<MseaRegistrationFieldsProps> = ({
  state,
  defaultValues,
  onLookupStateChange,
}) => {
  const [mseaReachable, setMseaReachable] = useState<boolean | null>(null);
  const [lookupInput, setLookupInput] = useState(
    defaultValues?.registrationNumber ?? '',
  );
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(
    null,
  );
  const [isValidated, setIsValidated] = useState(
    Boolean(
      defaultValues?.groupName &&
        defaultValues?.registrationNumber &&
        defaultValues?.registrationDate,
    ),
  );
  const [populatedValues, setPopulatedValues] = useState({
    groupName: defaultValues?.groupName ?? '',
    registrationNumber: defaultValues?.registrationNumber ?? '',
    registrationDate: defaultValues?.registrationDate ?? '',
  });

  useEffect(() => {
    if (
      !defaultValues?.groupName &&
      !defaultValues?.registrationNumber &&
      !defaultValues?.registrationDate
    ) {
      return;
    }

    setPopulatedValues({
      groupName: defaultValues.groupName ?? '',
      registrationNumber: defaultValues.registrationNumber ?? '',
      registrationDate: defaultValues.registrationDate ?? '',
    });
    setLookupInput(defaultValues.registrationNumber ?? '');
    setIsValidated(
      Boolean(
        defaultValues.groupName &&
          defaultValues.registrationNumber &&
          defaultValues.registrationDate,
      ),
    );
  }, [
    defaultValues?.groupName,
    defaultValues?.registrationNumber,
    defaultValues?.registrationDate,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function checkMseaHealth() {
      try {
        const response = await fetch('/api/businesses/health', {
          cache: 'no-store',
        });
        const data = (await response.json()) as {
          reachable?: boolean;
          reason?: string;
        };
        if (!cancelled) {
          const reachable = Boolean(data.reachable);
          setMseaReachable(reachable);
          if (!reachable) {
            setUnavailableMessage(data.reason ?? null);
            setIsValidated(true);
            onLookupStateChange?.(true);
          } else if (
            defaultValues?.groupName &&
            defaultValues?.registrationNumber &&
            defaultValues?.registrationDate
          ) {
            onLookupStateChange?.(true);
          } else {
            onLookupStateChange?.(false);
          }
        }
      } catch {
        if (!cancelled) {
          setMseaReachable(false);
          setUnavailableMessage(
            'MSEA registration service is unavailable. Please enter your group details manually.',
          );
          setIsValidated(true);
          onLookupStateChange?.(true);
        }
      }
    }

    void checkMseaHealth();

    return () => {
      cancelled = true;
    };
  }, [
    defaultValues?.groupName,
    defaultValues?.registrationNumber,
    defaultValues?.registrationDate,
    onLookupStateChange,
  ]);

  const handleLookup = useCallback(async () => {
    const trimmed = lookupInput.trim().toUpperCase();
    if (!trimmed) {
      setLookupError('Please enter a registration number.');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);

    try {
      const url = new URL('/api/businesses', window.location.origin);
      url.searchParams.set('registration_number', trimmed);
      const response = await fetch(url.toString(), { cache: 'no-store' });
      const data = (await response.json()) as MseaLookupResponse;

      if (!response.ok) {
        throw new Error(data.error || `Lookup failed (HTTP ${response.status})`);
      }

      if (data.count !== 1 || !data.records?.length) {
        throw new Error(
          'Group not found. Please check the registration number.',
        );
      }

      const record = data.records[0];
      if (record.status && record.status !== 'registered') {
        throw new Error(
          `Group status is "${record.status}". Only registered groups can proceed.`,
        );
      }

      // Confirm the signed-in user is the MSEA group chair before populating.
      const chairUrl = new URL('/api/businesses/verify-chair', window.location.origin);
      chairUrl.searchParams.set('registration_number', trimmed);
      const chairRes = await fetch(chairUrl.toString(), { cache: 'no-store' });
      const chairData = (await chairRes.json()) as {
        ok?: boolean;
        isChair?: boolean;
        error?: string;
      };
      if (!chairRes.ok || chairData.isChair === false) {
        throw new Error(
          chairData.error ||
            'Only the group chair on this MSEA registration can start the group application. Members should use individual applications.',
        );
      }

      const registrationDate = formatRegistrationDate(record.registration_date);
      if (!registrationDate) {
        throw new Error(
          'Registration date not found in MSEA record. Please contact support.',
        );
      }

      const nextValues = {
        groupName: (record.business_name ?? '').toUpperCase(),
        registrationNumber: (record.registration_number ?? trimmed).toUpperCase(),
        registrationDate,
      };

      setPopulatedValues(nextValues);
      setIsValidated(true);
      onLookupStateChange?.(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Lookup failed. Try again.';
      setLookupError(message);
      setPopulatedValues({
        groupName: '',
        registrationNumber: '',
        registrationDate: '',
      });
      setIsValidated(false);
      onLookupStateChange?.(false);
    } finally {
      setLookupLoading(false);
    }
  }, [lookupInput, onLookupStateChange]);

  if (mseaReachable === null) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 text-muted-foreground typo-body-small">
          Checking MSEA registration service...
        </div>
      </div>
    );
  }

  if (!mseaReachable) {
    return (
      <>
        <div className="md:col-span-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-amber-900 typo-body-small dark:text-amber-100">
          {unavailableMessage ??
            'MSEA registration service is unavailable. Please enter your group details manually.'}
        </div>
        <FieldGuidance fieldKey="groupName">
          <FormField
            name="groupName"
            label="Group Name"
            required
            state={state}
            defaultValue={defaultValues?.groupName}
            placeholder="Enter group name"
          />
        </FieldGuidance>
        <FieldGuidance fieldKey="registrationNumber">
          <FormField
            name="registrationNumber"
            label="Registration Number"
            required
            state={state}
            defaultValue={defaultValues?.registrationNumber}
            placeholder="e.g. RA-XXXXXX"
          />
        </FieldGuidance>
        <FormField
          name="registrationDate"
          label="Registration Date"
          type="date"
          required
          state={state}
          defaultValue={defaultValues?.registrationDate}
        />
      </>
    );
  }

  return (
    <div className="md:col-span-2 grid gap-4">
      <div>
        <h3 className="typo-body-large font-semibold">
          Group Registration Verification
        </h3>
        <p className="typo-body-small text-muted-foreground mt-1">
          Verify your MSEA registration number to auto-populate group details.
          Only the group chair listed on the MSEA partners list can continue this
          group application; other members use individual applications.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-2">
          <label htmlFor="msea-registration-lookup" className="typo-body-small font-medium">
            Registration Number
          </label>
          <Input
            id="msea-registration-lookup"
            value={lookupInput}
            onChange={(event) =>
              setLookupInput(event.target.value.toUpperCase())
            }
            placeholder="e.g. RA-NNSRDM"
            disabled={lookupLoading}
          />
        </div>
        <Button
          type="button"
          onClick={() => void handleLookup()}
          disabled={lookupLoading}
          className="w-full md:w-auto"
        >
          <IconSearch className="size-4" />
          {lookupLoading ? 'Verifying...' : 'Verify & Populate'}
        </Button>
      </div>

      {lookupError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive typo-body-small">
          {lookupError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          key={`groupName-${populatedValues.groupName}`}
          name="groupName"
          label="Group Name"
          required
          state={state}
          defaultValue={populatedValues.groupName}
          readonly
        />
        <FormField
          key={`registrationNumber-${populatedValues.registrationNumber}`}
          name="registrationNumber"
          label="Registration Number"
          required
          state={state}
          defaultValue={populatedValues.registrationNumber}
          readonly
        />
        <FormField
          key={`registrationDate-${populatedValues.registrationDate}`}
          name="registrationDate"
          label="Registration Date"
          type="date"
          required
          state={state}
          defaultValue={populatedValues.registrationDate}
          readonly
        />
      </div>

      {!isValidated && (
        <p className="typo-body-small text-muted-foreground">
          Verify a registered group before continuing.
        </p>
      )}
    </div>
  );
};
