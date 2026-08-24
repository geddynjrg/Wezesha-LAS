import { BankForm } from './bank-form';
import { getGroupApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function BankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();
  return <BankForm id={id} defaultValues={app.bankAccount ?? undefined} />;
}
