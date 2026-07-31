'use client';

import { SignaturePad } from '@/components/signature-pad';
import {
  TripartiteAgreementDocument,
  type TripartiteApplicant,
} from '@/components/tripartite/tripartite-agreement-document';
import { psSignSchema } from '@/app/ps/sign-in/ps-login-schema';
import { UserRole } from '@/generated/prisma';
import {
  getTripartiteSigningStatus,
  getTripartiteSigningStatusLabel,
} from '@/lib/data/tripartite-applicants';
import {
  canPsSignTripartite,
  hasPsSigned,
} from '@/lib/tripartite/ps-signing-workflow';
import { Alert } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
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
  applicants: TripartiteApplicant[];
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
  applicants,
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

  const tripartite = {
    msmePsSignature: msmePsSignature ?? null,
    labourPsSignature: labourPsSignature ?? null,
  };

  const signingStatus = getTripartiteSigningStatus(tripartite);
  const alreadySigned = hasPsSigned(psRole, tripartite);
  const signEligibility = canPsSignTripartite(psRole, tripartite);

  const roleTitle =
    psRole === UserRole.PS_LABOUR
      ? 'Labour & Skills Development'
      : 'Micro Small and Medium Enterprise Development';

  const workflowMessage =
    psRole === UserRole.PS_MSME
      ? signingStatus === 'awaiting_msme'
        ? 'You are the first signatory. After you sign, this agreement will be forwarded to the Labour Principal Secretary.'
        : 'MSME signing is complete. Labour PS may now sign if they have not already.'
      : signingStatus === 'awaiting_msme'
        ? 'This agreement is awaiting signature from the MSME Principal Secretary before you can sign.'
        : signingStatus === 'awaiting_labour'
          ? 'MSME PS has signed. You may now append your signature as Labour Principal Secretary.'
          : 'Both Principal Secretaries have signed this agreement.';

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Application {acknowledgmentNumber}</p>
          <h2 className="typo-h2">Tripartite Agreement</h2>
          <p className="typo-body-medium text-neutral-600">
            {alreadySigned
              ? `View the agreement including your signature as Principal Secretary – ${roleTitle}.`
              : `Review the agreement as submitted by the applicant(s) and append your signature as Principal Secretary – ${roleTitle}.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{getTripartiteSigningStatusLabel(signingStatus)}</Badge>
            <span className="text-sm text-neutral-600">
              {applicants.length} applicant{applicants.length === 1 ? '' : 's'} listed
            </span>
          </div>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/ps/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <Alert variant={signingStatus === 'fully_signed' ? 'success' : 'info'} className="mb-6">
        {workflowMessage}
      </Alert>

      <FormCard title="Agreement document">
        <TripartiteAgreementDocument
          migrantName={migrantName}
          idNumber={idNumber}
          passportNumber={passportNumber}
          applicants={applicants}
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
          document here.
        </Alert>
      ) : signEligibility.allowed ? (
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
      ) : (
        <Alert variant="warning" className="mt-6">
          {signEligibility.reason}
        </Alert>
      )}
    </Container>
  );
};
