'use client';

import { psRoleLabel } from '@/lib/auth/roles';
import { UserRole } from '@/generated/prisma';
import { IconUserCircle } from '@tabler/icons-react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

export interface PsProfileMenuProps {
  name: string | null;
  email: string | null;
  role: UserRole;
}

export const PsProfileMenu: FC<PsProfileMenuProps> = ({ name, email, role }) => {
  const router = useRouter();
  const displayName = name ?? email ?? 'Principal Secretary';

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/ps/sign-in');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-13 rounded-0 hover:bg-header flex flex-col items-center gap-0 p-0"
        >
          <IconUserCircle />
          <span className="text-nowrap text-xs font-normal">Profile</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          {email ? <p className="text-muted-foreground text-xs">{email}</p> : null}
          <p className="text-muted-foreground mt-1 text-xs">{psRoleLabel(role)}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/ps/profile" className="cursor-pointer">
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/ps/profile#change-password" className="cursor-pointer">
            Change password
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
