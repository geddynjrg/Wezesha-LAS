import { z } from 'zod';

export const signatureSchema = z.object({
  digitalSignature: z
    .string()
    .min(1, 'Please sign in the box above')
    .refine((value) => value.startsWith('data:image/') && value.length > 100, {
      message: 'Please sign in the box above',
    }),
});

export type SignatureInput = z.infer<typeof signatureSchema>;
