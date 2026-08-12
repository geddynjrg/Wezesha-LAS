import { ApplicationProgressCard } from '@/components/application-progress-card';
import { IndividualApplicationCard } from '@/components/individual-application-card';
import { getUserGroupApplications, getUserIndividualMemberships } from '@/lib/data/applications';
import { getSessionUserId } from '@/lib/auth/session';
import { isValidReturnPath } from '@/lib/auth/return-path';
import { IconFileText, IconPlus } from '@tabler/icons-react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Container } from '@workspace/ui/components/container';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const params = await searchParams;
  if (params.redirect && isValidReturnPath(params.redirect)) {
    redirect(params.redirect);
  }

  const t = await getTranslations('DashboardPage');
  const [applications, memberships] = await Promise.all([
    getUserGroupApplications(userId),
    getUserIndividualMemberships(userId),
  ]);

  const ownedGroupIds = new Set(applications.map((application) => application.id));
  const individualMemberships = memberships.filter(
    (member) => !ownedGroupIds.has(member.applicationId) || member.individualApplication,
  );
  const totalCount = applications.length + individualMemberships.length;

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 pt-8">
        <div className="flex items-center gap-4">
          <h2 className="typo-h2">{t('myApplications')}</h2>
          <span className="typo-h6 text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full bg-neutral-500">
            {totalCount}
          </span>
        </div>

        {totalCount > 0 && (
          <Button size="lg" className="px-8" asChild>
            <Link href="/apply/create">
              <IconPlus className="mr-2 h-5 w-5" />
              {t('newApplication')}
            </Link>
          </Button>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="mx-auto max-w-2xl pb-8">
          <Card variant="success" className="p-8">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                  <IconFileText className="h-10 w-10 text-neutral-600" />
                </div>
              </div>

              <h3 className="typo-h2 mb-3 text-neutral-900">
                {t('emptyState.title')}
              </h3>
              <p className="mb-8 text-neutral-600">
                {t('emptyState.description')}
              </p>

              <Button size="lg" className="px-8" asChild>
                <Link href="/apply/create">
                  <IconPlus className="mr-2 h-5 w-5" />
                  {t('emptyState.applyButton')}
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-10 pb-8">
          {applications.length > 0 ? (
            <section className="space-y-4">
              <h3 className="typo-h4">{t('groupApplications')}</h3>
              <div className="grid justify-center gap-8 md:grid-cols-2 md:justify-normal">
                {applications.map((application) => {
                  const submittedMemberCount = application.members.filter(
                    (member) => member.loanStatus === 'INDIVIDUAL_SUBMITTED',
                  ).length;

                  return (
                    <ApplicationProgressCard
                      key={application.id}
                      id={application.id}
                      acknowledgmentNumber={application.acknowledgmentNumber}
                      status={application.status}
                      progress={application.progress}
                      groupName={application.groupData?.groupName}
                      memberCount={application.members.length}
                      submittedMemberCount={submittedMemberCount}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}

          {individualMemberships.length > 0 ? (
            <section className="space-y-4">
              <h3 className="typo-h4">{t('individualApplications')}</h3>
              <p className="text-neutral-600">{t('individualApplicationsHint')}</p>
              <div className="grid justify-center gap-8 md:grid-cols-2 md:justify-normal">
                {individualMemberships.map((member) => {
                  const individual = member.individualApplication;
                  const submitted = Boolean(individual?.submittedAt) ||
                    (individual?.status != null && individual.status !== 'DRAFT');

                  return (
                    <IndividualApplicationCard
                      key={member.id}
                      memberId={member.id}
                      memberName={member.name}
                      acknowledgmentNumber={
                        individual?.acknowledgmentNumber ?? member.application.acknowledgmentNumber
                      }
                      status={individual?.status}
                      progress={individual?.progress}
                      groupName={member.application.groupData?.groupName}
                      submitted={submitted}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </Container>
  );
}
