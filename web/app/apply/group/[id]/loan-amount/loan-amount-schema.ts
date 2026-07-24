import {
  MAX_GROUP_LOAN_TOTAL_MESSAGE,
  MAX_GROUP_MEMBER_LOAN_TOTAL,
  MAX_MEMBER_LOAN_AMOUNT,
  MAX_MEMBER_LOAN_AMOUNT_MESSAGE,
} from '@/lib/adjust-loan-amounts';
import { z } from 'zod';

export function createLoanAmountSchema(memberIds: string[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const memberId of memberIds) {
    shape[`amount_${memberId}`] = z.coerce
      .number({ message: 'Loan amount is required' })
      .min(1, 'Loan amount is required')
      .max(MAX_MEMBER_LOAN_AMOUNT, MAX_MEMBER_LOAN_AMOUNT_MESSAGE);
  }

  return z.object(shape).superRefine((data, ctx) => {
    const total = memberIds.reduce(
      (sum, memberId) => sum + Number(data[`amount_${memberId}`] ?? 0),
      0,
    );

    if (total > MAX_GROUP_MEMBER_LOAN_TOTAL && memberIds.length > 0) {
      for (const memberId of memberIds) {
        ctx.addIssue({
          code: 'custom',
          message: MAX_GROUP_LOAN_TOTAL_MESSAGE,
          path: [`amount_${memberId}`],
        });
      }
    }
  });
}

export function parseLoanAmountForm(formData: FormData, memberIds: string[]) {
  return createLoanAmountSchema(memberIds).safeParse(
    Object.fromEntries(formData.entries()),
  );
}
