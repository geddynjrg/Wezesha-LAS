import { getSessionUser, invalidateSession } from '@/lib/auth/session';
import { isPsRole, psRoleLabel } from '@/lib/auth/roles';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function PsPortalLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user || !isPsRole(user.role)) {
    redirect('/ps/sign-in');
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">Principal Secretary Portal</p>
            <h1 className="typo-h4">{psRoleLabel(user.role)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600">{user.email}</span>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/ps/dashboard">Dashboard</Link>
            </Button>
            <form
              action={async () => {
                'use server';
                await invalidateSession();
                redirect('/ps/sign-in');
              }}
            >
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </Container>
      </header>
      {children}
    </div>
  );
}
