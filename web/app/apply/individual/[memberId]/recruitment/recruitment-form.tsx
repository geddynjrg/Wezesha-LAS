'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import { saveRecruitmentAction } from './recruitment-action';
import {
  CURRENCY_OPTIONS,
  DURATION_TYPE_OPTIONS,
  recruitmentSchema,
  type RecruitmentInput,
} from './recruitment-schema';
import {
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

const FALLBACK_RATES: Record<string, number> = {
  AED: 35.23,
  KWD: 421.61,
  RUB: 1.77,
};

const EXCHANGE_API_KEY = 'cd6b57d8e1c923a0077a5f72';

interface RecruitmentFormProps {
  memberId: string;
  defaultValues?: Partial<RecruitmentInput>;
}

const ReadOnlyDisplay: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex w-full flex-col gap-1">
    <span className={cn(labelVariants(), 'mb-1 font-bold')}>{label}</span>
    <Input value={value} readonly disabled />
  </div>
);

export const RecruitmentForm: FC<RecruitmentFormProps> = ({
  memberId,
  defaultValues,
}) => {
  const action = saveRecruitmentAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, recruitmentSchema, defaultValues);

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
  const agencyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const agencySearchOptions = useMemo(
    () =>
      agencyOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [agencyOptions],
  );

  const searchAgencies = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setAgencyOptions([]);
      return;
    }

    const cacheKey = trimmed.toUpperCase();
    if (agencyCacheRef.current.has(cacheKey)) {
      const cached = agencyCacheRef.current.get(cacheKey) ?? [];
      setAgencyOptions(
        cached.map((agency) => ({
          value: agency.neaRegNo,
          label: `${agency.neaRegNo} - ${agency.agencyName}`,
        })),
      );
      return;
    }

    setIsSearchingAgencies(true);
    try {
      const results = await searchRecruitmentAgencies(trimmed);
      agencyCacheRef.current.set(cacheKey, results);
      setAgencyOptions(
        results.map((agency) => ({
          value: agency.neaRegNo,
          label: `${agency.neaRegNo} - ${agency.agencyName}`,
        })),
      );
    } catch {
      setAgencyOptions([]);
    } finally {
      setIsSearchingAgencies(false);
    }
  }, []);

  useEffect(() => {
    if (agentNumber && !localAgentName) {
      void searchAgencies(agentNumber).then(() => {
        const cached = agencyCacheRef.current.get(agentNumber.toUpperCase()) ?? [];
        const match = cached.find((agency) => agency.neaRegNo === agentNumber);
        if (match) {
          setLocalAgentName(match.agencyName);
        }
      });
    }
  }, [agentNumber, localAgentName, searchAgencies]);

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
    const next = value ?? '';
    setAgentNumber(next);

    if (agencyDebounceRef.current) {
      clearTimeout(agencyDebounceRef.current);
    }

    agencyDebounceRef.current = setTimeout(() => {
      void searchAgencies(next);
    }, 150);
  };

  const handleAgentSelect = (value: string) => {
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

  return (
    <Form action={formAction} state={state}>
      <input type="hidden" name="agentNumber" value={agentNumber} />
      <input type="hidden" name="localAgentName" value={localAgentName} />
      <input type="hidden" name="convertedKesAmount" value={convertedKesAmount} />

      <Container className="py-8">
        <FormCard title="Recruitment Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              state={state}
              name="agentNumber"
              label="Agent Number (NEA)"
              required
              control={() => (
                <SearchInput
                  defaultValue={defaultValues?.agentNumber}
                  placeholder="Start typing agent number..."
                  options={agencySearchOptions}
                  isLoading={isSearchingAgencies}
                  onValueChange={handleAgentNumberChange}
                  onValueSelect={handleAgentSelect}
                />
              )}
            />

            <ReadOnlyDisplay
              label="Name of Local Recruitment Agent"
              value={localAgentName}
            />

            <FormField
              name="employerAbroad"
              label="Employer Abroad"
              required
              state={state}
              defaultValue={defaultValues?.employerAbroad}
            />

            <FormField
              name="recruiterCode"
              label="Employer Code"
              required
              state={state}
              defaultValue={defaultValues?.recruiterCode}
            />

            <FormField
              name="countryOfDestination"
              label="Country of Destination"
              required
              state={state}
              defaultValue={defaultValues?.countryOfDestination}
            />

            <FormField
              name="natureOfWork"
              label="Nature of Work"
              required
              state={state}
              defaultValue={defaultValues?.natureOfWork}
            />

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

            <FormField
              name="workDuration"
              label="Duration/Tenure of Work"
              type="number"
              required
              state={state}
              defaultValue={defaultValues?.workDuration}
              placeholder="Enter duration"
            />

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
          </div>

          {convertedKesAmount ? (
            <p className="text-success mt-4 text-sm">
              Equivalent in KES: <strong>Ksh {convertedKesAmount}</strong>
            </p>
          ) : null}
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending}
        prevUrl={`/apply/individual/${memberId}/guarantor`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
