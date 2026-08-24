import { getGroupApplication } from '@/lib/data/applications';
import { Container } from '@workspace/ui/components/container';
import { Card } from '@workspace/ui/components/uwezo/card';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function GroupCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getGroupApplication(id);
  if (!app) notFound();

  return (
    <Container className="py-10 space-y-6">
      <Card radius="lg" variant="primary" className="p-6 space-y-4">
        <h1 className="typo-h4">Group Application Submitted</h1>
        <p>Acknowledgment number: <strong>{app.acknowledgmentNumber}</strong></p>
        <p>
          Each member should now complete their individual application using their national ID number.
        </p>
        <div className="flex flex-wrap gap-3">
          {app.members.map((member) => (
            <Button key={member.id} asChild variant="secondary">
              <Link href={`/apply/individual/start?idNo=${member.idNo}`}>
                {member.name} — Individual application
              </Link>
            </Button>
          ))}
        </div>
        <Button asChild>
          <Link href={`/status?ack=${app.acknowledgmentNumber}`}>Track application status</Link>
        </Button>
      </Card>
    </Container>
  );
}
