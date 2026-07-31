import { PsTripartiteForm } from '@/app/ps/(portal)/applications/[id]/tripartite/ps-tripartite-form';
import { getPsApplicationById } from '@/lib/data/ps-applications';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { notFound, redirect } from 'next/navigation';

export default async function PsTripartitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user || !isPsRole(user.role)) {
    redirect('/ps/sign-in');
  }

  const application = await getPsApplicationById(id);
  if (!application?.tripartite || !application.tripartiteAccepted) {
    notFound();
  }

  return (
    <PsTripartiteForm
      applicationId={application.id}
      psRole={user.role}
      acknowledgmentNumber={application.acknowledgmentNumber}
      migrantName={application.tripartite.migrantName}
      idNumber={application.tripartite.idNumber}
      passportNumber={application.tripartite.passportNumber}
      migrantSignature={application.signature?.digitalSignature ?? null}
      labourPsSignature={application.tripartite.labourPsSignature}
      labourPsSignedAt={application.tripartite.labourPsSignedAt}
      msmePsSignature={application.tripartite.msmePsSignature}
      msmePsSignedAt={application.tripartite.msmePsSignedAt}
    />
  );
}
