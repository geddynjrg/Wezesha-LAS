import { MemberDetailsForm } from './member-details-form';
import { getGroupApplication } from '@/lib/data/applications';
import {
  buildMemberSlots,
  resolveMemberSlotCount,
} from '@/lib/member-slots';
import { lookupMseaBusiness } from '@/lib/msea';
import { notFound, redirect } from 'next/navigation';

export default async function MemberDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  if (!app.membership) {
    redirect(`/apply/group/${id}/membership`);
  }

  const totalMembers = resolveMemberSlotCount(app.membership.totalMembers);
  let mseaPartners;

  if (app.groupData?.registrationNumber) {
    try {
      const msea = await lookupMseaBusiness(app.groupData.registrationNumber);
      mseaPartners = msea?.partners;
    } catch (error) {
      console.error('MSEA partner lookup failed for member-details:', error);
    }
  }

  const members = buildMemberSlots(totalMembers, app.members, mseaPartners);

  return (
    <MemberDetailsForm
      id={id}
      members={members}
      expectedMemberCount={totalMembers}
    />
  );
}
