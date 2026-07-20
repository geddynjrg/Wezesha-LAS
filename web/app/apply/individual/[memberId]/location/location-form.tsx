'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import { saveLocationAction } from './location-action';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import type { FC } from 'react';

export const LocationForm: FC<{
  memberId: string;
  defaultValues?: {
    county?: string;
    constituency?: string;
    ward?: string;
    location?: string | null;
    subLocation?: string | null;
  };
}> = ({ memberId, defaultValues }) => {
  const action = saveLocationAction.bind(null, memberId);

  return (
    <Form action={action}>
      <Container className="py-8">
        <FormCard title="Location Information">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField name="county" label="County" required defaultValue={defaultValues?.county ?? ''} />
            <FormField name="constituency" label="Constituency" required defaultValue={defaultValues?.constituency ?? ''} />
            <FormField name="ward" label="Ward" required defaultValue={defaultValues?.ward ?? ''} />
            <FormField name="location" label="Location" defaultValue={defaultValues?.location ?? ''} />
            <FormField name="subLocation" label="Sub-location" defaultValue={defaultValues?.subLocation ?? ''} />
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/individual/${memberId}/individual-information`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
