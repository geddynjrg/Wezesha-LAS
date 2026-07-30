import { getPsPendingApplications } from '@/lib/data/ps-applications';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { Badge } from '@workspace/ui/components/badge';
import { Card } from '@workspace/ui/components/card';
import { Container } from '@workspace/ui/components/container';
import { IconFileText } from '@tabler/icons-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function PsDashboardPage() {
  const user = await getSessionUser();
  if (!user || !isPsRole(user.role)) {
    redirect('/ps/sign-in');
  }

  const applications = await getPsPendingApplications(user.role);

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="typo-h2">Awaiting your signature</h2>
          <p className="typo-body-medium text-neutral-600">
            Individual applications submitted with tripartite agreements pending your official
            signature.
          </p>
        </div>
        <Badge variant="secondary" className="text-base">
          {applications.length} pending
        </Badge>
      </div>

      {applications.length === 0 ? (
        <Card variant="success" className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <IconFileText className="h-12 w-12 text-neutral-400" />
          </div>
          <h3 className="typo-h3 mb-2">No applications awaiting signature</h3>
          <p className="text-neutral-600">
            When migrants submit individual applications, they will appear here for your review and
            signature.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Link
              key={application.id}
              href={`/ps/applications/${application.id}/tripartite`}
              className="block"
            >
              <Card variant="success" className="p-5 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Application number</p>
                    <p className="typo-h4">{application.acknowledgmentNumber}</p>
                    <p className="mt-2 text-neutral-700">
                      {application.tripartite?.migrantName ?? application.member.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Group: {application.member.application.groupData?.groupName ?? '—'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-neutral-500">
                    {application.submittedAt ? (
                      <p>Submitted {application.submittedAt.toLocaleDateString('en-KE')}</p>
                    ) : null}
                    <p className="mt-2 font-medium text-primary">Review &amp; sign →</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
