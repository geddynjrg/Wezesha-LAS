import { IndividualInformationForm } from './individual-information-form';
import { getIndividualApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function IndividualInformationPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();
  return <IndividualInformationForm memberId={memberId} member={app.member} />;
}
