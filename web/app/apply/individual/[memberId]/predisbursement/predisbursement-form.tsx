'use client';

import { PredisbursementAgreementDocument } from '@/components/predisbursement/predisbursement-agreement-document';
import { acceptPredisbursementAction } from './predisbursement-action';
import { Alert } from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Form, SubmitButton } from '@workspace/ui/components/form';
import { useForm } from '@workspace/ui/hooks/use-form';
import { z } from 'zod';
import { type FC } from 'react';
import Link from 'next/link';

const predisbursementSchema = z.object({
  predisbursementAccepted: z.string().optional(),
});

export interface PredisbursementFormProps {
  memberId: string;
  applicantName: string;
  idNumber: string;
  acknowledgmentNumber: string;
  approvedAmount: string;
  groupName?: string | null;
  alreadyAccepted: boolean;
  agreementDate: string;
}

export const PredisbursementForm: FC<PredisbursementFormProps> = ({
  memberId,
  applicantName,
  idNumber,
  acknowledgmentNumber,
  approvedAmount,
  groupName,
  alreadyAccepted,
  agreementDate,
}) => {
  const action = acceptPredisbursementAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, predisbursementSchema, {});
  const dashboardUrl = `/apply/individual/${memberId}/dashboard`;

  return (
    <div className="space-y-6">
      <PredisbursementAgreementDocument
        applicantName={applicantName}
        idNumber={idNumber}
        acknowledgmentNumber={acknowledgmentNumber}
        approvedAmount={approvedAmount}
        groupName={groupName}
        agreementDate={agreementDate}
      />

      {alreadyAccepted ? (
        <div className="space-y-3">
          <Alert variant="success">You have already consented to this pre-disbursement agreement.</Alert>
          <Button asChild variant="secondary">
            <Link href={dashboardUrl}>Back to dashboard</Link>
          </Button>
        </div>
      ) : (
        <Form action={formAction} className="space-y-4">
          {state.message ? (
            <Alert variant={state.success ? 'success' : 'error'}>{state.message}</Alert>
          ) : null}
          <label className="typo-body-medium flex items-start gap-3 rounded-xl border border-neutral-300 bg-background p-4">
            <input
              type="checkbox"
              name="predisbursementAccepted"
              required
              className="mt-1 size-4 accent-primary"
            />
            <span>
              I have read and understood the Pre-Disbursement Agreement and I consent to
              pre-disbursement processing of the approved loan amount of KES {approvedAmount}.
            </span>
          </label>
          {state.errors?.predisbursementAccepted ? (
            <p className="text-sm text-destructive">
              {String(state.errors.predisbursementAccepted[0])}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <SubmitButton disabled={isPending}>Accept &amp; consent</SubmitButton>
            <Button asChild variant="secondary" type="button">
              <Link href={dashboardUrl}>Cancel</Link>
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};
