'use client';

import { IconUserCircle } from '@tabler/icons-react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FC, useEffect, useState } from 'react';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}

function getDisplayName(user: SessionUser): string {
  if (user.email) return user.email;
  if (user.phoneNumber) return user.phoneNumber;
  if (user.name) return user.name;
  return 'User';
}

export const ProfileMenu: FC = () => {
  const t = useTranslations('Common');
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data?.user ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (!user || loading) {
    return (
      <Link href="/login" className="no-underline text-inherit cursor-pointer">
        <Button
          variant="ghost"
          className="size-13 rounded-0 hover:bg-header flex flex-col items-center gap-0 p-0"
        >
          <IconUserCircle />
          <span className="text-nowrap text-xs font-normal">{t('login')}</span>
        </Button>
      </Link>
    );
  }

  const displayName = getDisplayName(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="" asChild>
        <Button
          variant="ghost"
          className="size-13 rounded-0 hover:bg-header flex flex-col items-center gap-0 p-0"
        >
          <IconUserCircle />
          <span className="text-nowrap text-xs font-normal">
            {t('myProfile')}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {user.name && (
          <>
            <div className="px-2 py-1.5 text-sm font-medium">{displayName}</div>
            <div className="text-muted-foreground px-2 pb-1.5 text-xs">
              {user.email}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="text-foreground cursor-pointer">
            {t('myApplications')}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
