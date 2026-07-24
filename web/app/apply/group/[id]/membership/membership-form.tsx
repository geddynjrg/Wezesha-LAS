'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import {
  MIN_GROUP_MEMBERS,
  createMembershipSchema,
  sumMembershipCounts,
} from './membership-schema';
import { saveMembershipAction } from './membership-action';
import { Container } from '@workspace/ui/components/container';
import { Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useMemo, useState } from 'react';

interface MembershipFormProps {
  id: string;
  registrationNumber?: string | null;
  mseaReachable: boolean;
  mseaTotalMembers: number | null;
  defaultValues?: {
    totalMales?: number;
    totalFemales?: number;
    totalDisabledMales?: number;
    totalDisabledFemales?: number;
  };
}

function readMemberCounts(form: HTMLFormElement) {
  const data = Object.fromEntries(new FormData(form).entries());
  return {
    totalMales: Number(data.totalMales || 0),
    totalFemales: Number(data.totalFemales || 0),
    totalDisabledMales: Number(data.totalDisabledMales || 0),
    totalDisabledFemales: Number(data.totalDisabledFemales || 0),
  };
}

export const MembershipForm: FC<MembershipFormProps> = ({
  id,
  registrationNumber,
  mseaReachable,
  mseaTotalMembers,
  defaultValues,
}) => {
  const useMseaCount =
    mseaReachable &&
    mseaTotalMembers !== null &&
    mseaTotalMembers >= MIN_GROUP_MEMBERS;

  const formDefaults = useMemo(
    () => ({
      totalMales: defaultValues?.totalMales ?? 0,
      totalFemales: defaultValues?.totalFemales ?? 0,
      totalDisabledMales: defaultValues?.totalDisabledMales ?? 0,
      totalDisabledFemales: defaultValues?.totalDisabledFemales ?? 0,
    }),
    [defaultValues],
  );

  const [memberCounts, setMemberCounts] = useState(formDefaults);

  const enteredTotal = sumMembershipCounts(memberCounts);
  const displayedTotal = useMseaCount ? mseaTotalMembers : enteredTotal;

  const schema = useMemo(
    () => createMembershipSchema(useMseaCount ? mseaTotalMembers : null),
    [mseaTotalMembers, useMseaCount],
  );

  const action = saveMembershipAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, schema, formDefaults);

  const mseaTooFew =
    mseaReachable &&
    mseaTotalMembers !== null &&
    mseaTotalMembers > 0 &&
    mseaTotalMembers < MIN_GROUP_MEMBERS;

  const mseaMismatch =
    useMseaCount && enteredTotal > 0 && enteredTotal !== mseaTotalMembers;

  const belowMinimum = !useMseaCount && enteredTotal > 0 && enteredTotal < MIN_GROUP_MEMBERS;

  return (
    <Form
      action={formAction}
      state={state}
      onInput={(event) => setMemberCounts(readMemberCounts(event.currentTarget))}
    >
      <Container className="py-8">
        <FormCard title="Membership Profile">
          {mseaTooFew && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive typo-body-small">
              Group has fewer than {MIN_GROUP_MEMBERS} registered members. Loan
              application cannot proceed.
            </div>
          )}

          {useMseaCount && (
            <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-blue-900 typo-body-small dark:text-blue-100">
              MSEA registration lists {mseaTotalMembers} member
              {mseaTotalMembers === 1 ? '' : 's'}. Males, females, and PWD
              counts must add up to this total.
            </div>
          )}

          {mseaReachable && registrationNumber && mseaTotalMembers === null && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-amber-900 typo-body-small dark:text-amber-100">
              Could not fetch member count from MSEA for {registrationNumber}.
              Total members will be calculated from your entries (minimum{' '}
              {MIN_GROUP_MEMBERS}).
            </div>
          )}

          {!mseaReachable && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-amber-900 typo-body-small dark:text-amber-100">
              MSEA registration service is unavailable. Total members will be
              calculated from your entries (minimum {MIN_GROUP_MEMBERS}).
            </div>
          )}

          {mseaMismatch && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive typo-body-small">
              Entered counts total {enteredTotal}, but MSEA lists{' '}
              {mseaTotalMembers} registered members.
            </div>
          )}

          {belowMinimum && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive typo-body-small">
              Group must have at least {MIN_GROUP_MEMBERS} members.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="totalMembersDisplay" className="typo-body-small font-medium">
                Total Number of Members
              </label>
              <Input
                id="totalMembersDisplay"
                type="number"
                value={displayedTotal}
                readOnly
                disabled
              />
              <p className="text-muted-foreground typo-body-small">
                {useMseaCount
                  ? 'Populated from MSEA registration. Your entries must match this total.'
                  : 'Calculated from Males + Females + PWD Males + PWD Females.'}
              </p>
            </div>

            <FormField
              name="totalMales"
              label="Males"
              type="number"
              required
              state={state}
              defaultValue={String(formDefaults.totalMales)}
            />
            <FormField
              name="totalFemales"
              label="Females"
              type="number"
              required
              state={state}
              defaultValue={String(formDefaults.totalFemales)}
            />
            <FormField
              name="totalDisabledMales"
              label="PWD Males"
              type="number"
              required
              state={state}
              defaultValue={String(formDefaults.totalDisabledMales)}
            />
            <FormField
              name="totalDisabledFemales"
              label="PWD Females"
              type="number"
              required
              state={state}
              defaultValue={String(formDefaults.totalDisabledFemales)}
            />
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/group/${id}/group-information`}
        disabled={
          isPending ||
          Boolean(mseaTooFew) ||
          Boolean(mseaMismatch) ||
          Boolean(belowMinimum)
        }
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
