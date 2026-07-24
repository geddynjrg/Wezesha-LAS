import { TermsForm } from './terms-form';
import { getGroupApplication } from '@/lib/data/applications';
import { formatAmountDisplay } from '@/lib/loan/award-amount';
import { decimalToString } from '@/lib/serialize-for-client';
import { notFound } from 'next/navigation';

export default async function TermsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  const groupName = app.groupData?.groupName?.trim() || '_________________';
  const totalLoanAmount = formatAmountDisplay(
    app.members.reduce((sum, member) => {
      const amount = Number(decimalToString(member.amount));
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0),
  );

  return (
    <TermsForm
      id={id}
      groupName={groupName}
      totalLoanAmount={totalLoanAmount || '_________________'}
    />
  );
}
