'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import { saveBackgroundAction } from './background-action';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { z } from 'zod';
import type { FC } from 'react';

const schema = z.object({
  purpose: z.string().min(10),
  proposedActivities: z.string().min(10),
});

interface BackgroundFormProps {
  id: string;
  defaultValues?: { purpose?: string; proposedActivities?: string };
}

export const BackgroundForm: FC<BackgroundFormProps> = ({ id, defaultValues }) => {
  const action = saveBackgroundAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, schema, defaultValues);

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Brief Background">
          <div className="grid gap-4">
            <FormField name="purpose" label="Purpose of the Group" required state={state} defaultValue={defaultValues?.purpose} placeholder="Describe the group's purpose" />
            <FormField name="proposedActivities" label="Proposed Activities" required state={state} defaultValue={defaultValues?.proposedActivities} placeholder="Describe proposed activities" />
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/group/${id}/membership`}
        disabled={isPending}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
