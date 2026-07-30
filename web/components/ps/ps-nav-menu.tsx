'use client';

import { IconMenu2 } from '@tabler/icons-react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

const MENU_ITEMS = [
  { href: '/ps/dashboard', label: 'Dashboard', match: (path: string) => path.startsWith('/ps/dashboard') || path.startsWith('/ps/applications') },
  { href: '/ps/help', label: 'Help', match: (path: string) => path.startsWith('/ps/help') },
] as const;

export const PsNavMenu: FC = () => {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-13 rounded-0 hover:bg-header flex flex-col items-center gap-0 p-0"
        >
          <IconMenu2 />
          <span className="text-nowrap text-xs font-normal">Menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {MENU_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className={`cursor-pointer ${item.match(pathname) ? 'font-semibold text-primary' : ''}`}
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
