import { z } from 'zod';

export const psLoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type PsLogin = z.infer<typeof psLoginSchema>;

export const psSignSchema = z.object({
  digitalSignature: z
    .string()
    .min(1, 'Signature is required')
    .refine((value) => value.startsWith('data:image/'), 'Invalid signature format'),
});

export type PsSign = z.infer<typeof psSignSchema>;
