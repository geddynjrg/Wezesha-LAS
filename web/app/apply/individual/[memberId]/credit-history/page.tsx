import { CreditHistoryForm } from './credit-history-form';
import { formatLoanDate } from './credit-history-schema';
import { getIndividualApplication } from '@/lib/data/applications';
import { decimalToString } from '@/lib/serialize-for-client';
import { notFound } from 'next/navigation';

export default async function CreditHistoryPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);

  if (!app) {
    notFound();
  }

  const defaultLoanDetails =
    app.creditHistoryLoans.length > 0
      ? app.creditHistoryLoans.map((loan) => ({
          lender: loan.lender,
          date: formatLoanDate(loan.loanDate),
          amount: decimalToString(loan.amount),
          duration: loan.duration,
          monthlyInstallment: decimalToString(loan.monthlyInstallment),
          outstandingAmount: decimalToString(loan.outstandingAmount),
        }))
      : undefined;

  return (
    <CreditHistoryForm
      memberId={memberId}
      defaultHasLoanHistory={app.creditHistory?.hasLoanHistory ?? false}
      defaultLoanDetails={defaultLoanDetails}
    />
  );
}
