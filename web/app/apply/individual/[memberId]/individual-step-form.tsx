'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import { saveIndividualStepAction } from '@/lib/actions/individual-step-action';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import type { FC } from 'react';

const steps: Record<string, { title: string; prev: string; fieldLabel: string }> = {
  'next-of-kin': { title: 'Next of Kin', prev: 'location', fieldLabel: 'Next of kin details' },
  recruitment: { title: 'Recruitment Details', prev: 'next-of-kin', fieldLabel: 'Recruitment agency details' },
  budget: { title: 'Budget Breakdown', prev: 'recruitment', fieldLabel: 'Budget item description' },
  bank: { title: 'Bank Account Details', prev: 'budget', fieldLabel: 'Bank account number' },
  'credit-history': { title: 'Credit History', prev: 'bank', fieldLabel: 'Previous lender' },
  signature: { title: 'Signature', prev: 'credit-history', fieldLabel: 'Digital signature reference' },
};

export const IndividualStepForm: FC<{ memberId: string; step: keyof typeof steps }> = ({
  memberId,
  step,
}) => {
  const config = steps[step];
  const action = saveIndividualStepAction.bind(null, memberId, step);

  return (
    <Form action={action}>
      <Container className="py-8">
        <FormCard title={config.title}>
          <FormField name="notes" label={config.fieldLabel} placeholder={`Enter ${config.title.toLowerCase()}`} />
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/individual/${memberId}/${config.prev}`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
