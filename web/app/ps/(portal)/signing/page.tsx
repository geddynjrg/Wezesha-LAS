import {
  countPsSigningPendingApplications,
  countPsSigningSignedApplications,
  getPsSigningPendingApplications,
  getPsSigningSignedApplications,
} from '@/lib/data/ps-signing-applications';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { Badge } from '@workspace/ui/components/badge';
import { Card } from '@workspace/ui/components/card';
import { Container } from '@workspace/ui/components/container';
import { UserRole } from '@/generated/prisma';
import { IconFileText } from '@tabler/icons-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Prisma } from '@/generated/prisma';

type PsSigningApplication = Prisma.IndividualApplicationGetPayload<{
  include: {
    member: { include: { application: { include: { groupData: true } } } };
    tripartite: true;
    signature: true;
  };
}>;

type SigningView = 'pending' | 'signed';

function ApplicationList({
  applications,
  variant,
  psRole,
}: {
  applications: PsSigningApplication[];
  variant: SigningView;
  psRole: UserRole;
}) {
  const isPending = variant === 'pending';

  if (applications.length === 0) {
    return (
      <Card variant="success" className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <IconFileText className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="typo-h3 mb-2">
          {isPending ? 'No applications awaiting signature' : 'No signed applications yet'}
        </h3>
        <p className="text-neutral-600">
          {isPending
            ? 'When migrants submit individual applications, they will appear here for your review and signature.'
            : 'Applications you have signed will appear here for future reference.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <Link
          key={application.id}
          href={`/ps/signing/applications/${application.id}`}
          className="block"
        >
          <Card
            variant="success"
            className="p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
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
                {!isPending && application.tripartite ? (
                  <p className="mt-1">
                    Signed{' '}
                    {(psRole === UserRole.PS_LABOUR
                      ? application.tripartite.labourPsSignedAt
                      : application.tripartite.msmePsSignedAt
                    )?.toLocaleDateString('en-KE') ?? '—'}
                  </p>
                ) : null}
                <p className="mt-2 font-medium text-primary">
                  {isPending ? 'Review & sign →' : 'View agreement →'}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function PsSigningDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || !isPsRole(user.role)) {
    redirect('/ps/sign-in');
  }

  const params = await searchParams;
  const view: SigningView = params.view === 'signed' ? 'signed' : 'pending';

  const [applications, pendingCount, signedCount] = await Promise.all([
    view === 'pending'
      ? getPsSigningPendingApplications(user.role)
      : getPsSigningSignedApplications(user.role),
    countPsSigningPendingApplications(user.role),
    countPsSigningSignedApplications(user.role),
  ]);

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h2 className="typo-h2">Tripartite agreements</h2>
        <p className="typo-body-medium text-neutral-600">
          Review and sign pending agreements, or view applications you have already signed.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200">
        <Link
          href="/ps/signing"
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            view === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Pending signature
          <Badge variant="secondary" className="ml-2">
            {pendingCount}
          </Badge>
        </Link>
        <Link
          href="/ps/signing?view=signed"
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            view === 'signed'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Signed
          <Badge variant="secondary" className="ml-2">
            {signedCount}
          </Badge>
        </Link>
      </div>

      <div className="mb-4 flex justify-end">
        <Badge variant="secondary" className="text-base">
          {applications.length} {view === 'pending' ? 'pending' : 'signed'}
        </Badge>
      </div>

      <ApplicationList applications={applications} variant={view} psRole={user.role} />
    </Container>
  );
}
