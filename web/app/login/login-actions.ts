'use server';

import {
  type EmailLogin,
  type PhoneLogin,
  createEmailLoginSchema,
  createPhoneLoginSchema,
} from '@/app/login/login-schema';
import {
  OtpDeliveryError,
  requestLoginOtp,
  verifyLoginOtp,
} from '@/lib/auth/otp';
import { loginWithEmail } from '@/lib/auth/user';
import { createSession } from '@/lib/auth/session';
import { formatKenyanPhoneForApi } from '@/lib/phone/kenyan-phone';
import type { FormAction } from '@workspace/ui/hooks/use-form';
import { getFormZodDataValues } from '@workspace/ui/lib/utils';
import { getTranslations } from 'next-intl/server';

export const emailLoginAction: FormAction<EmailLogin> = async (
  _prev,
  formData,
) => {
  const t = await getTranslations('LoginPage');
  const emailLoginSchema = createEmailLoginSchema((key: string) =>
    t(key as Parameters<typeof t>[0]),
  );
  const values = getFormZodDataValues(formData, emailLoginSchema);
  const { data, success, error } = emailLoginSchema.safeParse(values);

  if (error) {
    return {
      success,
      errors: error.flatten().fieldErrors,
      values,
    };
  }

  try {
    const tokens = await loginWithEmail(data.email, data.password);
    await createSession(tokens);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      errors: {},
      message: err instanceof Error ? err.message : t('unknownError'),
      values,
    };
  }
};

export const phoneLoginAction: FormAction<PhoneLogin> = async (
  _prev,
  formData,
) => {
  const t = await getTranslations('LoginPage');
  const phoneLoginSchema = createPhoneLoginSchema((key: string) =>
    t(key as Parameters<typeof t>[0]),
  );
  const values = getFormZodDataValues(formData, phoneLoginSchema);
  const { data, success, error } = phoneLoginSchema.safeParse(values);

  if (error) {
    return {
      success,
      errors: error.flatten().fieldErrors,
      values,
    };
  }

  try {
    if (!data.otp_code) {
      const fullPhoneNumber = formatKenyanPhoneForApi(data.phone!);
      if (!fullPhoneNumber) {
        return {
          success: false,
          errors: { phone: [t('invalidPhoneFormat')] },
          values,
        };
      }

      const failoverEmail =
        typeof (values as { email?: string }).email === 'string'
          ? String((values as { email?: string }).email)
          : undefined;

      const otpResponse = await requestLoginOtp(fullPhoneNumber, {
        email: failoverEmail,
      });
      return {
        success: true,
        message: otpResponse.message || t('otpSent'),
        values,
        otpRequestId: otpResponse.request_id,
        otpChannel: otpResponse.channel,
      };
    }

    const tokens = await verifyLoginOtp(data.request_id!, data.otp_code);
    await createSession(tokens);
    return { success: true, otpRequestId: undefined };
  } catch (err) {
    if (err instanceof OtpDeliveryError && err.needEmail) {
      return {
        success: false,
        errors: {},
        message: err.message,
        values,
        needEmail: true,
      };
    }
    return {
      success: false,
      errors: {},
      message: err instanceof Error ? err.message : t('unknownError'),
      values,
    };
  }
};
