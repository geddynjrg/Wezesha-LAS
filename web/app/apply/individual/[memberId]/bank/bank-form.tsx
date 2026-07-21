'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { saveBankAction } from './bank-action';
import { bankSchema, type BankInput } from './bank-schema';
import {
  type BankBranch,
  getBranchesForBank,
  getUniqueBanks,
  loadKenyaBankBranches,
} from '@/lib/data/kenya-bank-branches';
import { Container } from '@workspace/ui/components/container';
import { Field, Form } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { SearchInput } from '@workspace/ui/components/search-input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useEffect, useMemo, useState } from 'react';

interface BankFormProps {
  memberId: string;
  defaultValues?: Partial<BankInput>;
}

export const BankForm: FC<BankFormProps> = ({ memberId, defaultValues }) => {
  const action = saveBankAction.bind(null, memberId);
  const [state, formAction, isPending] = useForm(action, bankSchema, defaultValues);

  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | undefined>(
    defaultValues?.bankName,
  );

  useEffect(() => {
    let cancelled = false;
    setBanksLoading(true);
    loadKenyaBankBranches()
      .then((rows) => {
        if (!cancelled) {
          setBankBranches(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBankBranches([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBanksLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.values?.bankName) {
      setSelectedBank(state.values.bankName);
    }
  }, [state.values?.bankName]);

  const bankOptions = useMemo(
    () =>
      getUniqueBanks(bankBranches).map((bank) => ({
        label: bank,
        value: bank,
      })),
    [bankBranches],
  );

  const branchOptions = useMemo(
    () => getBranchesForBank(bankBranches, selectedBank || ''),
    [bankBranches, selectedBank],
  );

  return (
    <Form action={formAction} state={state}>
      <Container className="py-8">
        <FormCard title="Bank Account Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              state={state}
              name="bankName"
              label="Bank"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? defaultValues?.bankName}
                  placeholder="Choose or search bank"
                  options={bankOptions}
                  isLoading={banksLoading}
                  onValueChange={(value) => {
                    setSelectedBank(value);
                  }}
                  onValueSelect={(value) => {
                    setSelectedBank(value);
                  }}
                />
              )}
            />

            <Field
              state={state}
              name="branchName"
              label="Branch"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  defaultValue={props.defaultValue ?? defaultValues?.branchName}
                  placeholder="Choose or search branch"
                  options={branchOptions}
                  isLoading={banksLoading}
                  disabled={!selectedBank && !defaultValues?.bankName}
                />
              )}
            />

            <Field
              state={state}
              name="accountNumber"
              label="Account Number"
              required
              control={(props) => (
                <Input
                  {...props}
                  defaultValue={props.defaultValue ?? defaultValues?.accountNumber}
                  placeholder="Enter account number"
                />
              )}
            />
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        disabled={isPending}
        prevUrl={`/apply/individual/${memberId}/budget`}
        submitLabel="Save & Continue"
      />
    </Form>
  );
};
