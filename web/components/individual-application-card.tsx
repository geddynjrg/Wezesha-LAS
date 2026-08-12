import { MajuuApplicationStatus } from '@/components/majuu-application-status';
import type { ApplicationStatus } from '@/generated/prisma';
import { INDIVIDUAL_STEPS } from '@/lib/constants/majuu-steps';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { FC } from 'react';

export interface IndividualApplicationCardProps {
  memberId: string;
  memberName: string;
  acknowledgmentNumber?: string | null;
  status?: ApplicationStatus | null;
  progress?: number | null;
  groupName?: string | null;
  submitted: boolean;
}

function individualContinueUrl(memberId: string, progress: number, submitted: boolean) {
  if (submitted) {
    return `/apply/individual/${memberId}/dashboard`;
  }
  const stepIndex = Math.max(0, Math.min((progress || 1) - 1, INDIVIDUAL_STEPS.length - 1));
  const path = INDIVIDUAL_STEPS[stepIndex]?.path ?? '/individual-information';
  return `/apply/individual/${memberId}${path}`;
}

export const IndividualApplicationCard: FC<IndividualApplicationCardProps> = async ({
  memberId,
  memberName,
  acknowledgmentNumber,
  status,
  progress = 1,
  groupName,
  submitted,
}) => {
  const t = await getTranslations('DashboardPage');
  const href = individualContinueUrl(memberId, progress ?? 1, submitted);

  return (
    <Card
      variant="success"
      className="rounded-sm bg-neutral-100 px-4 py-8 shadow-md md:max-w-[500px]"
    >
      <div className="mb-4 grid gap-2">
        <h2 className="typo-h3">{acknowledgmentNumber || t('individualPendingAck')}</h2>
        <p className="font-medium">{memberName}</p>
        {groupName ? (
          <p>
            {t('group')} &ldquo;{groupName}&rdquo;
          </p>
        ) : null}
      </div>

      <Button variant="secondary" className="w-full text-neutral-700" asChild>
        <Link href={href}>
          {submitted ? t('viewIndividualApplication') : t('continueIndividualApplication')}
        </Link>
      </Button>

      {status ? (
        <div className="mt-4 space-y-2 border-t border-neutral-400 pt-4">
          <p className="font-bold">{t('status.title')}</p>
          <MajuuApplicationStatus status={status} />
        </div>
      ) : null}
    </Card>
  );
};
