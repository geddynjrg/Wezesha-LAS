'use client';

import { PsProfileMenu } from '@/components/ps/ps-profile-menu';
import { UserRole } from '@/generated/prisma';
import { psRoleLabel } from '@/lib/auth/roles';
import { Container } from '@workspace/ui/components/container';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

export interface PsPortalHeaderProps {
  name: string | null;
  email: string | null;
  role: UserRole;
}

const NAV_ITEMS = [
  { href: '/ps/dashboard', label: 'Dashboard', match: (path: string) => path.startsWith('/ps/dashboard') || path.startsWith('/ps/applications') },
  { href: '/ps/help', label: 'Help', match: (path: string) => path.startsWith('/ps/help') },
] as const;

export const PsPortalHeader: FC<PsPortalHeaderProps> = ({ name, email, role }) => {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">Principal Secretary Portal</p>
          <h1 className="typo-h4">{psRoleLabel(role)}</h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <PsProfileMenu name={name} email={email} role={role} />
        </nav>
      </Container>
    </header>
  );
};
