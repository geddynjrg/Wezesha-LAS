import { PsPortalHeader } from '@/components/ps/ps-portal-header';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole, psRoleLabel } from '@/lib/auth/roles';
import { Container } from '@workspace/ui/components/container';
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
      <div className="border-b border-neutral-200 bg-white">
        <Container className="py-6">
          <p className="typo-h4 text-neutral-600">Principal Secretary Portal</p>
          <h1 className="typo-h2">{psRoleLabel(user.role)}</h1>
        </Container>
      </div>
      {children}
    </div>
  );
}
