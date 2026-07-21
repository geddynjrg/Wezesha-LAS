import { z } from 'zod';

export const loanDetailSchema = z.object({
  lender: z.string().min(1, 'Name of lender is required'),
  date: z.string().min(1, 'Date applied is required'),
  amount: z
    .string()
    .min(1, 'Amount loaned is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'Amount must be a valid number',
    }),
  duration: z.string().min(1, 'Duration of loan is required'),
  monthlyInstallment: z
    .string()
    .min(1, 'Monthly instalment is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'Monthly instalment must be a valid number',
    }),
  outstandingAmount: z
    .string()
    .min(1, 'Outstanding amount is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'Outstanding amount must be a valid number',
    }),
});

export const loanDetailsSchema = z.array(loanDetailSchema).min(1, 'At least one loan record is required');

export const creditHistoryFormSchema = z
  .object({
    hasLoanHistory: z.enum(['yes', 'no'], {
      required_error: 'Please indicate whether you have applied for a loan before',
    }),
    loanDetailsJson: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasLoanHistory !== 'yes') {
      return;
    }

    if (!data.loanDetailsJson?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Loan details are required when you have prior loan history',
        path: ['loanDetailsJson'],
      });
      return;
    }

    try {
      loanDetailsSchema.parse(JSON.parse(data.loanDetailsJson));
    } catch (error) {
      if (error instanceof z.ZodError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error.errors[0]?.message ?? 'Invalid loan details',
          path: ['loanDetailsJson'],
        });
        return;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid loan details',
        path: ['loanDetailsJson'],
      });
    }
  });

export type LoanDetailInput = z.infer<typeof loanDetailSchema>;

export function createDefaultLoanDetail(): LoanDetailInput {
  return {
    lender: '',
    date: '',
    amount: '',
    duration: '',
    monthlyInstallment: '',
    outstandingAmount: '',
  };
}

export function parseLoanDetailsJson(json: string): LoanDetailInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid loan details');
  }
  return loanDetailsSchema.parse(parsed);
}

export function formatLoanDate(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}
