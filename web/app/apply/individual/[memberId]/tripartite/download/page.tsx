import { TripartiteDownloadView } from '@/components/tripartite/tripartite-download-view';
import { isTripartiteFullySigned } from '@/lib/individual-application-access';
import { getIndividualApplication } from '@/lib/data/applications';
import { Container } from '@workspace/ui/components/container';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TripartiteDownloadPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();

  const backUrl = `/apply/individual/${memberId}/dashboard`;

  if (!isTripartiteFullySigned(app.tripartite)) {
    return (
      <Container className="space-y-4 py-10">
        <h1 className="typo-h4">Tripartite agreement not ready</h1>
        <p className="text-neutral-600">
          The agreement can be downloaded only after both Principal Secretaries have signed.
        </p>
        <Button asChild>
          <Link href={backUrl}>Back to dashboard</Link>
        </Button>
      </Container>
    );
  }

  return (
    <TripartiteDownloadView
      migrantName={app.tripartite!.migrantName}
      idNumber={app.tripartite!.idNumber}
      passportNumber={app.tripartite!.passportNumber}
      migrantSignature={app.signature?.digitalSignature}
      labourPsSignature={app.tripartite!.labourPsSignature}
      labourPsSignedAt={app.tripartite!.labourPsSignedAt}
      msmePsSignature={app.tripartite!.msmePsSignature}
      msmePsSignedAt={app.tripartite!.msmePsSignedAt}
      acknowledgmentNumber={app.acknowledgmentNumber}
      backUrl={backUrl}
    />
  );
}
