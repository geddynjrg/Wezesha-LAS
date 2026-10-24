import { z } from 'zod';

export const MIN_APPLICANT_AGE = 18;

export const DOB_BELOW_MIN_AGE_MESSAGE = 'The selected date is below 18 years';

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

export interface IndividualInformationMemberDefaults {
  name: string;
  idNo: string;
  gender: string | null;
  dob: string;
  passportNo: string;
  kraPin: string;
  educationLevel: string | null;
  mobile: string;
  email: string;
  poBox: string;
  postalCode: string;
  town: string;
  dependants: number | null;
}

export function formatDateForInput(value?: Date | string | null): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

export function isAtLeastMinApplicantAge(
  dob: string,
  minAge = MIN_APPLICANT_AGE,
): boolean {
  const birthDate = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age >= minAge;
}

export function getIndividualInformationMemberDefaults(member: {
  name: string;
  idNo: string;
  gender?: string | null;
  dob?: Date | string | null;
  passportNo?: string | null;
  kraPin?: string | null;
  educationLevel?: string | null;
  mobile: string;
  email?: string | null;
  poBox?: string | null;
  postalCode?: string | null;
  town?: string | null;
  dependants?: number | null;
}): IndividualInformationMemberDefaults {
  return {
    name: member.name,
    idNo: member.idNo,
    gender: member.gender ?? null,
    dob: formatDateForInput(member.dob),
    passportNo: member.passportNo ?? '',
    kraPin: member.kraPin ?? '',
    educationLevel: member.educationLevel ?? null,
    mobile: member.mobile,
    email: member.email ?? '',
    poBox: member.poBox ?? '',
    postalCode: member.postalCode ?? '',
    town: member.town ?? '',
    dependants: member.dependants ?? null,
  };
}

export const individualInformationSchema = z
  .object({
    gender: z.enum(GENDER_OPTIONS, { message: 'Gender is required' }),
    dob: z.string().min(1, 'Date of birth is required'),
    kraPin: z.string().min(1, 'KRA PIN is required'),
    educationLevel: z.enum(EDUCATION_LEVEL_OPTIONS, {
      message: 'Education level is required',
    }),
    educationLevelOther: z.string().optional(),
    poBox: z.string().min(1, 'P.O. Box is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    town: z.string().min(1, 'Town is required'),
    dependants: z
      .union([z.string(), z.number()])
      .transform((value, ctx) => {
        if (value === '' || value == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dependants is required',
          });
          return z.NEVER;
        }
        const n = typeof value === 'number' ? value : Number(String(value).trim());
        if (Number.isNaN(n)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Dependants is required',
          });
          return z.NEVER;
        }
        return n;
      })
      .pipe(z.number().int().min(0, 'Dependants must be 0 or more')),
  })
  .superRefine((data, ctx) => {
    if (data.educationLevel === 'Other' && !data.educationLevelOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your education level',
        path: ['educationLevelOther'],
      });
    }

    const dob = data.dob.trim();
    if (!isAtLeastMinApplicantAge(dob)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: DOB_BELOW_MIN_AGE_MESSAGE,
        path: ['dob'],
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
