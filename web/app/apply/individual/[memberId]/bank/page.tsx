import { BankForm } from './bank-form';
import { getIndividualApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function BankPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);

  if (!app) {
    notFound();
  }

  return (
    <BankForm
      memberId={memberId}
      defaultValues={
        app.bankAccount
          ? {
              bankName: app.bankAccount.bankName,
              branchName: app.bankAccount.branchName ?? undefined,
              accountNumber: app.bankAccount.accountNumber,
            }
          : undefined
      }
    />
  );
}
