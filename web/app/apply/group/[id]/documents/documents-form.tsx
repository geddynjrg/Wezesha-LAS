'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { submitDocumentsAction } from './documents-action';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC } from 'react';
import { z } from 'zod';

const documentsSchema = z.object({});

export const DocumentsForm: FC<{ id: string }> = ({ id }) => {
  const action = submitDocumentsAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, documentsSchema, {});

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Upload Group Documents">
          <p className="typo-body-medium text-neutral-700">
            This step does not collect group uploads. Each member uploads the passport biodata
            page on the individual application.
          </p>
          {state?.errors?.form ? (
            <p className="typo-body-medium mt-4 text-red-600">{state.errors.form.join(', ')}</p>
          ) : null}
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/group/${id}/guarantee`}
        disabled={isPending}
        submitLabel="Submit Group Application"
      />
    </Form>
  );
};
