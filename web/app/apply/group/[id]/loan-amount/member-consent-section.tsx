'use client';

import { FormField } from '@/components/form-field';
import { formatKenyanPhoneForDisplay } from '@/lib/phone/kenyan-phone';
import type { ClientMemberSummary } from '@/lib/serialize-for-client';
import { Button } from '@workspace/ui/components/button';
import type { FormActionResponse } from '@workspace/ui/hooks/use-form';
import { cn } from '@workspace/ui/lib/utils';
import { type FC } from 'react';

export interface MemberConsentSectionState {
  otpVerified: boolean;
  otpStatus: string;
}

interface MemberConsentSectionProps {
  member: ClientMemberSummary;
  sectionState: MemberConsentSectionState;
  state?: FormActionResponse<Record<string, unknown>>;
  amountValue?: string;
  feedbackMessage?: string;
  feedbackSuccess?: boolean;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  isSendingOtp?: boolean;
  isVerifyingOtp?: boolean;
}

export const MemberConsentSection: FC<MemberConsentSectionProps> = ({
  member,
  sectionState,
  state,
  amountValue,
  feedbackMessage,
  feedbackSuccess,
  onSendOtp,
  onVerifyOtp,
  isSendingOtp,
  isVerifyingOtp,
}) => {
  const otpVerified = sectionState.otpVerified;
  const otpStatus = sectionState.otpStatus;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-300 bg-background p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="typo-h6">{member.name}</h3>
          {member.mobile && (
            <p className="typo-body-medium text-neutral-600">
              {formatKenyanPhoneForDisplay(member.mobile)}
            </p>
          )}
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            otpVerified
              ? 'bg-green-100 text-green-800'
              : otpStatus === 'SENT'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-neutral-100 text-neutral-700',
          )}
        >
          {otpVerified
            ? 'Consent verified'
            : otpStatus === 'SENT'
              ? 'OTP sent — awaiting verification'
              : 'Pending OTP consent'}
        </span>
      </div>

      <FormField
        name={`amount_${member.id}`}
        label="Loan Amount (KES)"
        type="number"
        required
        state={state}
        defaultValue={amountValue ?? member.amount}
      />

      <div className="rounded-xl border border-dashed border-neutral-300 p-4">
        <p className="typo-body-medium mb-3 text-neutral-700">
          Send an OTP to the member&apos;s phone with their allocated loan amount. They must
          share the consent code with you to proceed.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isSendingOtp || otpVerified}
            onClick={onSendOtp}
          >
            {isSendingOtp ? 'Sending OTP...' : otpVerified ? 'OTP verified' : 'Send OTP to Member'}
          </Button>
        </div>

        {!otpVerified && (
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <FormField
              name={`otp_${member.id}`}
              label="Enter OTP from member"
              placeholder="6-digit code"
            />
            <Button type="button" disabled={isVerifyingOtp} onClick={onVerifyOtp}>
              {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>
        )}

        {feedbackMessage && (
          <p
            className={cn(
              'typo-body-medium mt-3',
              feedbackSuccess ? 'text-green-700' : 'text-red-600',
            )}
          >
            {feedbackMessage}
          </p>
        )}
      </div>
    </div>
  );
};
