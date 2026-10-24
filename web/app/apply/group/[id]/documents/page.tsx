import { DocumentsForm } from './documents-form';
import { getGroupApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  return <DocumentsForm id={id} />;
}
