'use client';

import { SignaturePad } from '@/components/signature-pad';
import { TripartiteAgreementDocument } from '@/components/tripartite/tripartite-agreement-document';
import { psSignSchema } from '@/app/ps/sign-in/ps-login-schema';
import { UserRole } from '@/generated/prisma';
import { Alert } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import Link from 'next/link';
import { type FC, useState } from 'react';
import { psSignTripartiteAction } from './ps-sign-action';

interface PsTripartiteFormProps {
  applicationId: string;
  psRole: UserRole;
  acknowledgmentNumber: string;
  migrantName: string;
  idNumber: string;
  passportNumber: string;
  migrantSignature?: string | null;
  labourPsSignature?: string | null;
  labourPsSignedAt?: Date | null;
  msmePsSignature?: string | null;
  msmePsSignedAt?: Date | null;
}

export const PsTripartiteForm: FC<PsTripartiteFormProps> = ({
  applicationId,
  psRole,
  acknowledgmentNumber,
  migrantName,
  idNumber,
  passportNumber,
  migrantSignature,
  labourPsSignature,
  labourPsSignedAt,
  msmePsSignature,
  msmePsSignedAt,
}) => {
  const [signature, setSignature] = useState<string | null>(null);
  const action = psSignTripartiteAction.bind(null, applicationId);
  const [state, formAction, isPending] = useForm(action, psSignSchema, {
    digitalSignature: '',
  });

  const alreadySigned =
    psRole === UserRole.PS_LABOUR
      ? Boolean(labourPsSignature)
      : Boolean(msmePsSignature);

  const roleTitle =
    psRole === UserRole.PS_LABOUR
      ? 'Labour & Skills Development'
      : 'Micro Small and Medium Enterprise Development';

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Application {acknowledgmentNumber}</p>
          <h2 className="typo-h2">Tripartite Agreement</h2>
          <p className="typo-body-medium text-neutral-600">
            {alreadySigned
              ? `View the fully signed agreement including your signature as Principal Secretary – ${roleTitle}.`
              : `Review the agreement below and append your signature as Principal Secretary – ${roleTitle}.`}
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/ps/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <FormCard title="Agreement document">
        <TripartiteAgreementDocument
          migrantName={migrantName}
          idNumber={idNumber}
          passportNumber={passportNumber}
          migrantSignature={migrantSignature}
          labourPsSignature={labourPsSignature}
          labourPsSignedAt={labourPsSignedAt}
          msmePsSignature={msmePsSignature}
          msmePsSignedAt={msmePsSignedAt}
          readOnly
        />
      </FormCard>

      {alreadySigned ? (
        <Alert variant="success" className="mt-6">
          Your signature has been recorded on this agreement. Both Principal Secretaries may view the
          fully signed document here.
        </Alert>
      ) : (
        <Form action={formAction} className="mt-6">
          <FormCard title="Append your signature">
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

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" asChild>
                <Link href="/ps/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending || !signature}>
                Sign agreement
              </Button>
            </div>
          </FormCard>
        </Form>
      )}
    </Container>
  );
};
