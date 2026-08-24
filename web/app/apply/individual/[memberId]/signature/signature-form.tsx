'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { SignaturePad } from '@/components/signature-pad';
import { saveSignatureAction } from './signature-action';
import { signatureSchema } from './signature-schema';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useMemo, useState } from 'react';

interface SignatureFormProps {
  memberId: string;
  applicantName: string;
  defaultSignature?: string | null;
}

export const SignatureForm: FC<SignatureFormProps> = ({
  memberId,
  applicantName,
  defaultSignature,
}) => {
  const signedDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  const action = saveSignatureAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, signatureSchema, {
    digitalSignature: defaultSignature ?? '',
  });
  const [signatureData, setSignatureData] = useState(defaultSignature ?? '');
  const hasSignature = signatureData.length > 0;

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="To Be Signed by the Applicant">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="applicantName" className="typo-body-medium font-medium">
                Name
              </label>
              <Input id="applicantName" value={applicantName} readonly />
            </div>

            <div className="space-y-2">
              <p className="typo-body-medium font-medium">Signature</p>
              <p className="typo-body-small text-neutral-600">
                Sign below using your finger or stylus.
              </p>
              <SignaturePad
                defaultSignature={defaultSignature}
                onChange={(dataUrl) => setSignatureData(dataUrl ?? '')}
              />
              <input type="hidden" name="digitalSignature" value={signatureData} />
              {state.errors?.digitalSignature?.map((message) => (
                <p key={String(message)} className="typo-body-small text-destructive">
                  {typeof message === 'string' ? message : message.message}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <label htmlFor="signedDate" className="typo-body-medium font-medium">
                Date
              </label>
              <Input id="signedDate" value={signedDate} readonly />
            </div>
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending || !hasSignature}
        prevUrl={`/apply/individual/${memberId}/credit-history`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
