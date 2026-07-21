import { TripartiteForm } from './tripartite-form';
import { getTripartiteDefaults } from './tripartite-action';
import { getIndividualApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function TripartitePage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);

  if (!app) {
    notFound();
  }

  const defaults = await getTripartiteDefaults(memberId);

  return (
    <TripartiteForm
      memberId={memberId}
      defaultMigrantName={defaults?.migrantName ?? app.member.name}
      defaultIdNumber={defaults?.idNumber ?? app.member.idNo}
      defaultPassportNumber={defaults?.passportNumber ?? app.member.passportNo ?? ''}
      defaultAccepted={defaults?.tripartiteAccepted ?? false}
      migrantSignature={app.signature?.digitalSignature ?? null}
    />
  );
}
