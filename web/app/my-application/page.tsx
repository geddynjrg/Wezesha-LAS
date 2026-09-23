import { IndividualApplicationCard } from '@/components/individual-application-card';
import {
  getMatchedIndividualMemberships,
  individualMembershipUrl,
  resolveSingleIndividualApplicationUrl,
} from '@/lib/individual-application-routing';
import { isIndividualApplicationSubmitted } from '@/lib/individual-application-url';
import { getSessionUserId } from '@/lib/auth/session';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Container } from '@workspace/ui/components/container';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login?callbackUrl=/my-application');
  }

  const { error } = await searchParams;

  const directUrl = await resolveSingleIndividualApplicationUrl(userId);
  if (directUrl && error !== 'group-chair-only') {
    redirect(directUrl);
  }

  const memberships = await getMatchedIndividualMemberships(userId);
  const t = await getTranslations('MyApplicationPage');

  if (memberships.length === 0) {
    return (
      <Container className="max-w-xl space-y-4 py-10">
        <Card variant="primary" className="space-y-4 p-6">
          <h1 className="typo-h4">{t('title')}</h1>
          {error === 'group-chair-only' ? (
            <p className="text-destructive">{t('groupChairOnly')}</p>
          ) : null}
          <p className="text-neutral-600">{t('notFoundDescription')}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/apply/individual">{t('lookupById')}</Link>
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="typo-h3">{t('chooseTitle')}</h1>
        {error === 'group-chair-only' ? (
          <p className="text-destructive">{t('groupChairOnly')}</p>
        ) : null}
        <p className="text-neutral-600">{t('chooseDescription')}</p>
      </div>
      <div className="grid justify-center gap-8 md:grid-cols-2 md:justify-normal">
        {memberships.map((member) => {
          const individual = member.individualApplication;
          const submitted = isIndividualApplicationSubmitted(
            individual?.submittedAt,
            individual?.status,
          );

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
              href={individualMembershipUrl(member)}
            />
          );
        })}
      </div>
    </Container>
  );
}
