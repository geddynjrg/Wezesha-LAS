import { ChangePasswordForm } from '@/app/ps/(portal)/profile/change-password-form';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole, psRoleLabel } from '@/lib/auth/roles';
import { Card } from '@workspace/ui/components/card';
import { Container } from '@workspace/ui/components/container';
import { FormCard } from '@workspace/ui/components/uwezo/form-card';
import { redirect } from 'next/navigation';

export default async function PsProfilePage() {
  const user = await getSessionUser();
  if (!user || !isPsRole(user.role)) {
    redirect('/ps/sign-in');
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h2 className="typo-h2">My Profile</h2>
        <p className="typo-body-medium text-neutral-600">
          Your Principal Secretary account details and security settings.
        </p>
      </div>

      <div className="grid max-w-2xl gap-6">
        <Card variant="success" className="p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-neutral-500">Name</dt>
              <dd className="mt-1 text-neutral-900">{user.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-500">Email</dt>
              <dd className="mt-1 text-neutral-900">{user.email ?? '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-neutral-500">Role</dt>
              <dd className="mt-1 text-neutral-900">{psRoleLabel(user.role)}</dd>
            </div>
          </dl>
        </Card>

        <div id="change-password" className="scroll-mt-8">
          <FormCard title="Change password">
            <p className="mb-4 text-sm text-neutral-600">
              Update your portal password. You will remain signed in after changing it.
            </p>
            <ChangePasswordForm />
          </FormCard>
        </div>
      </div>
    </Container>
  );
}
