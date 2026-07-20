'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import {
  saveGuarantorsAction,
  sendGuarantorOtpAction,
  verifyGuarantorOtpAction,
} from './guarantor-action';
import { guarantorFlatFormSchema, type GuarantorFieldsInput } from './guarantor-schema';
import { GuarantorSection, type GuarantorSectionState } from './guarantor-section';
import type { LocationOption } from '@/lib/api/locations.service';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useState, useTransition } from 'react';

interface GuarantorFormProps {
  memberId: string;
  applicantName: string;
  loanAmount: string;
  countyOptions: LocationOption[];
  guarantor1?: Partial<GuarantorFieldsInput> & GuarantorSectionState;
  guarantor2?: Partial<GuarantorFieldsInput> & GuarantorSectionState;
}

type OtpFeedback = {
  guarantorNumber: 1 | 2;
  message: string;
  success: boolean;
};

export const GuarantorForm: FC<GuarantorFormProps> = ({
  memberId,
  applicantName,
  loanAmount,
  countyOptions,
  guarantor1,
  guarantor2,
}) => {
  const formId = `guarantor-form-${memberId}`;
  const saveAction = saveGuarantorsAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(saveAction, guarantorFlatFormSchema, {});

  const [g1State, setG1State] = useState<GuarantorSectionState>({
    otpVerified: guarantor1?.otpVerified ?? false,
    otpStatus: guarantor1?.otpStatus ?? 'PENDING',
  });
  const [g2State, setG2State] = useState<GuarantorSectionState>({
    otpVerified: guarantor2?.otpVerified ?? false,
    otpStatus: guarantor2?.otpStatus ?? 'PENDING',
  });

  const [otpFeedback, setOtpFeedback] = useState<OtpFeedback | null>(null);
  const [isSendingOtp, startSendOtp] = useTransition();
  const [isVerifyingOtp, startVerifyOtp] = useTransition();
  const [activeOtpAction, setActiveOtpAction] = useState<{
    guarantorNumber: 1 | 2;
    type: 'send' | 'verify';
  } | null>(null);

  const getFormData = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return new FormData();
    return new FormData(form);
  };

  const handleSendOtp = (guarantorNumber: 1 | 2) => {
    startSendOtp(async () => {
      setActiveOtpAction({ guarantorNumber, type: 'send' });
      const action = sendGuarantorOtpAction.bind(null, memberId, guarantorNumber);
      const result = await action(null, getFormData());
      setOtpFeedback({
        guarantorNumber,
        message: result.message ?? '',
        success: result.success,
      });

      if (result.success) {
        const update = { otpVerified: false, otpStatus: 'SENT' };
        if (guarantorNumber === 1) setG1State(update);
        else setG2State(update);
      }
      setActiveOtpAction(null);
    });
  };

  const handleVerifyOtp = (guarantorNumber: 1 | 2) => {
    startVerifyOtp(async () => {
      setActiveOtpAction({ guarantorNumber, type: 'verify' });
      const action = verifyGuarantorOtpAction.bind(null, memberId, guarantorNumber);
      const result = await action(null, getFormData());
      setOtpFeedback({
        guarantorNumber,
        message: result.message ?? '',
        success: result.success,
      });

      if (result.success) {
        const update = { otpVerified: true, otpStatus: 'VERIFIED' };
        if (guarantorNumber === 1) setG1State(update);
        else setG2State(update);
      }
      setActiveOtpAction(null);
    });
  };

  return (
    <Form id={formId} action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Guarantor Details">
          <p className="typo-body-medium mb-6 text-neutral-700">
            Provide details for two guarantors for {applicantName}&apos;s Uwezo Fund Wezesha Majuu
            Loan application (KES {loanAmount}). Each guarantor must consent via OTP sent to their
            mobile phone.
          </p>

          <div className="space-y-6">
            <GuarantorSection
              guarantorNumber={1}
              countyOptions={countyOptions}
              defaultValues={guarantor1}
              state={state}
              sectionState={g1State}
              feedbackMessage={
                otpFeedback?.guarantorNumber === 1 ? otpFeedback.message : undefined
              }
              feedbackSuccess={
                otpFeedback?.guarantorNumber === 1 ? otpFeedback.success : undefined
              }
              onSendOtp={() => handleSendOtp(1)}
              onVerifyOtp={() => handleVerifyOtp(1)}
              isSendingOtp={
                isSendingOtp &&
                activeOtpAction?.guarantorNumber === 1 &&
                activeOtpAction.type === 'send'
              }
              isVerifyingOtp={
                isVerifyingOtp &&
                activeOtpAction?.guarantorNumber === 1 &&
                activeOtpAction.type === 'verify'
              }
            />

            <GuarantorSection
              guarantorNumber={2}
              countyOptions={countyOptions}
              defaultValues={guarantor2}
              state={state}
              sectionState={g2State}
              feedbackMessage={
                otpFeedback?.guarantorNumber === 2 ? otpFeedback.message : undefined
              }
              feedbackSuccess={
                otpFeedback?.guarantorNumber === 2 ? otpFeedback.success : undefined
              }
              onSendOtp={() => handleSendOtp(2)}
              onVerifyOtp={() => handleVerifyOtp(2)}
              isSendingOtp={
                isSendingOtp &&
                activeOtpAction?.guarantorNumber === 2 &&
                activeOtpAction.type === 'send'
              }
              isVerifyingOtp={
                isVerifyingOtp &&
                activeOtpAction?.guarantorNumber === 2 &&
                activeOtpAction.type === 'verify'
              }
            />
          </div>

          {state?.message && !state.success && (
            <p className="typo-body-medium mt-4 text-red-600">{state.message}</p>
          )}
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending}
        prevUrl={`/apply/individual/${memberId}/location`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
