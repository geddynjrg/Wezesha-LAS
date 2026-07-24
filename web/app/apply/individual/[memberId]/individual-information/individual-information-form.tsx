'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import { saveIndividualInformationAction } from './individual-information-action';
import {
  EDUCATION_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  type IndividualInformationMemberDefaults,
  individualInformationSchema,
  resolveEducationLevelForForm,
} from './individual-information-schema';
import { Container } from '@workspace/ui/components/container';
import { Field, Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { labelVariants } from '@workspace/ui/components/label';
import { RadioGroup } from '@workspace/ui/components/radio-group';
import { Select } from '@workspace/ui/components/select';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useEffect, useMemo, useState } from 'react';

interface IndividualInformationFormProps {
  memberId: string;
  member: IndividualInformationMemberDefaults;
}

const ReadOnlyDisplay: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex w-full flex-col gap-1">
    <span className={cn(labelVariants(), 'mb-1 font-bold')}>{label}</span>
    <Input value={value} readonly disabled />
  </div>
);

export const IndividualInformationForm: FC<IndividualInformationFormProps> = ({
  memberId,
  member,
}) => {
  const educationDefaults = useMemo(
    () => resolveEducationLevelForForm(member.educationLevel),
    [member.educationLevel],
  );

  const defaultValues = useMemo(
    () => ({
      gender: GENDER_OPTIONS.includes(member.gender as (typeof GENDER_OPTIONS)[number])
        ? (member.gender as (typeof GENDER_OPTIONS)[number])
        : undefined,
      dob: member.dob,
      kraPin: member.kraPin,
      educationLevel: educationDefaults.educationLevel || undefined,
      educationLevelOther: educationDefaults.educationLevelOther,
      poBox: member.poBox,
      postalCode: member.postalCode,
      town: member.town,
      dependants: member.dependants?.toString() ?? '',
    }),
    [educationDefaults, member],
  );

  const action = saveIndividualInformationAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(
    action,
    individualInformationSchema,
    defaultValues,
  );

  const formValues = useMemo(
    () => ({ ...defaultValues, ...state.values }),
    [defaultValues, state.values],
  );

  const [educationLevel, setEducationLevel] = useState(
    educationDefaults.educationLevel,
  );

  useEffect(() => {
    if (typeof formValues.educationLevel === 'string' && formValues.educationLevel) {
      setEducationLevel(formValues.educationLevel);
    }
  }, [formValues.educationLevel]);

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Individual Information">
          <div className="grid gap-4 md:grid-cols-2">
            <ReadOnlyDisplay label="Full Name" value={member.name} />
            <ReadOnlyDisplay label="National ID" value={member.idNo} />

            <Field
              state={state}
              name="gender"
              label="Gender"
              required
              control={(props) => (
                <RadioGroup
                  {...props}
                  name="gender"
                  defaultValue={
                    typeof formValues.gender === 'string' ? formValues.gender : undefined
                  }
                  orientation="horizontal"
                  options={GENDER_OPTIONS.map((value) => ({
                    label: value,
                    value,
                  }))}
                />
              )}
            />

            <FormField
              name="dob"
              label="Date of Birth"
              type="date"
              state={state}
              defaultValue={formValues.dob}
            />
            <FormField
              name="kraPin"
              label="KRA PIN"
              state={state}
              defaultValue={formValues.kraPin}
            />

            <Field
              state={state}
              name="educationLevel"
              label="Education Level"
              required
              control={(props) => (
                <Select
                  {...props}
                  name="educationLevel"
                  placeholder="Select education level"
                  defaultValue={
                    typeof formValues.educationLevel === 'string'
                      ? formValues.educationLevel
                      : undefined
                  }
                  options={EDUCATION_LEVEL_OPTIONS.map((value) => ({
                    label: value,
                    value,
                  }))}
                  onValueChange={(value) => {
                    setEducationLevel(value);
                  }}
                />
              )}
            />

            {educationLevel === 'Other' && (
              <FormField
                name="educationLevelOther"
                label="Specify Education Level"
                required
                state={state}
                defaultValue={formValues.educationLevelOther}
                className="md:col-span-2"
              />
            )}

            <ReadOnlyDisplay label="Mobile" value={member.mobile} />
            <ReadOnlyDisplay label="Email" value={member.email} />
            <ReadOnlyDisplay label="Passport No" value={member.passportNo} />
            <FormField
              name="poBox"
              label="P.O. Box"
              state={state}
              defaultValue={formValues.poBox}
            />
            <FormField
              name="postalCode"
              label="Postal Code"
              state={state}
              defaultValue={formValues.postalCode}
            />
            <FormField
              name="town"
              label="Town"
              state={state}
              defaultValue={formValues.town}
            />
            <FormField
              name="dependants"
              label="Dependants"
              type="number"
              state={state}
              defaultValue={
                formValues.dependants != null ? String(formValues.dependants) : undefined
              }
            />
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending}
        prevUrl="/apply/individual"
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
