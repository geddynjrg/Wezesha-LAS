import { getSessionUserId } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export interface DashboardLayoutProps {
  children?: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return <>{children}</>;
}
