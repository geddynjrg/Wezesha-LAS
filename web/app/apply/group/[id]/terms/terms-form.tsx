'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { GroupLoanTermsContent } from '@/components/group-loan-terms-content';
import { saveTermsAction } from './terms-action';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import type { FC } from 'react';

interface TermsFormProps {
  id: string;
  groupName: string;
  totalLoanAmount: string;
}

export const TermsForm: FC<TermsFormProps> = ({ id, groupName, totalLoanAmount }) => {
  const action = saveTermsAction.bind(null, id);

  return (
    <Form action={action}>
      <Container className="py-8">
        <FormCard title="Loan Terms & Conditions Before Disbursement">
          <GroupLoanTermsContent groupName={groupName} totalLoanAmount={totalLoanAmount} />

          <label className="typo-body-medium mt-6 flex items-start gap-3 rounded-xl border border-neutral-300 bg-background p-4">
            <input type="checkbox" name="termsAccepted" required className="mt-1 size-4 accent-primary" />
            <span>We agree to the terms and conditions.</span>
          </label>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/group/${id}/loan-amount`}
        submitLabel="Accept & Continue"
      />
    </Form>
  );
};
