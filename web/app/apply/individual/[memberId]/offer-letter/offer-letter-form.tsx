'use client';

import { signOfferLetterAction } from './offer-letter-action';
import { offerLetterSchema } from './offer-letter-schema';
import { GroupLoanTermsContent } from '@/components/group-loan-terms-content';
import { SignaturePad } from '@/components/signature-pad';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import Link from 'next/link';
import { type FC, useState } from 'react';

interface OfferLetterFormProps {
  memberId: string;
  applicantName: string;
  groupName: string;
  amountToPay: string;
  airTicket: string;
  visaApplication: string;
  upkeepTrade: string;
  tripartiteAccepted: boolean;
  tripartiteReadUrl: string;
}

export const OfferLetterForm: FC<OfferLetterFormProps> = ({
  memberId,
  applicantName,
  groupName,
  amountToPay,
  airTicket,
  visaApplication,
  upkeepTrade,
  tripartiteAccepted,
  tripartiteReadUrl,
}) => {
  const action = signOfferLetterAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, offerLetterSchema, {
    digitalSignature: '',
  });
  const [signatureData, setSignatureData] = useState('');

  return (
    <Form action={formAction} state={state}>
      <Container className="space-y-6 py-8">
        <FormCard title="Offer letter">
          <div className="space-y-2 rounded-xl border border-neutral-300 bg-neutral-50 p-4 text-sm">
            <p className="font-semibold">Approved total: KES {amountToPay}</p>
            <p>Amount you are expected to pay: KES {amountToPay}</p>
            <p className="font-medium">Breakdown</p>
            <ul className="list-disc pl-5">
              <li>AIR TICKET: KES {airTicket}</li>
              <li>VISA APPLICATION: KES {visaApplication}</li>
              <li>UPKEEP/TRADE: KES {upkeepTrade}</li>
            </ul>
            <p className="text-neutral-600">Loan not yet disbursed.</p>
          </div>

          <div className="mt-6">
            <GroupLoanTermsContent groupName={groupName} totalLoanAmount={amountToPay} />
          </div>

          <label className="typo-body-medium mt-6 flex items-start gap-3 rounded-xl border border-neutral-300 bg-background p-4">
            <input type="checkbox" name="termsAccepted" required className="mt-1 size-4 accent-primary" />
            <span>I agree to these terms and conditions and to repay KES {amountToPay}.</span>
          </label>
          {state.errors?.termsAccepted?.[0] ? (
            <p className="text-sm text-destructive">{typeof state.errors.termsAccepted[0] === 'string' ? state.errors.termsAccepted[0] : state.errors.termsAccepted[0].message}</p>
          ) : null}

          <div className="mt-6 space-y-2">
            <p className="typo-body-medium font-medium">Sign, {applicantName}</p>
            <p className="typo-body-small text-neutral-600">
              Sign below using your finger or stylus, the same way you sign the tripartite agreement.
            </p>
            <SignaturePad onChange={(dataUrl) => setSignatureData(dataUrl ?? '')} />
            <input type="hidden" name="digitalSignature" value={signatureData} />
            {state.errors?.digitalSignature?.[0] ? (
              <p className="text-sm text-destructive">{typeof state.errors.digitalSignature[0] === 'string' ? state.errors.digitalSignature[0] : state.errors.digitalSignature[0].message}</p>
            ) : null}
          </div>

          {!tripartiteAccepted ? (
            <div className="mt-6 space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-950">
                You have not signed the tripartite agreement.{' '}
                <Link href={tripartiteReadUrl} target="_blank" className="font-medium underline">
                  Open and read the tripartite agreement
                </Link>{' '}
                before you sign.
              </p>
              <label className="typo-body-medium flex items-start gap-3">
                <input type="checkbox" name="alsoSignTripartite" className="mt-1 size-4 accent-primary" />
                <span>Use this same signature for the tripartite agreement.</span>
              </label>
            </div>
          ) : null}

          <Button type="submit" className="mt-6" disabled={isPending || signatureData.length === 0}>
            {isPending ? 'Signing…' : 'Sign Offer Letter'}
          </Button>
        </FormCard>
      </Container>
    </Form>
  );
};
