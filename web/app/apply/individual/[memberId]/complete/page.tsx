import { getIndividualApplication } from '@/lib/data/applications';
import { Container } from '@workspace/ui/components/container';
import { Card } from '@workspace/ui/components/uwezo/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function IndividualCompletePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();

  return (
    <Container className="py-10">
      <Card radius="lg" variant="primary" className="p-6 space-y-3">
        <h1 className="typo-h4">Individual Application Submitted</h1>
        <p>
          Reference: <strong>{app.acknowledgmentNumber}</strong>
        </p>
        <Link href={`/status?ack=${app.acknowledgmentNumber}`} className="underline">
          Track status
        </Link>
      </Card>
    </Container>
  );
}
