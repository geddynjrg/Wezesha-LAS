import { buildLoginHref } from '@/app/login/login-query';
import { IconArrowRight, IconUser, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function LoginRolePicker({
  callbackUrl,
  individualTitle,
  individualSubtitle,
  individualDescription,
  individualButton,
  groupTitle,
  groupSubtitle,
  groupDescription,
  groupButton,
}: {
  callbackUrl?: string;
  individualTitle: string;
  individualSubtitle: string;
  individualDescription: string;
  individualButton: string;
  groupTitle: string;
  groupSubtitle: string;
  groupDescription: string;
  groupButton: string;
}) {
  return (
    <div className="grid gap-3">
      <RoleChoiceCard
        href={buildLoginHref({ role: 'individual', callbackUrl })}
        icon={<IconUser className="size-8" aria-hidden />}
        title={individualTitle}
        subtitle={individualSubtitle}
        description={individualDescription}
        buttonLabel={individualButton}
      />
      <RoleChoiceCard
        href={buildLoginHref({ role: 'group', callbackUrl })}
        icon={<IconUsers className="size-8" aria-hidden />}
        title={groupTitle}
        subtitle={groupSubtitle}
        description={groupDescription}
        buttonLabel={groupButton}
        emphasized
      />
    </div>
  );
}

function RoleChoiceCard({
  href,
  icon,
  title,
  subtitle,
  description,
  buttonLabel,
  emphasized,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  emphasized?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        emphasized
          ? 'group block rounded-2xl border-2 border-primary bg-white p-5 no-underline transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          : 'group block rounded-2xl border-2 border-neutral-200 bg-white p-5 no-underline transition-colors hover:border-primary hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      }
    >
      <div className="flex items-start gap-4">
        <span className="text-primary mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="typo-h5 text-foreground">{title}</h2>
          <p className="text-sm font-medium text-neutral-700">{subtitle}</p>
          <p className="text-sm text-neutral-600">{description}</p>
          <p className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-semibold">
            {buttonLabel}
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </p>
        </div>
      </div>
    </Link>
  );
}
