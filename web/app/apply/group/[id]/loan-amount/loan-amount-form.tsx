'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import {
  MAX_GROUP_LOAN_TOTAL_MESSAGE,
  MAX_GROUP_MEMBER_LOAN_TOTAL,
} from '@/lib/adjust-loan-amounts';
import {
  saveLoanAmountAction,
  sendMemberConsentOtpAction,
  verifyMemberConsentOtpAction,
} from './loan-amount-action';
import { createLoanAmountSchema } from './loan-amount-schema';
import { MemberConsentSection, type MemberConsentSectionState } from './member-consent-section';
import type { ClientMemberSummary } from '@/lib/serialize-for-client';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useMemo, useState, useTransition } from 'react';

interface LoanAmountFormProps {
  id: string;
  members: ClientMemberSummary[];
}

type OtpFeedback = {
  memberId: string;
  message: string;
  success: boolean;
};

export const LoanAmountForm: FC<LoanAmountFormProps> = ({ id, members }) => {
  const formId = `loan-amount-form-${id}`;
  const memberIds = useMemo(() => members.map((member) => member.id), [members]);
  const schema = useMemo(() => createLoanAmountSchema(memberIds), [memberIds]);

  const defaultValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const member of members) {
      values[`amount_${member.id}`] = member.amount;
    }
    return values;
  }, [members]);

  const saveAction = saveLoanAmountAction.bind(null, id);
  const [state, formAction, isPending] = useForm(saveAction, schema, defaultValues);
  const formValues = useMemo(
    () => ({ ...defaultValues, ...state.values }),
    [defaultValues, state.values],
  );

  const [memberStates, setMemberStates] = useState<Record<string, MemberConsentSectionState>>(
    () =>
      Object.fromEntries(
        members.map((member) => [
          member.id,
          { otpVerified: member.otpVerified, otpStatus: member.otpStatus },
        ]),
      ),
  );

  const [otpFeedback, setOtpFeedback] = useState<OtpFeedback | null>(null);
  const [isSendingOtp, startSendOtp] = useTransition();
  const [isVerifyingOtp, startVerifyOtp] = useTransition();
  const [activeOtpAction, setActiveOtpAction] = useState<{
    memberId: string;
    type: 'send' | 'verify';
  } | null>(null);

  const getFormData = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return new FormData();
    return new FormData(form);
  };

  const handleSendOtp = (memberId: string) => {
    startSendOtp(async () => {
      setActiveOtpAction({ memberId, type: 'send' });
      const action = sendMemberConsentOtpAction.bind(null, id, memberId);
      const result = await action(null, getFormData());
      setOtpFeedback({
        memberId,
        message: result.message ?? '',
        success: result.success,
      });

      if (result.success) {
        setMemberStates((current) => ({
          ...current,
          [memberId]: { otpVerified: false, otpStatus: 'SENT' },
        }));
      }
      setActiveOtpAction(null);
    });
  };

  const handleVerifyOtp = (memberId: string) => {
    startVerifyOtp(async () => {
      setActiveOtpAction({ memberId, type: 'verify' });
      const action = verifyMemberConsentOtpAction.bind(null, id, memberId);
      const result = await action(null, getFormData());
      setOtpFeedback({
        memberId,
        message: result.message ?? '',
        success: result.success,
      });

      if (result.success) {
        setMemberStates((current) => ({
          ...current,
          [memberId]: { otpVerified: true, otpStatus: 'VERIFIED' },
        }));
      }
      setActiveOtpAction(null);
    });
  };

  const allVerified = members.every((member) => memberStates[member.id]?.otpVerified);

  return (
    <Form id={formId} action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Loan Amount Applied">
          <p className="typo-body-medium mb-6 text-neutral-700">
            Set the loan amount for each group member. Each member must consent via OTP sent to
            their mobile phone before you can proceed. The group total amount must not exceed KES{' '}
            {MAX_GROUP_MEMBER_LOAN_TOTAL.toLocaleString()} to meet predeparture costs of the members.
          </p>

          <div className="space-y-6">
            {members.map((member) => (
              <MemberConsentSection
                key={member.id}
                member={member}
                sectionState={
                  memberStates[member.id] ?? {
                    otpVerified: member.otpVerified,
                    otpStatus: member.otpStatus,
                  }
                }
                state={state}
                amountValue={formValues[`amount_${member.id}`]}
                feedbackMessage={
                  otpFeedback?.memberId === member.id ? otpFeedback.message : undefined
                }
                feedbackSuccess={
                  otpFeedback?.memberId === member.id ? otpFeedback.success : undefined
                }
                onSendOtp={() => handleSendOtp(member.id)}
                onVerifyOtp={() => handleVerifyOtp(member.id)}
                isSendingOtp={
                  isSendingOtp &&
                  activeOtpAction?.memberId === member.id &&
                  activeOtpAction.type === 'send'
                }
                isVerifyingOtp={
                  isVerifyingOtp &&
                  activeOtpAction?.memberId === member.id &&
                  activeOtpAction.type === 'verify'
                }
              />
            ))}
          </div>

          {state?.message && !state.success && (
            <p className="typo-body-medium mt-4 text-red-600">{state.message}</p>
          )}

          {!allVerified && (
            <p className="typo-body-medium mt-4 text-amber-700">
              All members must verify OTP consent before continuing.
            </p>
          )}

          <p className="typo-body-small mt-4 text-muted-foreground">
            {MAX_GROUP_LOAN_TOTAL_MESSAGE}
          </p>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending || !allVerified}
        prevUrl={`/apply/group/${id}/member-details`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
