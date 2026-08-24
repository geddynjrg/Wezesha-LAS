'use server';

import { type Signup, signupSchema } from '@/app/signup/signup-schema';
import { createSession } from '@/lib/auth/session';
import { registerWithEmail } from '@/lib/auth/user';
import type { FormAction } from '@workspace/ui/hooks/use-form';
import { getFormDataValues } from '@workspace/ui/lib/utils';

export const signupAction: FormAction<Signup> = async (_prev, formData) => {
  const values = getFormDataValues(formData, signupSchema);
  const { data, success, error } = signupSchema.safeParse(values);

  if (error) {
    return {
      success,
      errors: error.flatten().fieldErrors,
      values,
    };
  }

  try {
    const tokens = await registerWithEmail(data.email, data.password);
    await createSession(tokens);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      errors: {},
      message: err instanceof Error ? err.message : 'Unknown error',
      values,
    };
  }
};
