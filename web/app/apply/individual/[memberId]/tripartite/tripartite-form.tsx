'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { submitTripartiteAction } from './tripartite-action';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import type { FC } from 'react';

export const TripartiteForm: FC<{ memberId: string }> = ({ memberId }) => {
  const action = submitTripartiteAction.bind(null, memberId);

  return (
    <Form action={action}>
      <Container className="py-8">
        <FormCard title="Tripartite Agreement">
          <div className="space-y-4">
            <p className="typo-body-medium">
              I confirm the tripartite agreement between the member, recruitment agency, and Uwezo Fund
              for the Wezesha Majuu programme.
            </p>
            <label className="typo-body-medium flex items-start gap-3 rounded-xl border border-neutral-300 bg-background p-4">
              <input type="checkbox" name="tripartiteAccepted" required className="mt-1 size-4 accent-primary" />
              <span>I accept the tripartite agreement</span>
            </label>
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/individual/${memberId}/signature`}
        submitLabel="Submit Individual Application"
      />
    </Form>
  );
};
