import { normalizeMseaRegistrationNumber } from '@/lib/msea';
import { z } from 'zod';

export const groupInformationSchema = z.object({
  groupName: z.string().min(2, 'Group name is required'),
  registrationNumber: z
    .string()
    .min(2, 'Registration number is required')
    .transform(normalizeMseaRegistrationNumber)
    .refine((v) => v.length >= 2, 'Registration number is required'),
  registrationDate: z
    .string()
    .min(1, 'Registration date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid registration date'),
});

export type GroupInformationInput = z.infer<typeof groupInformationSchema>;
