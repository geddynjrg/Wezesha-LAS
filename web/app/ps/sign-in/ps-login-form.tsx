'use client';

import { psLoginSchema } from '@/app/ps/sign-in/ps-login-schema';
import { Alert } from '@workspace/ui/components/alert';
import { Field, Form, SubmitButton } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useEffect } from 'react';
import { psLoginAction } from './ps-login-actions';

export interface PsLoginFormProps {
  redirectTo?: string;
}

export const PsLoginForm: FC<PsLoginFormProps> = ({ redirectTo = '/ps/dashboard' }) => {
  const [state, formAction, isPending] = useForm(psLoginAction, psLoginSchema);

  useEffect(() => {
    if (state.success) {
      window.location.href = redirectTo;
    }
  }, [redirectTo, state.success]);

  return (
    <Form action={formAction} className="space-y-6" autoComplete="on">
      {state.message ? (
        <Alert variant="error" className="mb-4">
          {state.message}
        </Alert>
      ) : null}

      <Field
        state={state}
        name="email"
        label="Official email"
        required
        control={(props) => (
          <Input placeholder="ps@labour.go.ke" autoComplete="username" {...props} />
        )}
      />

      <Field
        state={state}
        name="password"
        label="Password"
        required
        control={(props) => (
          <Input
            type="password"
            placeholder="••••••••••••••••••••"
            autoComplete="current-password"
            {...props}
          />
        )}
      />

      <SubmitButton className="w-full" disabled={isPending}>
        Sign in
      </SubmitButton>
    </Form>
  );
};
