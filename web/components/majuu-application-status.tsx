'use client';

import type { ApplicationStatus } from '@/generated/prisma';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';

interface MajuuApplicationStatusProps {
  status: ApplicationStatus;
}

const STATUS_COLORS: Partial<Record<ApplicationStatus, string>> = {
  DRAFT: 'bg-yellow-400',
  GROUP_SUBMITTED: 'bg-blue-400',
  INDIVIDUAL_IN_PROGRESS: 'bg-orange-400',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-green-400',
  APPROVED: 'bg-green-600',
  REJECTED: 'bg-red-500',
};

export const MajuuApplicationStatus: FC<MajuuApplicationStatusProps> = ({
  status,
}) => {
  const t = useTranslations('DashboardPage.status');

  const statusKey = status.toLowerCase().replace(/_/g, '') as
    | 'draft'
    | 'groupsubmitted'
    | 'individualinprogress'
    | 'submitted'
    | 'underreview'
    | 'approved'
    | 'rejected';

  const labelMap: Record<string, string> = {
    draft: t('draft'),
    groupsubmitted: t('groupSubmitted'),
    individualinprogress: t('individualInProgress'),
    submitted: t('submitted'),
    underreview: t('underReview'),
    approved: t('approved'),
    rejected: t('rejected'),
  };

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          'mt-1 h-4 min-h-4 w-4 min-w-4 rounded-full',
          STATUS_COLORS[status] ?? 'bg-gray-400',
        )}
      />
      <span className="text-[21px] leading-[27px]">
        {labelMap[statusKey] ?? status}
      </span>
    </div>
  );
};
