import { z } from 'zod';

export const groupBankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  branchName: z.string().min(1, 'Branch name is required'),
  accountName: z.string().min(2, 'Bank account name is required'),
  accountNumber: z.string().min(5, 'Bank account number is required'),
});

export type GroupBankInput = z.infer<typeof groupBankSchema>;
