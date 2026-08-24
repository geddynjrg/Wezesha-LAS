'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FieldGuidance } from '@/components/field-guidance';
import { FormField } from '@/components/form-field';
import { SoftDuplicateBanner } from '@/components/soft-duplicate-banner';
import {
  MAX_GROUP_MEMBER_LOAN_TOTAL,
  MAX_MEMBER_LOAN_AMOUNT,
} from '@/lib/adjust-loan-amounts';
import { createMemberDetailsSchema } from './member-details-schema';
import { saveMemberDetailsAction } from './member-details-action';
import type { ClientMemberRow } from '@/lib/serialize-for-client';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useCallback, useMemo, useState } from 'react';

interface MemberDetailsFormProps {
  id: string;
  members: ClientMemberRow[];
  expectedMemberCount: number;
}

export const MemberDetailsForm: FC<MemberDetailsFormProps> = ({
  id,
  members,
  expectedMemberCount,
}) => {
  const schema = useMemo(
    () => createMemberDetailsSchema(members.length),
    [members.length],
  );

  const defaultValues = useMemo(() => {
    const values: Record<string, string> = {
      memberCount: String(members.length),
      expectedMemberCount: String(expectedMemberCount),
    };

    members.forEach((member, index) => {
      values[`name_${index}`] = member.name;
      values[`idNo_${index}`] = member.idNo;
      values[`mobile_${index}`] = member.mobile;
      values[`email_${index}`] = member.email;
      values[`passportNo_${index}`] = member.passportNo;
      values[`purpose_${index}`] = member.purpose;
      values[`amount_${index}`] = member.amount;
    });

    return values;
  }, [expectedMemberCount, members]);

  const action = saveMemberDetailsAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, schema, defaultValues);
  const formValues = useMemo(
    () => ({ ...defaultValues, ...state.values }),
    [defaultValues, state.values],
  );

  const [softPhone, setSoftPhone] = useState('');
  const [softId, setSoftId] = useState('');
  const [softAck, setSoftAck] = useState(false);
  const [softActive, setSoftActive] = useState(false);
  const [hasSoftDuplicate, setHasSoftDuplicate] = useState(false);

  const onAckChange = useCallback((value: boolean) => {
    setSoftAck(value);
  }, []);

  const onDuplicateChange = useCallback((has: boolean) => {
    setHasSoftDuplicate(has);
  }, []);

  const formError =
    typeof state.errors?.memberCount?.[0] === 'string'
      ? state.errors.memberCount[0]
      : null;

  const softBlocks = hasSoftDuplicate && !softAck;

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Individual Member Details">
          <p className="mb-4 text-muted-foreground typo-body-small">
            All fields are required for each of the {expectedMemberCount} group members recorded
            on the membership step. Each member must have a unique National ID. Each member may
            receive up to KES {MAX_MEMBER_LOAN_AMOUNT.toLocaleString()}, and the group total must
            not exceed KES {MAX_GROUP_MEMBER_LOAN_TOTAL.toLocaleString()}.
          </p>

          {formError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive typo-body-small">
              {formError}
            </div>
          )}

          <SoftDuplicateBanner
            phone={softPhone}
            nationalId={softId}
            applicationId={id}
            acknowledged={softAck}
            onAcknowledgedChange={onAckChange}
            onDuplicateChange={onDuplicateChange}
            enabled={softActive}
          />

          <div className="space-y-6">
            <input type="hidden" name="memberCount" value={members.length} />
            <input
              type="hidden"
              name="expectedMemberCount"
              value={expectedMemberCount}
            />
            <input
              type="hidden"
              name="softDuplicateAcknowledged"
              value={softAck ? 'on' : ''}
            />
            {members.map((member, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-2xl border border-neutral-300 bg-background p-4 md:grid-cols-2"
              >
                <h3 className="typo-h6 md:col-span-2">Member {index + 1}</h3>
                <FormField
                  name={`name_${index}`}
                  label="Full Name"
                  required
                  state={state}
                  defaultValue={formValues[`name_${index}`]}
                />
                <FieldGuidance fieldKey="nationalId">
                  <FormField
                    name={`idNo_${index}`}
                    label="National ID"
                    required
                    state={state}
                    defaultValue={formValues[`idNo_${index}`]}
                  />
                  <input
                    type="hidden"
                    aria-hidden
                    tabIndex={-1}
                    onFocus={() => {
                      setSoftActive(true);
                      setSoftId(String(formValues[`idNo_${index}`] ?? ''));
                      setSoftPhone(String(formValues[`mobile_${index}`] ?? ''));
                    }}
                  />
                </FieldGuidance>
                <div
                  onBlurCapture={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target?.name === `idNo_${index}`) {
                      setSoftActive(true);
                      setSoftId(target.value);
                      const mobileInput = document.querySelector<HTMLInputElement>(
                        `input[name="mobile_${index}"]`,
                      );
                      setSoftPhone(mobileInput?.value ?? '');
                    }
                    if (target?.name === `mobile_${index}`) {
                      setSoftActive(true);
                      setSoftPhone(target.value);
                      const idInput = document.querySelector<HTMLInputElement>(
                        `input[name="idNo_${index}"]`,
                      );
                      setSoftId(idInput?.value ?? '');
                    }
                  }}
                >
                  <FieldGuidance fieldKey="phone">
                    <FormField
                      name={`mobile_${index}`}
                      label="Mobile"
                      type="tel"
                      required
                      state={state}
                      defaultValue={formValues[`mobile_${index}`]}
                    />
                  </FieldGuidance>
                </div>
                <FormField
                  name={`email_${index}`}
                  label="Email"
                  type="email"
                  required
                  state={state}
                  defaultValue={formValues[`email_${index}`]}
                />
                <FormField
                  name={`passportNo_${index}`}
                  label="Passport No"
                  required
                  state={state}
                  defaultValue={formValues[`passportNo_${index}`]}
                />
                <FormField
                  name={`purpose_${index}`}
                  label="Purpose"
                  required
                  state={state}
                  defaultValue={formValues[`purpose_${index}`]}
                />
                <FormField
                  name={`amount_${index}`}
                  label="Loan Amount (KES)"
                  type="number"
                  required
                  state={state}
                  defaultValue={formValues[`amount_${index}`]}
                />
              </div>
            ))}
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/group/${id}/background`}
        disabled={isPending || softBlocks}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
