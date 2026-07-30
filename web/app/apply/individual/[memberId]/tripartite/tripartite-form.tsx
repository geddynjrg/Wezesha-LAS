'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { TripartiteAgreementDocument } from '@/components/tripartite/tripartite-agreement-document';
import { submitTripartiteAction } from './tripartite-action';
import { tripartiteFormSchema } from './tripartite-schema';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useMemo, useState } from 'react';

interface TripartiteFormProps {
  memberId: string;
  defaultMigrantName: string;
  defaultIdNumber: string;
  defaultPassportNumber: string;
  defaultAccepted?: boolean;
  migrantSignature?: string | null;
  labourPsSignature?: string | null;
  labourPsSignedAt?: Date | null;
  msmePsSignature?: string | null;
  msmePsSignedAt?: Date | null;
}

export const TripartiteForm: FC<TripartiteFormProps> = ({
  memberId,
  defaultMigrantName,
  defaultIdNumber,
  defaultPassportNumber,
  defaultAccepted = false,
  migrantSignature = null,
  labourPsSignature = null,
  labourPsSignedAt = null,
  msmePsSignature = null,
  msmePsSignedAt = null,
}) => {
  const currentDate = useMemo(
    () =>
      `${String(new Date().getDate()).padStart(2, '0')}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`,
    [],
  );
  const [migrantName, setMigrantName] = useState(defaultMigrantName);
  const action = submitTripartiteAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, tripartiteFormSchema, {
    migrantName: defaultMigrantName,
    idNumber: defaultIdNumber,
    passportNumber: defaultPassportNumber,
    ...(defaultAccepted ? { tripartiteAccepted: 'on' as const } : {}),
  });

  return (
    <Form action={formAction}>
      <Container className="py-8">
        <FormCard title="Tripartite Agreement">
          <TripartiteAgreementDocument
            migrantName={migrantName}
            idNumber={defaultIdNumber}
            passportNumber={defaultPassportNumber}
            migrantSignature={migrantSignature}
            labourPsSignature={labourPsSignature}
            labourPsSignedAt={labourPsSignedAt}
            msmePsSignature={msmePsSignature}
            msmePsSignedAt={msmePsSignedAt}
            agreementDate={currentDate}
            onMigrantNameChange={setMigrantName}
          />

          {(state.errors?.migrantName ||
            state.errors?.idNumber ||
            state.errors?.passportNumber) && (
            <div className="mt-4 space-y-1 text-sm text-destructive">
              {state.errors.migrantName?.[0] ? <p>{state.errors.migrantName[0]}</p> : null}
              {state.errors.idNumber?.[0] ? <p>{state.errors.idNumber[0]}</p> : null}
              {state.errors.passportNumber?.[0] ? (
                <p>{state.errors.passportNumber[0]}</p>
              ) : null}
            </div>
          )}

          <div className="mt-6 space-y-2">
            <label className="typo-body-medium flex items-start gap-3 rounded-xl border border-neutral-300 bg-background p-4">
              <input
                type="checkbox"
                name="tripartiteAccepted"
                defaultChecked={defaultAccepted}
                required
                className="mt-1 size-4 accent-primary"
              />
              <span>
                I have read and accept the tripartite agreement between the Ministry of Labour and
                Social Protection, State Department for Labour and Skills Development; the Ministry
                of Cooperatives and Micro Small and Medium Enterprises Development, State Department
                of Micro Small and Medium Enterprises Development; and
                the labour migrant for the Wezesha Majuu programme.
              </span>
            </label>
            {state.errors?.tripartiteAccepted ? (
              <p className="text-sm text-destructive">{state.errors.tripartiteAccepted[0]}</p>
            ) : null}
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/individual/${memberId}/signature`}
        submitLabel="Submit Individual Application"
        disabled={isPending}
      />
    </Form>
  );
};
