import { SignatureForm } from './signature-form';
import { getIndividualApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

export default async function SignaturePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);

  if (!app) {
    notFound();
  }

  return (
    <SignatureForm
      memberId={memberId}
      applicantName={app.member.name}
      defaultSignature={app.signature?.digitalSignature ?? null}
    />
  );
}
