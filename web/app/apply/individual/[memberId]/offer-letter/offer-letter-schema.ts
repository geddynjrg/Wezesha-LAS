import { z } from 'zod';

export const offerLetterSchema = z.object({
  digitalSignature: z
    .string()
    .min(1, 'Sign the offer letter using the signature pad.')
    .refine((value) => value.startsWith('data:image/') && value.length > 100, {
      message: 'Sign the offer letter using the signature pad.',
    }),
  termsAccepted: z.literal('on', {
    errorMap: () => ({ message: 'Accept the terms and conditions to continue.' }),
  }),
  alsoSignTripartite: z.string().optional(),
});
