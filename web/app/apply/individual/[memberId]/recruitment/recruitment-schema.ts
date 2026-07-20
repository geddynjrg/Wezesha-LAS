import { z } from 'zod';

export const DURATION_TYPE_OPTIONS = ['months', 'years'] as const;
export const CURRENCY_OPTIONS = ['KWD', 'AED', 'RUB'] as const;

export const recruitmentSchema = z.object({
  agentNumber: z.string().min(1, 'Agent number is required'),
  localAgentName: z.string().min(1, 'Local recruitment agent name is required'),
  employerAbroad: z.string().min(1, 'Employer abroad is required'),
  recruiterCode: z.string().min(1, 'Employer code is required'),
  countryOfDestination: z.string().min(1, 'Country of destination is required'),
  natureOfWork: z.string().min(1, 'Nature of work is required'),
  durationType: z.enum(DURATION_TYPE_OPTIONS, {
    errorMap: () => ({ message: 'Duration type is required' }),
  }),
  workDuration: z
    .string()
    .min(1, 'Work duration is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: 'Work duration must be a positive number',
    }),
  currency: z.enum(CURRENCY_OPTIONS, {
    errorMap: () => ({ message: 'Currency is required' }),
  }),
  monthlyRemuneration: z
    .string()
    .min(1, 'Monthly remuneration is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: 'Monthly remuneration must be a positive number',
    }),
  convertedKesAmount: z.string().optional(),
});

export type RecruitmentInput = z.infer<typeof recruitmentSchema>;
