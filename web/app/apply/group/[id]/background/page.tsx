import { BackgroundForm } from './background-form';
import { getGroupApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function BackgroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();
  return <BackgroundForm id={id} defaultValues={app.background ?? undefined} />;
}
