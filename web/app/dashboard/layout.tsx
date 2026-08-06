import { getSessionUserId } from '@/lib/auth/session';
import { MAJUU_NOINDEX_METADATA } from '@/lib/seo/site';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata = MAJUU_NOINDEX_METADATA;

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
