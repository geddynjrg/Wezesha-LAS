import { z } from 'zod';
import {
  formatKenyanPhoneForDisplay,
  isValidKenyanMobile,
  normalizeKenyanPhoneForApi,
} from '@/lib/phone/kenyan-phone';

export const GENDER_OPTIONS = ['Male', 'Female'] as const;

const kenyanPhoneSchema = z
  .string()
  .min(9, 'Phone number is required')
  .transform((value) => normalizeKenyanPhoneForApi(value))
  .refine(isValidKenyanMobile, 'Enter a valid Kenyan mobile number (e.g. 07XX XXX XXX or 01XX XXX XXX)');

export const guarantorFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(GENDER_OPTIONS, { required_error: 'Gender is required' }),
  kraPin: z.string().min(1, 'KRA PIN is required'),
  county: z.string().min(1, 'County is required'),
  constituency: z.string().min(1, 'Subcounty is required'),
  ward: z.string().min(1, 'Ward is required'),
  location: z.string().optional(),
  subLocation: z.string().optional(),
  nationalId: z.string().min(1, 'National ID is required'),
  phone: kenyanPhoneSchema,
});

export const guarantorFormSchema = z.object({
  guarantor1: guarantorFieldsSchema,
  guarantor2: guarantorFieldsSchema,
});

const flatGuarantorFields = (prefix: 'guarantor1' | 'guarantor2') =>
  z.object({
    [`${prefix}_name`]: z.string().min(1, 'Name is required'),
    [`${prefix}_gender`]: z.enum(GENDER_OPTIONS, { required_error: 'Gender is required' }),
    [`${prefix}_kraPin`]: z.string().min(1, 'KRA PIN is required'),
    [`${prefix}_county`]: z.string().min(1, 'County is required'),
    [`${prefix}_constituency`]: z.string().min(1, 'Subcounty is required'),
    [`${prefix}_ward`]: z.string().min(1, 'Ward is required'),
    [`${prefix}_location`]: z.string().optional(),
    [`${prefix}_subLocation`]: z.string().optional(),
    [`${prefix}_nationalId`]: z.string().min(1, 'National ID is required'),
    [`${prefix}_phone`]: kenyanPhoneSchema,
  });

export const guarantorFlatFormSchema = flatGuarantorFields('guarantor1').merge(
  flatGuarantorFields('guarantor2'),
);

export type GuarantorFieldsInput = z.infer<typeof guarantorFieldsSchema>;
export type GuarantorFormInput = z.infer<typeof guarantorFormSchema>;

export function parseGuarantorFormData(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export function extractGuarantorInput(
  raw: Record<string, string>,
  guarantorNumber: 1 | 2,
): GuarantorFieldsInput {
  const prefix = `guarantor${guarantorNumber}_`;
  return {
    name: raw[`${prefix}name`] ?? '',
    gender: raw[`${prefix}gender`] as GuarantorFieldsInput['gender'],
    kraPin: raw[`${prefix}kraPin`] ?? '',
    county: raw[`${prefix}county`] ?? '',
    constituency: raw[`${prefix}constituency`] ?? '',
    ward: raw[`${prefix}ward`] ?? '',
    location: raw[`${prefix}location`] || undefined,
    subLocation: raw[`${prefix}subLocation`] || undefined,
    nationalId: raw[`${prefix}nationalId`] ?? '',
    phone: raw[`${prefix}phone`] ?? '',
  };
}

export function guarantorToFormDefaults(
  guarantor: {
    name: string;
    gender: string;
    kraPin: string;
    county: string;
    constituency: string;
    ward: string;
    location: string | null;
    subLocation: string | null;
    nationalId: string;
    phone: string;
    otpVerified: boolean;
    otpStatus: string;
  } | undefined,
  guarantorNumber: 1 | 2,
): Record<string, string | undefined> {
  const prefix = `guarantor${guarantorNumber}_`;
  if (!guarantor) {
    return {};
  }

  return {
    [`${prefix}name`]: guarantor.name,
    [`${prefix}gender`]: guarantor.gender,
    [`${prefix}kraPin`]: guarantor.kraPin,
    [`${prefix}county`]: guarantor.county,
    [`${prefix}constituency`]: guarantor.constituency,
    [`${prefix}ward`]: guarantor.ward,
    [`${prefix}location`]: guarantor.location ?? undefined,
    [`${prefix}subLocation`]: guarantor.subLocation ?? undefined,
    [`${prefix}nationalId`]: guarantor.nationalId,
    [`${prefix}phone`]: formatKenyanPhoneForDisplay(guarantor.phone),
  };
}
