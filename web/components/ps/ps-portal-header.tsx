'use client';

import { PsNavMenu } from '@/components/ps/ps-nav-menu';
import { PsProfileMenu } from '@/components/ps/ps-profile-menu';
import { UserRole } from '@/generated/prisma';
import { Header } from '@workspace/ui/components/header';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

export interface PsPortalHeaderProps {
  name: string | null;
  email: string | null;
  role: UserRole;
}

export const PsPortalHeader: FC<PsPortalHeaderProps> = ({ name, email, role }) => {
  return (
    <Header
      startDecorator={
        <Link href="/ps/dashboard">
          <Image
            alt="Uwezo Fund Logo"
            src="/images/uwezo_logo_full.png"
            width={82}
            height={69}
            priority
          />
        </Link>
      }
      className="bg-background"
      endDecorator={
        <>
          <PsNavMenu />
          <PsProfileMenu name={name} email={email} role={role} />
        </>
      }
    />
  );
};
