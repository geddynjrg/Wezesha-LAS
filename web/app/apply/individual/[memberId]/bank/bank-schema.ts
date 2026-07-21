import { z } from 'zod';

export const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank is required'),
  branchName: z.string().min(1, 'Branch is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
});

export type BankInput = z.infer<typeof bankSchema>;
