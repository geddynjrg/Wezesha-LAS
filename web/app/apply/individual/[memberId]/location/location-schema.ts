import { z } from 'zod';

export const locationSchema = z.object({
  county: z.string().min(1, 'County is required'),
  constituency: z.string().min(1, 'Constituency is required'),
  ward: z.string().min(1, 'Ward is required'),
  location: z.string().optional(),
  subLocation: z.string().optional(),
});

export type LocationInput = z.infer<typeof locationSchema>;
