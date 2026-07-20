import { z } from 'zod';

export const EDUCATION_LEVEL_OPTIONS = [
  'KCPE',
  'KCSE',
  'None',
  'University',
  'Other',
] as const;

export type EducationLevelOption = (typeof EDUCATION_LEVEL_OPTIONS)[number];

export const GENDER_OPTIONS = ['Male', 'Female'] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];

export const individualInformationSchema = z
  .object({
    gender: z.enum(GENDER_OPTIONS, { message: 'Gender is required' }),
    dob: z.string().optional(),
    kraPin: z.string().optional(),
    educationLevel: z.enum(EDUCATION_LEVEL_OPTIONS, {
      message: 'Education level is required',
    }),
    educationLevelOther: z.string().optional(),
    poBox: z.string().optional(),
    postalCode: z.string().optional(),
    town: z.string().optional(),
    dependants: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.educationLevel === 'Other' && !data.educationLevelOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your education level',
        path: ['educationLevelOther'],
      });
    }
  });

export type IndividualInformationInput = z.infer<typeof individualInformationSchema>;

export function resolveEducationLevelForForm(storedValue?: string | null): {
  educationLevel: EducationLevelOption | '';
  educationLevelOther: string;
} {
  if (!storedValue) {
    return { educationLevel: '', educationLevelOther: '' };
  }

  if (EDUCATION_LEVEL_OPTIONS.includes(storedValue as EducationLevelOption)) {
    return { educationLevel: storedValue as EducationLevelOption, educationLevelOther: '' };
  }

  return { educationLevel: 'Other', educationLevelOther: storedValue };
}

export function resolveEducationLevelForSave(
  educationLevel: EducationLevelOption,
  educationLevelOther?: string,
): string {
  if (educationLevel === 'Other') {
    return educationLevelOther?.trim() ?? '';
  }

  return educationLevel;
}
