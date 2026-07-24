import { LoanAmountForm } from './loan-amount-form';
import { getGroupApplication } from '@/lib/data/applications';
import { toClientMemberSummary } from '@/lib/serialize-for-client';
import { notFound } from 'next/navigation';

export default async function LoanAmountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  const members = app.members.map(toClientMemberSummary);

  return <LoanAmountForm id={id} members={members} />;
}
