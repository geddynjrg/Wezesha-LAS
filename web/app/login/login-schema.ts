import {
  isValidKenyanPhoneNumber,
  normalizeKenyanPhoneLocal,
} from '@/lib/phone/kenyan-phone';
import { z } from 'zod';

export const createEmailLoginSchema = (t: (key: string) => string) =>
  z.object({
    loginType: z.literal('email'),
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(1, t('passwordRequired')),
  });

export const emailLoginSchema = z.object({
  loginType: z.literal('email'),
  email: z.string().email(),
  password: z.string().min(1),
});

export type EmailLogin = z.infer<typeof emailLoginSchema>;

const phoneLoginBaseSchema = z.object({
  loginType: z.literal('phone'),
  phone: z.preprocess(
    (value) =>
      typeof value === 'string'
        ? (normalizeKenyanPhoneLocal(value) ?? value.replace(/\D/g, ''))
        : value,
    z.string().optional(),
  ),
  otp_code: z.string().optional(),
  request_id: z.string().optional(),
});

export const createPhoneLoginSchema = (t: (key: string) => string) =>
  phoneLoginBaseSchema.superRefine((data, ctx) => {
    if (data.otp_code && data.request_id) {
      if (!data.otp_code || data.otp_code.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['otp_code'],
          message: t('invalidOtpFormat'),
        });
      }
    } else {
      if (!data.phone || data.phone.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: t('phoneNumberRequired'),
        });
      } else if (!isValidKenyanPhoneNumber(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: t('invalidPhoneFormat'),
        });
      }
    }
  });

export const phoneLoginSchema = phoneLoginBaseSchema;

export type PhoneLogin = z.infer<typeof phoneLoginSchema>;

export const loginSchema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty(),
});

export type Login = z.infer<typeof loginSchema>;
