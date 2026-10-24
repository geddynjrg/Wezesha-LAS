'use client';

import { saveGroupInformationAction } from '@/app/apply/group/[id]/group-information/group-information-action';
import {
  groupInformationSchema,
  type GroupInformationInput,
} from '@/app/apply/group/[id]/group-information/group-information-schema';
import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { MseaRegistrationFields } from '@/components/msea-registration-fields';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useMemo, useState } from 'react';

export interface GroupInformationFormProps {
  id: string;
  defaultValues?: Partial<GroupInformationInput>;
}

export const GroupInformationForm: FC<GroupInformationFormProps> = ({
  id,
  defaultValues,
}) => {
  const action = saveGroupInformationAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, groupInformationSchema, defaultValues);
  const formValues = useMemo(
    () => ({ ...defaultValues, ...state.values }),
    [defaultValues, state.values],
  );
  const [mseaValidated, setMseaValidated] = useState(
    Boolean(
      formValues.groupName &&
        formValues.registrationNumber &&
        formValues.registrationDate,
    ),
  );

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Group Information">
          <div className="grid gap-4 md:grid-cols-2">
            <MseaRegistrationFields
              state={state}
              defaultValues={{
                groupName: formValues.groupName,
                registrationNumber: formValues.registrationNumber,
                registrationDate: formValues.registrationDate,
              }}
              onLookupStateChange={setMseaValidated}
            />
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending || !mseaValidated}
        prevUrl={`/apply/group/${id}`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
