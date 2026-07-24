import { DocumentsForm } from './documents-form';
import { getGroupApplication } from '@/lib/data/applications';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  const members = app.members.map((member) => ({
    id: member.id,
    name: member.name,
    idNo: member.idNo,
  }));

  const initialDocuments = await prisma.applicationDocument.findMany({
    where: { groupApplicationId: id },
    select: {
      id: true,
      fileName: true,
      category: true,
      storagePath: true,
    },
    orderBy: { uploadedAt: 'asc' },
  });

  return <DocumentsForm id={id} members={members} initialDocuments={initialDocuments} />;
}
