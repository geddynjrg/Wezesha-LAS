import { getSessionUserId } from '@/lib/auth/session';
import { MAJUU_NOINDEX_METADATA } from '@/lib/seo/site';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata = MAJUU_NOINDEX_METADATA;

export default async function MyApplicationLayout({ children }: { children?: ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login?callbackUrl=/my-application');
  }

  return children;
}
