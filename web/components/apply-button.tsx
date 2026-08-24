import { getSessionUserId } from '@/lib/auth/session';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { FC } from 'react';

export const ApplyButton: FC<{
  className?: string;
  href?: string;
  title?: string;
}> = async ({ className, href, title }) => {
  const t = await getTranslations('ApplyPage');
  const userId = await getSessionUserId();
  const linkHref =
    href ??
    (userId ? '/dashboard' : '/login?callbackUrl=/dashboard');

  return (
    <Button
      asChild
      variant="secondary"
      className={cn(
        'bg-background text-primary hover:text-background border-primary px-6',
        className,
      )}
    >
      <Link href={linkHref}>{title ?? t('startGroup')}</Link>
    </Button>
  );
};
