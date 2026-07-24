import { MajuuApplicationStatus } from '@/components/majuu-application-status';
import type { ApplicationStatus } from '@/generated/prisma';
import {
  getGroupApplicationUrl,
  getGroupProgressLabel,
  GROUP_STEPS,
} from '@/lib/constants/majuu-steps';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { FC } from 'react';

export interface ApplicationProgressCardProps {
  id: string;
  acknowledgmentNumber: string;
  status: ApplicationStatus;
  progress: number;
  groupName?: string | null;
  memberCount?: number;
  submittedMemberCount?: number;
}

export const ApplicationProgressCard: FC<ApplicationProgressCardProps> = async ({
  id,
  acknowledgmentNumber,
  status,
  progress,
  groupName,
  memberCount = 0,
  submittedMemberCount = 0,
}) => {
  const t = await getTranslations('DashboardPage');
  const isDraft = status === 'DRAFT';
  const continueUrl = getGroupApplicationUrl(id, progress, status);
  const progressLabel = isDraft ? getGroupProgressLabel(progress) : null;

  return (
    <Card
      variant="success"
      className="rounded-sm bg-neutral-100 px-4 py-8 shadow-md md:max-w-[500px]"
    >
      <div className="mb-4 grid gap-2">
        <h2 className="typo-h3">{acknowledgmentNumber}</h2>
        {groupName ? (
          <p>
            {t('group')} &ldquo;{groupName}&rdquo;
          </p>
        ) : (
          <p className="text-neutral-600">{t('groupNamePending')}</p>
        )}
      </div>

      {isDraft && (
        <div className="mb-4 space-y-3 border-t border-neutral-400 pt-4">
          <p className="font-medium">{progressLabel}</p>
          <div className="flex flex-wrap gap-1">
            {GROUP_STEPS.map((step) => (
              <span
                key={step.index}
                className={`rounded px-2 py-1 text-xs ${
                  step.index <= progress
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {step.index}
              </span>
            ))}
          </div>
        </div>
      )}

      {!isDraft && memberCount > 0 && (
        <div className="mb-4 border-t border-neutral-400 pt-4">
          <p className="typo-body-medium">
            {t('memberProgress', {
              submitted: submittedMemberCount,
              total: memberCount,
            })}
          </p>
        </div>
      )}

      <Button variant="secondary" className="w-full text-neutral-700" asChild>
        <Link href={continueUrl}>
          {isDraft ? t('continueFillingApplication') : t('viewApplication')}
        </Link>
      </Button>

      <div className="mt-4 space-y-2 border-t border-neutral-400 pt-4">
        <p className="font-bold">{t('status.title')}</p>
        <MajuuApplicationStatus status={status} />
      </div>
    </Card>
  );
};
