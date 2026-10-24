import { TripartiteAgreementDocument } from '@/components/tripartite/tripartite-agreement-document';
import { getIndividualApplication } from '@/lib/data/applications';
import { Container } from '@workspace/ui/components/container';
import { notFound } from 'next/navigation';

export default async function ReadTripartitePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();

  const today = new Date();
  const agreementDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  return (
    <Container className="py-8">
      <h1 className="typo-h4 mb-4">Tripartite agreement</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Read this agreement before you use your offer-letter signature for it.
      </p>
      <TripartiteAgreementDocument
        readOnly
        migrantName={app.member.name}
        idNumber={app.member.idNo}
        passportNumber={app.tripartite?.passportNumber || app.member.passportNo || ''}
        migrantSignature={app.signature?.digitalSignature}
        labourPsSignature={app.tripartite?.labourPsSignature}
        labourPsSignedAt={app.tripartite?.labourPsSignedAt}
        msmePsSignature={app.tripartite?.msmePsSignature}
        msmePsSignedAt={app.tripartite?.msmePsSignedAt}
        agreementDate={agreementDate}
      />
    </Container>
  );
}
