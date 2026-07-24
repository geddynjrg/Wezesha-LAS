import { MembershipForm } from './membership-form';
import { getGroupApplication } from '@/lib/data/applications';
import { checkMseaReachable, lookupMseaBusiness } from '@/lib/msea';
import { notFound } from 'next/navigation';

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  const mseaReachable = await checkMseaReachable();
  let mseaTotalMembers: number | null = null;

  if (mseaReachable && app.groupData?.registrationNumber) {
    const msea = await lookupMseaBusiness(app.groupData.registrationNumber);
    mseaTotalMembers = msea?.totalMembers ?? null;
  }

  return (
    <MembershipForm
      id={id}
      registrationNumber={app.groupData?.registrationNumber}
      mseaReachable={mseaReachable}
      mseaTotalMembers={mseaTotalMembers}
      defaultValues={app.membership ?? undefined}
    />
  );
}
