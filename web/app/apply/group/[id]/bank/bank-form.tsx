'use client';

import { ApplyFormActionBar } from '@/components/apply-form-action-bar';
import { FormField } from '@/components/form-field';
import { saveBankAction } from './bank-action';
import { groupBankSchema, type GroupBankInput } from './bank-schema';
import { GROUP_BANK_OPTIONS } from '@/lib/constants/group-banks';
import {
  getBranchesForBank,
  loadKenyaBankBranches,
  type BankBranch,
} from '@/lib/data/kenya-bank-branches';
import { Container } from '@workspace/ui/components/container';
import { Field, Form } from '@workspace/ui/components/form';
import { SearchInput } from '@workspace/ui/components/search-input';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { useForm } from '@workspace/ui/hooks/use-form';
import { type FC, useEffect, useMemo, useState } from 'react';

interface BankFormProps {
  id: string;
  defaultValues?: Partial<GroupBankInput>;
}

export const BankForm: FC<BankFormProps> = ({ id, defaultValues }) => {
  const action = saveBankAction.bind(null, id);
  const [state, formAction, isPending] = useForm(action, groupBankSchema, defaultValues ?? {});

  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [csvLoading, setCsvLoading] = useState(true);
  const [csvError, setCsvError] = useState('');
  const [selectedBank, setSelectedBank] = useState(defaultValues?.bankName ?? '');
  const [selectedBranch, setSelectedBranch] = useState(defaultValues?.branchName ?? '');

  useEffect(() => {
    let cancelled = false;

    loadKenyaBankBranches()
      .then((rows) => {
        if (!cancelled) {
          setBankBranches(rows);
          setCsvError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBankBranches([]);
          setCsvError('Failed to load bank branches. Please refresh and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCsvLoading(false);
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
    if (state.values?.branchName) {
      setSelectedBranch(state.values.branchName);
    }
  }, [state.values?.bankName, state.values?.branchName]);

  const bankOptions = useMemo(
    () =>
      GROUP_BANK_OPTIONS.map((bank) => ({
        label: bank,
        value: bank,
      })),
    [],
  );

  const branchOptions = useMemo(
    () => getBranchesForBank(bankBranches, selectedBank),
    [bankBranches, selectedBank],
  );

  const handleBankSelect = (value: string) => {
    setSelectedBank(value);
    setSelectedBranch('');
  };

  return (
    <Form action={formAction} state={state}>
      <input type="hidden" name="bankName" value={selectedBank} />
      <input type="hidden" name="branchName" value={selectedBranch} />

      <Container className="py-8">
        <FormCard title="Group Bank Account Details">
          {csvError ? (
            <div
              className="typo-body-medium mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800"
              role="alert"
            >
              <strong>Error:</strong> {csvError}
            </div>
          ) : null}

          <div className="space-y-4">
            <Field
              state={state}
              name="bankName"
              label="Bank Name"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  name=""
                  defaultValue={selectedBank || defaultValues?.bankName}
                  placeholder="Choose or search bank"
                  options={bankOptions}
                  isLoading={csvLoading}
                  disabled={csvLoading}
                  onValueChange={(value) => {
                    if (value && bankOptions.some((option) => option.value === value)) {
                      handleBankSelect(value);
                    }
                  }}
                  onValueSelect={handleBankSelect}
                />
              )}
            />
            {csvLoading ? (
              <p className="typo-body-medium text-neutral-600">Loading bank data...</p>
            ) : null}

            <Field
              state={state}
              name="branchName"
              label="Branch Name"
              required
              control={(props) => (
                <SearchInput
                  {...props}
                  name=""
                  key={selectedBank || 'no-bank'}
                  defaultValue={selectedBranch}
                  placeholder={
                    !selectedBank
                      ? 'Select a bank first'
                      : csvLoading
                        ? 'Loading branches...'
                        : branchOptions.length === 0
                          ? 'No branches found'
                          : 'Choose or search branch'
                  }
                  options={branchOptions}
                  isLoading={csvLoading}
                  disabled={!selectedBank || csvLoading}
                  onValueChange={(value) => {
                    if (value && branchOptions.some((option) => option.value === value)) {
                      setSelectedBranch(value);
                    }
                  }}
                  onValueSelect={setSelectedBranch}
                />
              )}
            />
            {selectedBank && csvLoading ? (
              <p className="typo-body-medium text-neutral-600">
                Loading branches for {selectedBank}...
              </p>
            ) : null}
            {selectedBank && !csvLoading && branchOptions.length === 0 ? (
              <p className="typo-body-medium text-amber-700">
                No branches found for {selectedBank}. Please select a different bank.
              </p>
            ) : null}

            <FormField
              name="accountName"
              label="Bank Account Name"
              required
              state={state}
              defaultValue={defaultValues?.accountName}
            />

            <FormField
              name="accountNumber"
              label="Bank Account Number"
              required
              state={state}
              defaultValue={defaultValues?.accountNumber}
            />

            <p className="typo-body-medium pt-2">
              <strong>NB: At least three applicants to be signatories.</strong>
            </p>
          </div>
        </FormCard>
      </Container>

      <ApplyFormActionBar
        prevUrl={`/apply/group/${id}/terms`}
        disabled={isPending || csvLoading}
        submitLabel={csvLoading ? 'Loading...' : 'Save & Continue'}
      />
    </Form>
  );
};
