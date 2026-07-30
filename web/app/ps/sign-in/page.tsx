import { PsLoginForm } from '@/app/ps/sign-in/ps-login-form';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { isValidReturnPath } from '@/lib/auth/return-path';
import { Container } from '@workspace/ui/components/container';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function PsSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();

  if (user && isPsRole(user.role)) {
    redirect(
      params.callbackUrl && isValidReturnPath(params.callbackUrl)
        ? params.callbackUrl
        : '/ps/dashboard',
    );
  }

  const redirectTo =
    params.callbackUrl && isValidReturnPath(params.callbackUrl)
      ? params.callbackUrl
      : '/ps/dashboard';

  return (
    <Container className="max-w-[500px] pt-8">
      <main>
        <header className="flex flex-col gap-2 pb-4">
          <div className="mb-2 flex justify-center">
            <Image
              alt="Uwezo Fund Logo"
              src="/images/uwezo_logo_full.png"
              width={255}
              height={96}
              priority
            />
          </div>
          <h1 className="typo-h2">Principal Secretary Portal</h1>
          <p className="typo-body-medium">
            Sign in to review and sign tripartite agreements for Wezesha Majuu individual
            applications.
          </p>
        </header>

        <PsLoginForm redirectTo={redirectTo} />
      </main>
    </Container>
  );
}
