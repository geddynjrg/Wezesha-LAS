'use client';

import { SignaturePad } from '@/components/signature-pad';
import { psSignSchema } from '@/app/ps/sign-in/ps-login-schema';
import { Alert } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useState } from 'react';
import { psSigningBatchAction } from './ps-signing-batch-action';

interface PsSigningBatchFormProps {
  pendingCount: number;
}

export const PsSigningBatchForm: FC<PsSigningBatchFormProps> = ({ pendingCount }) => {
  const [signature, setSignature] = useState<string | null>(null);
  const [state, formAction, isPending] = useForm(psSigningBatchAction, psSignSchema, {
    digitalSignature: '',
  });

  return (
    <Form action={formAction} className="mt-6">
      <FormCard title="Append your signature">
        <p className="mb-4 text-neutral-600">
          Review the agreements above, then sign once below to forward all {pendingCount} pending
          agreement{pendingCount === 1 ? '' : 's'} to the Labour Principal Secretary for signature.
        </p>

        {state.message ? (
          <Alert variant="error" className="mb-4">
            {state.message}
          </Alert>
        ) : null}
        {state.errors?.digitalSignature ? (
          <Alert variant="error" className="mb-4">
            {String(state.errors.digitalSignature[0])}
          </Alert>
        ) : null}

        <SignaturePad onChange={setSignature} />
        <input type="hidden" name="digitalSignature" value={signature ?? ''} />

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isPending || !signature}>
            Sign and forward to Labour PS
          </Button>
        </div>
      </FormCard>
    </Form>
  );
};
