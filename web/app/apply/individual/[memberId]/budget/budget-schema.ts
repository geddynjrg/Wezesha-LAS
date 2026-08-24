import { z } from 'zod';

export const MIN_BUDGET_ITEMS = 5;

export const budgetItemSchema = z.object({
  item: z.string().min(1, 'Item/particulars is required'),
  cost: z
    .string()
    .min(1, 'Amount is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: 'Amount must be a positive number',
    }),
});

export const budgetItemsSchema = z
  .array(budgetItemSchema)
  .min(MIN_BUDGET_ITEMS, `At least ${MIN_BUDGET_ITEMS} budget items are required`);

export const budgetFormSchema = z.object({
  budgetItemsJson: z
    .string()
    .min(1, 'Budget items are required')
    .superRefine((value, ctx) => {
      try {
        budgetItemsSchema.parse(JSON.parse(value));
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstIssue = error.errors[0];
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: firstIssue?.message ?? 'Invalid budget items',
          });
          return;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid budget data',
        });
      }
    }),
});

export type BudgetItemInput = z.infer<typeof budgetItemSchema>;

export function parseBudgetItemsJson(json: string): BudgetItemInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid budget data');
  }
  return budgetItemsSchema.parse(parsed);
}

export function calculateBudgetTotal(items: Pick<BudgetItemInput, 'cost'>[]): number {
  return items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
}

export function createDefaultBudgetItems(count = MIN_BUDGET_ITEMS): BudgetItemInput[] {
  return Array.from({ length: count }, () => ({ item: '', cost: '' }));
}

export function validateBudgetAgainstMax(
  items: BudgetItemInput[],
  maxAmount: number,
): string | null {
  if (maxAmount <= 0) {
    return 'No loan amount was set during the group application. Contact support.';
  }

  const total = calculateBudgetTotal(items);
  if (total > maxAmount) {
    return `Grand Total KES ${total.toLocaleString('en-KE')} exceeds allowed maximum of KES ${maxAmount.toLocaleString('en-KE')}`;
  }

  return null;
}
