import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { FC } from 'react';

/** Server-only apply CTA — no session/DB lookup (middleware handles auth redirects). */
export const StaticApplyButton: FC<{
  className?: string;
  href?: string;
  title?: string;
}> = async ({ className, href, title }) => {
  const t = await getTranslations('ApplyPage');
  const linkHref = href ?? '/login?callbackUrl=/apply/create';

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
