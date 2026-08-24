'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { saveBudgetAction } from './budget-action';
import {
  MIN_BUDGET_ITEMS,
  budgetFormSchema,
  calculateBudgetTotal,
  createDefaultBudgetItems,
  type BudgetItemInput,
} from './budget-schema';
import { formatCurrency } from '@/lib/loan/award-amount';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useMemo, useState } from 'react';

interface BudgetFormProps {
  memberId: string;
  maxAppliedAmount: number;
  defaultItems?: BudgetItemInput[];
}

export const BudgetForm: FC<BudgetFormProps> = ({
  memberId,
  maxAppliedAmount,
  defaultItems,
}) => {
  const initialItems =
    defaultItems && defaultItems.length >= MIN_BUDGET_ITEMS
      ? defaultItems
      : createDefaultBudgetItems();

  const action = saveBudgetAction.bind(null, memberId);
  const [budgetItems, setBudgetItems] = useState<BudgetItemInput[]>(initialItems);
  const [state, formAction, isPending] = useForm(action, budgetFormSchema, {
    budgetItemsJson: JSON.stringify(initialItems),
  });

  const grandTotal = useMemo(() => calculateBudgetTotal(budgetItems), [budgetItems]);
  const filledCount = budgetItems.filter((item) => item.item.trim() && item.cost).length;
  const usagePercent =
    maxAppliedAmount > 0 ? Math.min((grandTotal / maxAppliedAmount) * 100, 100) : 0;
  const exceedsMax = maxAppliedAmount > 0 && grandTotal > maxAppliedAmount;

  const updateItem = (index: number, field: keyof BudgetItemInput, value: string) => {
    setBudgetItems((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    setBudgetItems((current) => [...current, { item: '', cost: '' }]);
  };

  const removeItem = (index: number) => {
    if (budgetItems.length <= MIN_BUDGET_ITEMS) return;
    setBudgetItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <Form action={formAction} state={state}>
      <input type="hidden" name="budgetItemsJson" value={JSON.stringify(budgetItems)} />

      <Container className="py-8">
        <FormCard title="Budget Breakdown for Loan Requested">
          <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="typo-body-medium">
              Maximum allowed (group application amount):{' '}
              <strong className="text-success">KES {formatCurrency(maxAppliedAmount)}</strong>
            </p>
            <p className="text-muted-foreground typo-body-small mt-1">
              The grand total of your budget breakdown must not exceed this amount.
            </p>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="typo-body-medium">Budget items progress</span>
              <span
                className={cn(
                  'typo-body-medium font-semibold',
                  filledCount >= MIN_BUDGET_ITEMS ? 'text-success' : 'text-destructive',
                )}
              >
                {filledCount} of {MIN_BUDGET_ITEMS} minimum
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
              <div
                className={cn(
                  'h-full transition-all',
                  filledCount >= MIN_BUDGET_ITEMS ? 'bg-success' : 'bg-warning',
                )}
                style={{ width: `${Math.min(100, (filledCount / MIN_BUDGET_ITEMS) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {budgetItems.map((entry, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div className="flex w-full flex-col gap-1">
                  <label className="mb-1 font-bold text-sm">
                    Item/Particulars {index + 1} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={entry.item}
                    placeholder={`Item ${index + 1}`}
                    onChange={(event) => updateItem(index, 'item', event.target.value)}
                  />
                </div>

                <div className="flex w-full flex-col gap-1">
                  <label className="mb-1 font-bold text-sm">
                    Amount (KES) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={entry.cost}
                    placeholder="0.00"
                    onChange={(event) => updateItem(index, 'cost', event.target.value)}
                  />
                </div>

                {budgetItems.length > MIN_BUDGET_ITEMS ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mb-1"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-neutral-200 pt-4">
            <p className={cn('typo-h6', exceedsMax ? 'text-destructive' : 'text-primary')}>
              Grand Total: KES {formatCurrency(grandTotal)}
            </p>

            {maxAppliedAmount > 0 ? (
              <>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className={cn(
                      'h-full transition-all',
                      exceedsMax ? 'bg-destructive' : 'bg-success',
                    )}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="text-muted-foreground typo-body-small">
                  {usagePercent.toFixed(1)}% of maximum used
                </p>
              </>
            ) : null}

            {state?.errors?.budgetItemsJson?.map((message) => (
              <p key={message} className="text-destructive typo-body-small">
                {typeof message === 'string' ? message : message.message}
              </p>
            ))}
          </div>

          <div className="mt-4">
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              Add Item
            </Button>
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending || exceedsMax || filledCount < MIN_BUDGET_ITEMS}
        prevUrl={`/apply/individual/${memberId}/recruitment`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
