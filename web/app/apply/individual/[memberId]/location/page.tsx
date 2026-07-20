import { LocationForm } from './location-form';
import { getIndividualApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function LocationPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();
  return <LocationForm memberId={memberId} defaultValues={app.location ?? undefined} />;
}
