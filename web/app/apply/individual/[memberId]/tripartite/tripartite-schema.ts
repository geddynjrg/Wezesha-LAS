import { z } from 'zod';

export const tripartiteFormSchema = z.object({
  migrantName: z.string().trim().min(1, 'Full name is required'),
  idNumber: z.string().trim().min(1, 'ID number is required'),
  passportNumber: z.string().trim().min(1, 'Passport number is required'),
  tripartiteAccepted: z.literal('on', {
    errorMap: () => ({ message: 'You must accept the tripartite agreement' }),
  }),
});

export type TripartiteFormInput = z.infer<typeof tripartiteFormSchema>;
