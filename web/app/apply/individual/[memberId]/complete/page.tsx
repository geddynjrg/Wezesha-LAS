import { getIndividualApplication } from '@/lib/data/applications';
import { Container } from '@workspace/ui/components/container';
import { Card } from '@workspace/ui/components/uwezo/card';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function IndividualCompletePage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();

  // Prefer the post-submit dashboard as the canonical view.
  if (app.submittedAt) {
    redirect(`/apply/individual/${memberId}/dashboard`);
  }

  return (
    <Container className="py-10">
      <Card radius="lg" variant="primary" className="space-y-3 p-6">
        <h1 className="typo-h4">Individual Application Submitted</h1>
        <p>
          Reference: <strong>{app.acknowledgmentNumber}</strong>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/apply/individual/${memberId}/dashboard`}>Open dashboard</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/status?ack=${app.acknowledgmentNumber}`}>Track status</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}
