'use client';

import { changePasswordSchema } from '@/app/ps/(portal)/profile/change-password-schema';
import { Alert } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Field, Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { type FC, useState } from 'react';

export const ChangePasswordForm: FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    setIsPending(true);

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        fieldErrors.currentPassword?.[0] ??
        fieldErrors.newPassword?.[0] ??
        fieldErrors.confirmPassword?.[0] ??
        'Invalid input';
      setMessage({ type: 'error', text: firstError });
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch('/api/ps/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message ?? 'Unable to change password' });
        return;
      }

      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setFormKey((k) => k + 1);
    } catch {
      setMessage({ type: 'error', text: 'Unable to change password. Please try again.' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div key={formKey}>
      <Form action={handleSubmit} className="space-y-4">
        {message ? (
          <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
        ) : null}

        <Field
          name="currentPassword"
          label="Current password"
          required
          control={(props) => (
            <Input type="password" autoComplete="current-password" {...props} />
          )}
        />

        <Field
          name="newPassword"
          label="New password"
          required
          control={(props) => (
            <Input type="password" autoComplete="new-password" {...props} />
          )}
        />

        <Field
          name="confirmPassword"
          label="Confirm new password"
          required
          control={(props) => (
            <Input type="password" autoComplete="new-password" {...props} />
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Updating…' : 'Change password'}
        </Button>
      </Form>
    </div>
  );
};
