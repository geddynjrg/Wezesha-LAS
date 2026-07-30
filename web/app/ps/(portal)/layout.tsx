import { PsPortalHeader } from '@/components/ps/ps-portal-header';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PsPortalLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user || !isPsRole(user.role)) {
    redirect('/ps/sign-in');
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PsPortalHeader name={user.name} email={user.email} role={user.role} />
      {children}
    </div>
  );
}
