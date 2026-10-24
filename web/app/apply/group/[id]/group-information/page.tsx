import { GroupInformationForm } from '@/app/apply/group/[id]/group-information/group-information-form';
import { getGroupApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function GroupInformationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getGroupApplication(id);

  if (!application) {
    notFound();
  }

  const groupData = application.groupData;

  return (
    <GroupInformationForm
      id={id}
      defaultValues={{
        groupName: groupData?.groupName,
        registrationNumber: groupData?.registrationNumber,
        registrationDate: groupData?.registrationDate
          ? groupData.registrationDate.toISOString().slice(0, 10)
          : undefined,
      }}
    />
  );
}
