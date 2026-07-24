'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { requestGuaranteeConsentAction, saveGuaranteeAction } from './guarantee-action';
import { SignatureToggle } from './signature-toggle';
import { formatKenyanPhoneForDisplay } from '@/lib/phone/kenyan-phone';
import type { ClientMemberSummary } from '@/lib/serialize-for-client';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { useForm } from '@workspace/ui/hooks/use-form';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useMemo, useState, useTransition } from 'react';
import { z } from 'zod';

const guaranteeSchema = z.object({});

interface GuaranteeFormProps {
  id: string;
  groupName: string;
  members: ClientMemberSummary[];
}

type RequestButtonLabel = 'Request Signature' | 'Requesting...' | 'Request Sent' | 'Request Failed';

export const GuaranteeForm: FC<GuaranteeFormProps> = ({ id, groupName, members }) => {
  const formId = `guarantee-form-${id}`;
  const saveAction = saveGuaranteeAction.bind(null, id);
  const [state, formAction, isPending] = useForm(saveAction, guaranteeSchema, {});

  const initialSignatures = useMemo(
    () =>
      Object.fromEntries(
        members.map((member) => [member.id, member.signature === 'accepted']),
      ),
    [members],
  );

  const [memberSignatures, setMemberSignatures] =
    useState<Record<string, boolean>>(initialSignatures);
  const [requestLabel, setRequestLabel] = useState<RequestButtonLabel>('Request Signature');
  const [requestFeedback, setRequestFeedback] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [isRequesting, startRequest] = useTransition();

  const allSigned = members.every((member) => memberSignatures[member.id]);

  const handleToggle = (memberId: string) => {
    setMemberSignatures((current) => ({
      ...current,
      [memberId]: !current[memberId],
    }));
  };

  const handleRequestSignature = () => {
    startRequest(async () => {
      setRequestLabel('Requesting...');
      setRequestFeedback(null);

      const result = await requestGuaranteeConsentAction(id);

      setRequestFeedback({
        message: result.message,
        success: result.success,
      });
      setRequestLabel(result.success ? 'Request Sent' : 'Request Failed');
    });
  };

  return (
    <Form id={formId} action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="8. Members Guarantee and Commitment to Loan Repayment">
          <div className="typo-body-medium space-y-4 text-neutral-800">
            <p>We the undersigned hereby:</p>
            <ol className="list-none space-y-1 pl-0">
              <li>
                (i) Confirm that we are members of the{' '}
                <strong>
                  <u>{groupName}</u>
                </strong>{' '}
                group.
              </li>
              <li>
                (ii) Declare that the information provided herein is true to the best of our
                knowledge,
              </li>
              <li>
                (iii) We further authorize Uwezo Fund to verify the information and reference
                provided here-in,
              </li>
              <li>
                (iv) We agree that jointly and severally we are liable for repayment of the loan,
              </li>
              <li>
                (v) In the event of default, we shall be subjected to the terms and conditions of
                this loan,
              </li>
              <li>
                (vi) We shall not be eligible for additional loans until the amount in default has
                been cleared in full.
              </li>
            </ol>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-neutral-300">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                  <TableHead className="w-14 px-3">S/No.</TableHead>
                  <TableHead className="min-w-[140px] px-3">Member Name</TableHead>
                  <TableHead className="min-w-[120px] px-3">ID No.</TableHead>
                  <TableHead className="min-w-[120px] px-3">Passport No.</TableHead>
                  <TableHead className="min-w-[160px] px-3">Mobile Phone Number</TableHead>
                  <TableHead className="w-24 px-3 text-center">Signed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length > 0 ? (
                  members.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell className="px-3">{index + 1}</TableCell>
                      <TableCell className="px-3 font-medium">{member.name}</TableCell>
                      <TableCell className="px-3">{member.idNo || 'N/A'}</TableCell>
                      <TableCell className="px-3">{member.passportNo || 'N/A'}</TableCell>
                      <TableCell className="px-3">
                        <Input
                          value={
                            member.mobile
                              ? formatKenyanPhoneForDisplay(member.mobile)
                              : ''
                          }
                          readonly
                          disabled
                          className="bg-background"
                        />
                        <input type="hidden" name={`mobile_${member.id}`} value={member.mobile} />
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex flex-col items-center gap-1">
                          <SignatureToggle
                            checked={!!memberSignatures[member.id]}
                            onChange={() => handleToggle(member.id)}
                          />
                          {memberSignatures[member.id] ? (
                            <input type="hidden" name={`signature_${member.id}`} value="on" />
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-3 py-6 text-center text-neutral-600">
                      No members available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-evenly">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-8"
              onClick={handleRequestSignature}
              disabled={isRequesting || requestLabel === 'Request Sent'}
            >
              {isRequesting ? 'Requesting...' : requestLabel}
            </Button>
            <p className="typo-body-medium max-w-md text-center text-neutral-600 sm:text-left">
              Click to request fellow members to consent to the loan application.
            </p>
          </div>

          {requestFeedback ? (
            <p
              className={cn(
                'typo-body-medium mt-4 text-center',
                requestFeedback.success ? 'text-green-700' : 'text-red-600',
              )}
            >
              {requestFeedback.message}
            </p>
          ) : null}

          {state?.message && !state.success ? (
            <p className="typo-body-medium mt-4 text-center text-red-600">{state.message}</p>
          ) : null}

          {!allSigned ? (
            <p className="typo-body-medium mt-4 text-center text-amber-700">
              All members must sign the repayment commitment before continuing.
            </p>
          ) : null}
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending || !allSigned}
        prevUrl={`/apply/group/${id}/bank`}
        submitLabel="Upload Documents"
      />
    </Form>
  );
};
