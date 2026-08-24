import { GuaranteeForm } from './guarantee-form';
import { getGroupApplication } from '@/lib/data/applications';
import { toClientMemberSummary } from '@/lib/serialize-for-client';
import { notFound } from 'next/navigation';

export default async function GuaranteePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  const members = app.members.map(toClientMemberSummary);
  const groupName = app.groupData?.groupName?.trim() || '___________________';

  return <GuaranteeForm id={id} groupName={groupName} members={members} />;
}
