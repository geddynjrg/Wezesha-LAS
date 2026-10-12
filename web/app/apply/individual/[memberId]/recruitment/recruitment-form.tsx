'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import {
  RECRUITMENT_FIELD_LABELS,
  type RecruitmentPlacementField,
} from '@/lib/neaims-placements';
import { isNeaimsPlacementRequired } from '@/lib/neaims-placement-policy';
import {
  listAllRecruitmentAgencies,
  searchRecruitmentAgencies,
  type RecruitmentAgency,
} from '@/lib/api/agencies.service';
import { Container } from '@workspace/ui/components/container';
import { Field, Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { labelVariants } from '@workspace/ui/components/label';
import { SearchInput } from '@workspace/ui/components/search-input';
import { Select } from '@workspace/ui/components/select';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { saveRecruitmentAction } from './recruitment-action';
import {
  CURRENCY_OPTIONS,
  DURATION_TYPE_OPTIONS,
  recruitmentSchema,
  type RecruitmentInput,
} from './recruitment-schema';

const FALLBACK_RATES: Record<string, number> = {
  AED: 35.23,
  KWD: 421.61,
  RUB: 1.77,
};

/** Extract NEA reg no when SearchInput passes the full "REG - NAME" label. */
function toAgentRegNo(value: string): string {
  const trimmed = value.trim();
  const separatorIndex = trimmed.indexOf(' - ');
  return separatorIndex === -1 ? trimmed : trimmed.slice(0, separatorIndex).trim();
}

const EXCHANGE_API_KEY = 'cd6b57d8e1c923a0077a5f72';

interface RecruitmentFormProps {
  memberId: string;
  nationalId?: string;
  defaultValues?: Partial<RecruitmentInput>;
  lockedFields?: RecruitmentPlacementField[];
  unmatchedFields?: RecruitmentPlacementField[];
  neaimsStatus?: 'placed' | 'not-placed' | 'error';
  placementsCount?: number;
  placementStatus?: string;
}

const ReadOnlyDisplay: FC<{ label: string; value: string; required?: boolean }> = ({
  label,
  value,
  required,
}) => (
  <div className="flex w-full flex-col gap-1">
    <span className={cn(labelVariants(), 'mb-1 font-bold')}>
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </span>
    <Input value={value || '—'} readonly disabled />
  </div>
);

export const RecruitmentForm: FC<RecruitmentFormProps> = ({
  memberId,
  nationalId,
  defaultValues,
  lockedFields = [],
  unmatchedFields = [],
  neaimsStatus = 'error',
  placementsCount = 0,
  placementStatus,
}) => {
  const action = saveRecruitmentAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, recruitmentSchema, defaultValues);

  const locked = useMemo(() => new Set(lockedFields), [lockedFields]);
  const isLocked = useCallback((field: RecruitmentPlacementField) => locked.has(field), [locked]);

  const [agentNumber, setAgentNumber] = useState(defaultValues?.agentNumber ?? '');
  const [localAgentName, setLocalAgentName] = useState(defaultValues?.localAgentName ?? '');
  const [agencyOptions, setAgencyOptions] = useState<{ value: string; label: string }[]>([]);
  const [isSearchingAgencies, setIsSearchingAgencies] = useState(false);

  const [currency, setCurrency] = useState(defaultValues?.currency ?? '');
  const [monthlyRemuneration, setMonthlyRemuneration] = useState(
    defaultValues?.monthlyRemuneration ?? '',
  );
  const [convertedKesAmount, setConvertedKesAmount] = useState(
    defaultValues?.convertedKesAmount ?? '',
  );
  const agencyCacheRef = useRef(new Map<string, RecruitmentAgency[]>());
  const allAgenciesRef = useRef<RecruitmentAgency[]>([]);
  const agencyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toAgencyOptions = useCallback(
    (entries: RecruitmentAgency[]) =>
      entries.map((agency) => ({
        value: agency.neaRegNo,
        label: `${agency.neaRegNo} - ${agency.agencyName}`,
      })),
    [],
  );

  const matchAgency = useCallback((raw: string) => {
    const reg = toAgentRegNo(raw).toLowerCase();
    const label = raw.trim().toLowerCase();
    return allAgenciesRef.current.find(
      (agency) =>
        agency.neaRegNo.toLowerCase() === reg ||
        `${agency.neaRegNo} - ${agency.agencyName}`.toLowerCase() === label ||
        agency.agencyName.toLowerCase() === label,
    );
  }, []);

  const agencySearchOptions = useMemo(
    () =>
      agencyOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [agencyOptions],
  );

  const placementMissing = neaimsStatus === 'not-placed' || neaimsStatus === 'error';
  const placementEnforced = isNeaimsPlacementRequired();
  const submitBlocked = placementEnforced && placementMissing;

  const searchAgencies = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (allAgenciesRef.current.length > 0) {
      const q = trimmed.toLowerCase();
      const filtered = !q
        ? allAgenciesRef.current
        : allAgenciesRef.current.filter(
            (agency) =>
              agency.neaRegNo.toLowerCase().includes(q) ||
              agency.agencyName.toLowerCase().includes(q) ||
              (agency.companyRegNo || '').toLowerCase().includes(q),
          );
      setAgencyOptions(toAgencyOptions(filtered));
      return;
    }
    if (trimmed.length < 2) {
      setAgencyOptions([]);
      return;
    }

    const cacheKey = trimmed.toUpperCase();
    if (agencyCacheRef.current.has(cacheKey)) {
      const cached = agencyCacheRef.current.get(cacheKey) ?? [];
      setAgencyOptions(toAgencyOptions(cached));
      return;
    }

    setIsSearchingAgencies(true);
    try {
      const results = await searchRecruitmentAgencies(trimmed);
      agencyCacheRef.current.set(cacheKey, results);
      setAgencyOptions(toAgencyOptions(results));
    } catch {
      setAgencyOptions([]);
    } finally {
      setIsSearchingAgencies(false);
    }
  }, [toAgencyOptions]);

  useEffect(() => {
    if (isLocked('agentNumber')) return;
    let cancelled = false;
    setIsSearchingAgencies(true);
    void listAllRecruitmentAgencies()
      .then((results) => {
        if (cancelled || results.length === 0) return;
        allAgenciesRef.current = results;
        setAgencyOptions(toAgencyOptions(results));
        if (agentNumber && !localAgentName) {
          const saved = results.find(
            (agency) =>
              agency.neaRegNo.toLowerCase() === agentNumber.trim().toLowerCase(),
          );
          if (saved) setLocalAgentName(saved.agencyName);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearchingAgencies(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLocked, toAgencyOptions, agentNumber, localAgentName]);

  useEffect(() => {
    if (agentNumber && !localAgentName && !isLocked('localAgentName')) {
      void searchAgencies(agentNumber).then(() => {
        const cached = agencyCacheRef.current.get(agentNumber.trim().toUpperCase()) ?? [];
        const match = cached.find(
          (agency) =>
            agency.neaRegNo.toLowerCase() === agentNumber.trim().toLowerCase(),
        );
        if (match) {
          setLocalAgentName(match.agencyName);
        }
      });
    }
  }, [agentNumber, localAgentName, searchAgencies, isLocked]);

  useEffect(() => {
    const amount = Number(monthlyRemuneration);
    if (!currency || !monthlyRemuneration || Number.isNaN(amount) || amount <= 0) {
      setConvertedKesAmount('');
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/${currency}/KES/${amount}`,
        );
        if (!response.ok) throw new Error('Conversion failed');

        const data = (await response.json()) as {
          result?: string;
          conversion_result?: number;
        };

        if (data.result === 'success' && data.conversion_result != null) {
          setConvertedKesAmount(Number(data.conversion_result).toFixed(2));
          return;
        }

        throw new Error('Invalid conversion response');
      } catch {
        const fallbackRate = FALLBACK_RATES[currency];
        if (fallbackRate) {
          setConvertedKesAmount((amount * fallbackRate).toFixed(2));
        } else {
          setConvertedKesAmount('');
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currency, monthlyRemuneration]);

  const handleAgentNumberChange = (value: string | undefined) => {
    if (isLocked('agentNumber')) return;
    const next = toAgentRegNo(value ?? '');
    setAgentNumber(next);
    const matched = matchAgency(value ?? next);
    if (matched && !isLocked('localAgentName')) {
      setLocalAgentName(matched.agencyName);
    }

    if (agencyDebounceRef.current) {
      clearTimeout(agencyDebounceRef.current);
    }

    agencyDebounceRef.current = setTimeout(() => {
      void searchAgencies(next);
    }, 150);
  };

  const handleAgentSelect = (value: string) => {
    if (isLocked('agentNumber')) return;
    const selected = agencyOptions.find((option) => option.value === value);
    if (!selected) return;

    const agencyName = selected.label.includes(' - ')
      ? selected.label.split(' - ').slice(1).join(' - ')
      : '';

    setAgentNumber(value);
    setLocalAgentName(agencyName);
  };

  useEffect(
    () => () => {
      if (agencyDebounceRef.current) {
        clearTimeout(agencyDebounceRef.current);
      }
    },
    [],
  );

  const unmatchedLabels = unmatchedFields.map(
    (field) => RECRUITMENT_FIELD_LABELS[field],
  );

  return (
    <Form action={formAction} state={state}>
      <input type="hidden" name="agentNumber" value={agentNumber} />
      {isLocked('localAgentName') ? (
        <input type="hidden" name="localAgentName" value={localAgentName} />
      ) : null}
      <input type="hidden" name="convertedKesAmount" value={convertedKesAmount} />
      {isLocked('currency') ? (
        <input type="hidden" name="currency" value={currency} />
      ) : null}
      {isLocked('monthlyRemuneration') ? (
        <input type="hidden" name="monthlyRemuneration" value={monthlyRemuneration} />
      ) : null}
      {isLocked('durationType') && defaultValues?.durationType ? (
        <input type="hidden" name="durationType" value={defaultValues.durationType} />
      ) : null}
      {isLocked('workDuration') && defaultValues?.workDuration ? (
        <input type="hidden" name="workDuration" value={defaultValues.workDuration} />
      ) : null}
      {(['employerAbroad', 'recruiterCode', 'countryOfDestination', 'natureOfWork'] as const).map(
        (field) =>
          isLocked(field) ? (
            <input
              key={field}
              type="hidden"
              name={field}
              value={String(defaultValues?.[field] ?? '')}
            />
          ) : null,
      )}

      <Container className="py-8">
        <FormCard title="Recruitment Details">
          {neaimsStatus === 'placed' ? (
            <div
              role="status"
              className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
            >
              <p className="font-semibold">NEAIMS placement found</p>
              <p className="mt-1">
                {placementsCount} placement{placementsCount === 1 ? '' : 's'} matched National ID
                {nationalId ? ` ${nationalId}` : ''}
                {placementStatus ? ` (status: ${placementStatus})` : ''}. Matching fields were
                filled from NEAIMS and cannot be edited.
              </p>
            </div>
          ) : null}

          {placementMissing ? (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950"
            >
              <p className="font-semibold">Application cannot continue</p>
              <p className="mt-1">
                A job placement must exist for every job seeker. NEAIMS
                {neaimsStatus === 'error' ? ' could not confirm a placement' : ' returned no placement'}
                {nationalId ? ` for National ID ${nationalId}` : ''}. This application stays closed
                until that placement exists.
              </p>
            </div>
          ) : null}

          {neaimsStatus === 'placed' && unmatchedLabels.length > 0 ? (
            <div
              role="status"
              className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            >
              <p className="font-semibold">Some fields could not be matched from NEAIMS</p>
              <p className="mt-1">
                Please enter these details yourself:{' '}
                <strong>{unmatchedLabels.join(', ')}</strong>.
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {isLocked('agentNumber') ? (
              <ReadOnlyDisplay
                label="Agent Number (NEA)"
                value={agentNumber}
                required
              />
            ) : (
              <Field
                state={state}
                name="agentNumber"
                label="Agent Number (NEA)"
                required
                control={(props) => {
                  const { name: _name, ...fieldProps } = props;
                  return (
                    <SearchInput
                      {...fieldProps}
                      name=""
                      defaultValue={defaultValues?.agentNumber}
                      placeholder="Search agency name or number"
                      options={agencySearchOptions}
                      isLoading={isSearchingAgencies}
                      onValueChange={handleAgentNumberChange}
                      onValueSelect={handleAgentSelect}
                    />
                  );
                }}
              />
            )}
            {!isLocked('agentNumber') ? (
              <p className="text-muted-foreground -mt-2 text-xs md:col-span-2">
                Licensed agencies from the NEAIMS agency list. Search by agency name or
                registration number, then select one.
              </p>
            ) : null}

            {isLocked('localAgentName') ? (
              <ReadOnlyDisplay
                label="Name of Local Recruitment Agent"
                value={localAgentName}
                required
              />
            ) : (
              <Field
                state={state}
                name="localAgentName"
                label="Name of Local Recruitment Agent"
                required
                control={(props) => (
                  <Input
                    {...props}
                    name="localAgentName"
                    value={localAgentName}
                    placeholder="Filled from agent search or type manually"
                    onChange={(event) => setLocalAgentName(event.target.value)}
                  />
                )}
              />
            )}

            {isLocked('employerAbroad') ? (
              <ReadOnlyDisplay
                label="Employer Abroad"
                value={String(defaultValues?.employerAbroad ?? '')}
                required
              />
            ) : (
              <FormField
                name="employerAbroad"
                label="Employer Abroad"
                required
                state={state}
                defaultValue={defaultValues?.employerAbroad}
              />
            )}

            {isLocked('recruiterCode') ? (
              <ReadOnlyDisplay
                label="Employer Code"
                value={String(defaultValues?.recruiterCode ?? '')}
                required
              />
            ) : (
              <FormField
                name="recruiterCode"
                label="Employer Code"
                required
                state={state}
                defaultValue={defaultValues?.recruiterCode}
              />
            )}

            {isLocked('countryOfDestination') ? (
              <ReadOnlyDisplay
                label="Country of Destination"
                value={String(defaultValues?.countryOfDestination ?? '')}
                required
              />
            ) : (
              <FormField
                name="countryOfDestination"
                label="Country of Destination"
                required
                state={state}
                defaultValue={defaultValues?.countryOfDestination}
              />
            )}

            {isLocked('natureOfWork') ? (
              <ReadOnlyDisplay
                label="Nature of Work"
                value={String(defaultValues?.natureOfWork ?? '')}
                required
              />
            ) : (
              <FormField
                name="natureOfWork"
                label="Nature of Work"
                required
                state={state}
                defaultValue={defaultValues?.natureOfWork}
              />
            )}

            {isLocked('durationType') ? (
              <ReadOnlyDisplay
                label="Duration Type"
                value={String(defaultValues?.durationType ?? '')}
                required
              />
            ) : (
              <Field
                state={state}
                name="durationType"
                label="Duration Type"
                required
                control={(props) => (
                  <Select
                    {...props}
                    name="durationType"
                    placeholder="Select duration type"
                    defaultValue={defaultValues?.durationType}
                    options={DURATION_TYPE_OPTIONS.map((value) => ({
                      label: value.charAt(0).toUpperCase() + value.slice(1),
                      value,
                    }))}
                  />
                )}
              />
            )}

            {isLocked('workDuration') ? (
              <ReadOnlyDisplay
                label="Duration/Tenure of Work"
                value={String(defaultValues?.workDuration ?? '')}
                required
              />
            ) : (
              <FormField
                name="workDuration"
                label="Duration/Tenure of Work"
                type="number"
                required
                state={state}
                defaultValue={defaultValues?.workDuration}
                placeholder="Enter duration"
              />
            )}

            {isLocked('currency') ? (
              <ReadOnlyDisplay label="Currency" value={currency} required />
            ) : (
              <Field
                state={state}
                name="currency"
                label="Currency"
                required
                control={(props) => (
                  <Select
                    {...props}
                    name="currency"
                    placeholder="Select currency"
                    defaultValue={defaultValues?.currency}
                    options={CURRENCY_OPTIONS.map((value) => ({
                      label: value,
                      value,
                    }))}
                    onValueChange={(value) => setCurrency(value)}
                  />
                )}
              />
            )}

            {isLocked('monthlyRemuneration') ? (
              <ReadOnlyDisplay
                label="Monthly Remuneration (Gross)"
                value={monthlyRemuneration}
                required
              />
            ) : (
              <Field
                state={state}
                name="monthlyRemuneration"
                label="Monthly Remuneration (Gross)"
                required
                control={(props) => (
                  <Input
                    {...props}
                    type="number"
                    name="monthlyRemuneration"
                    defaultValue={defaultValues?.monthlyRemuneration}
                    placeholder="Enter amount"
                    step="0.01"
                    onChange={(event) => setMonthlyRemuneration(event.target.value)}
                  />
                )}
              />
            )}
          </div>

          {convertedKesAmount ? (
            <p className="text-success mt-4 text-sm">
              Equivalent in KES: <strong>Ksh {convertedKesAmount}</strong>
            </p>
          ) : null}
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending || submitBlocked}
        prevUrl={`/apply/individual/${memberId}/guarantor`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
