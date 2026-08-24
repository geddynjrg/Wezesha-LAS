'use server';

import { psLoginSchema, type PsLogin } from '@/app/ps/sign-in/ps-login-schema';
import { loginPsWithEmail } from '@/lib/auth/user';
import { createSession } from '@/lib/auth/session';
import type { FormAction } from '@workspace/ui/hooks/use-form';
import { getFormZodDataValues } from '@workspace/ui/lib/utils';

export const psLoginAction: FormAction<PsLogin> = async (
  _prev,
  formData,
) => {
  const values = getFormZodDataValues(formData, psLoginSchema);
  const { data, success, error } = psLoginSchema.safeParse(values);

  if (error) {
    return {
      success,
      errors: error.flatten().fieldErrors,
      values,
    };
  }

  try {
    const tokens = await loginPsWithEmail(data.email, data.password);
    await createSession(tokens);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      errors: {},
      message: err instanceof Error ? err.message : 'Unable to sign in',
      values,
    };
  }
};
