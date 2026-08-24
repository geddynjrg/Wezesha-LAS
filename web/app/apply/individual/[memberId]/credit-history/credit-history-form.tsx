'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { saveCreditHistoryAction } from './credit-history-action';
import {
  createDefaultLoanDetail,
  creditHistoryFormSchema,
  type LoanDetailInput,
} from './credit-history-schema';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { RadioGroup } from '@workspace/ui/components/radio-group';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useState } from 'react';

interface CreditHistoryFormProps {
  memberId: string;
  defaultHasLoanHistory?: boolean;
  defaultLoanDetails?: LoanDetailInput[];
}

const LOAN_HISTORY_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
] as const;

export const CreditHistoryForm: FC<CreditHistoryFormProps> = ({
  memberId,
  defaultHasLoanHistory = false,
  defaultLoanDetails,
}) => {
  const initialLoanDetails =
    defaultLoanDetails && defaultLoanDetails.length > 0
      ? defaultLoanDetails
      : [createDefaultLoanDetail()];

  const action = saveCreditHistoryAction.bind(null, memberId);
  const [hasLoanHistory, setHasLoanHistory] = useState<'yes' | 'no'>(
    defaultHasLoanHistory ? 'yes' : 'no',
  );
  const [loanDetails, setLoanDetails] = useState<LoanDetailInput[]>(initialLoanDetails);
  const [state, formAction, isPending] = useForm(action, creditHistoryFormSchema, {
    hasLoanHistory: defaultHasLoanHistory ? 'yes' : 'no',
    loanDetailsJson: defaultHasLoanHistory ? JSON.stringify(initialLoanDetails) : '',
  });

  const updateLoanDetail = (index: number, field: keyof LoanDetailInput, value: string) => {
    setLoanDetails((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addLoanDetail = () => {
    setLoanDetails((current) => [...current, createDefaultLoanDetail()]);
  };

  const removeLoanDetail = (index: number) => {
    if (loanDetails.length <= 1) return;
    setLoanDetails((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const loanDetailsInvalid =
    hasLoanHistory === 'yes' &&
    loanDetails.some(
      (detail) =>
        !detail.lender.trim() ||
        !detail.date ||
        !detail.amount ||
        !detail.duration.trim() ||
        !detail.monthlyInstallment ||
        !detail.outstandingAmount,
    );

  return (
    <Form action={formAction} state={state}>
      <input type="hidden" name="hasLoanHistory" value={hasLoanHistory} />
      <input
        type="hidden"
        name="loanDetailsJson"
        value={hasLoanHistory === 'yes' ? JSON.stringify(loanDetails) : ''}
      />

      <Container className="py-8">
        <FormCard title="Credit History">
          <div className="mb-6">
            <label className="mb-3 block font-bold text-sm">
              Have you ever applied for a loan before?
            </label>
            <RadioGroup
              name="hasLoanHistoryDisplay"
              orientation="horizontal"
              defaultValue={hasLoanHistory}
              options={LOAN_HISTORY_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              onValueChange={(value) => setHasLoanHistory(value as 'yes' | 'no')}
            />
            {state?.errors?.hasLoanHistory?.map((message) => (
              <p key={String(message)} className="text-destructive typo-body-small mt-2">
                {typeof message === 'string' ? message : message.message}
              </p>
            ))}
          </div>

          {hasLoanHistory === 'yes' ? (
            <div className="space-y-4">
              {loanDetails.map((detail, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-xl border border-neutral-200 bg-neutral-50 p-4',
                    'space-y-4',
                  )}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex w-full flex-col gap-1">
                      <label className="mb-1 font-bold text-sm">
                        Name of Lender <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={detail.lender}
                        placeholder="Enter lender name"
                        onChange={(event) => updateLoanDetail(index, 'lender', event.target.value)}
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <label className="mb-1 font-bold text-sm">
                        Date Applied <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="date"
                        value={detail.date}
                        onChange={(event) => updateLoanDetail(index, 'date', event.target.value)}
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <label className="mb-1 font-bold text-sm">
                        Amount Loaned <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={detail.amount}
                        placeholder="0.00"
                        onChange={(event) => updateLoanDetail(index, 'amount', event.target.value)}
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <label className="mb-1 font-bold text-sm">
                        Duration of Loan <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={detail.duration}
                        placeholder="e.g. 12 months"
                        onChange={(event) => updateLoanDetail(index, 'duration', event.target.value)}
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <label className="mb-1 font-bold text-sm">
                        Monthly Instalment <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={detail.monthlyInstallment}
                        placeholder="0.00"
                        onChange={(event) =>
                          updateLoanDetail(index, 'monthlyInstallment', event.target.value)
                        }
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <label className="mb-1 font-bold text-sm">
                        Outstanding Amount <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={detail.outstandingAmount}
                        placeholder="0.00"
                        onChange={(event) =>
                          updateLoanDetail(index, 'outstandingAmount', event.target.value)
                        }
                      />
                    </div>
                  </div>

                  {loanDetails.length > 1 ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLoanDetail(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}

              <Button type="button" variant="secondary" size="sm" onClick={addLoanDetail}>
                Add More
              </Button>

              {state?.errors?.loanDetailsJson?.map((message) => (
                <p key={String(message)} className="text-destructive typo-body-small">
                  {typeof message === 'string' ? message : message.message}
                </p>
              ))}
            </div>
          ) : null}
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending || loanDetailsInvalid}
        prevUrl={`/apply/individual/${memberId}/bank`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
