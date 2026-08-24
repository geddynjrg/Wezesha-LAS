import {
  MAX_GROUP_LOAN_TOTAL_MESSAGE,
  MAX_GROUP_MEMBER_LOAN_TOTAL,
  MAX_MEMBER_LOAN_AMOUNT,
  MAX_MEMBER_LOAN_AMOUNT_MESSAGE,
} from '@/lib/adjust-loan-amounts';
import { z } from 'zod';

export function createMemberDetailsSchema(count: number) {
  const shape: Record<string, z.ZodTypeAny> = {
    memberCount: z.coerce.number(),
    expectedMemberCount: z.coerce.number(),
  };

  for (let index = 0; index < count; index++) {
    shape[`name_${index}`] = z.string().trim().min(2, 'Full name is required');
    shape[`idNo_${index}`] = z.string().trim().min(5, 'National ID is required');
    shape[`mobile_${index}`] = z.string().trim().min(9, 'Mobile number is required');
    shape[`email_${index}`] = z.string().trim().email('Enter a valid email address');
    shape[`passportNo_${index}`] = z.string().trim().min(2, 'Passport number is required');
    shape[`purpose_${index}`] = z.string().trim().min(2, 'Purpose is required');
    shape[`amount_${index}`] = z.coerce
      .number({ message: 'Loan amount is required' })
      .min(1, 'Loan amount is required')
      .max(MAX_MEMBER_LOAN_AMOUNT, MAX_MEMBER_LOAN_AMOUNT_MESSAGE);
  }

  return z.object(shape).superRefine((data, ctx) => {
    const seen = new Map<string, number>();

    for (let index = 0; index < count; index++) {
      const idNo = String(data[`idNo_${index}`] ?? '').trim();
      if (!idNo) {
        continue;
      }

      const firstIndex = seen.get(idNo);
      if (firstIndex != null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate National ID.',
          path: [`idNo_${index}`],
        });
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate National ID.',
          path: [`idNo_${firstIndex}`],
        });
        continue;
      }

      seen.set(idNo, index);
    }

    const total = Array.from({ length: count }, (_, index) =>
      Number(data[`amount_${index}`] ?? 0),
    ).reduce((sum, amount) => sum + amount, 0);

    if (total > MAX_GROUP_MEMBER_LOAN_TOTAL && count > 0) {
      for (let index = 0; index < count; index++) {
        ctx.addIssue({
          code: 'custom',
          message: MAX_GROUP_LOAN_TOTAL_MESSAGE,
          path: [`amount_${index}`],
        });
      }
    }
  });
}

export function parseMemberDetailsForm(formData: FormData, count: number) {
  const parsed = createMemberDetailsSchema(count).safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return parsed;
  }

  const members = [];

  for (let index = 0; index < count; index++) {
    const data = parsed.data;
    members.push({
      name: String(data[`name_${index}`]).trim(),
      idNo: String(data[`idNo_${index}`]).trim(),
      mobile: String(data[`mobile_${index}`]).trim(),
      email: String(data[`email_${index}`]).trim(),
      passportNo: String(data[`passportNo_${index}`]).trim(),
      purpose: String(data[`purpose_${index}`]).trim(),
      amount: Number(data[`amount_${index}`]),
    });
  }

  return { success: true as const, data: members };
}
