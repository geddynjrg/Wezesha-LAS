import { ECitizenLoginForm } from '@/app/login/ecitizen-login-form';
import { EmailLoginForm } from '@/app/login/email-login-form';
import {
  emailLoginAction,
  phoneLoginAction,
} from '@/app/login/login-actions';
import { buildLoginHref } from '@/app/login/login-query';
import { LoginRolePicker } from '@/app/login/login-role-picker';
import { PhoneLoginForm } from '@/app/login/phone-login-form';
import { getSessionUserId } from '@/lib/auth/session';
import {
  resolveApplicantLoginRole,
  resolveLoginSuccessPath,
} from '@/lib/auth/return-path';
import { MAJUU_NOINDEX_METADATA } from '@/lib/seo/site';
import { Container } from '@workspace/ui/components/container';
import { Divider } from '@workspace/ui/components/divider';
import { Underline } from '@workspace/ui/components/underline';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = MAJUU_NOINDEX_METADATA;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; type?: string; role?: string }>;
}) {
  const params = await searchParams;
  const loginType =
    params.type === 'email'
      ? 'email'
      : params.type === 'phone'
        ? 'phone'
        : 'ecitizen';
  const callbackUrl = params.callbackUrl;
  const loginSuccessPath = resolveLoginSuccessPath(callbackUrl);
  const selectedRole = resolveApplicantLoginRole(params.role, callbackUrl);
  const t = await getTranslations('LoginPage');

  const userId = await getSessionUserId();
  if (userId) {
    redirect(loginSuccessPath);
  }

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
          {selectedRole ? (
            <>
              <p className="text-sm font-medium text-neutral-500">
                {t('loginStepHint')}
              </p>
              <h1 className="typo-h2">{t('loginStepTitle')}</h1>
              <p className="typo-body-medium">{t('loginStepDescription')}</p>
              <p className="typo-body-medium text-neutral-700">
                {selectedRole === 'group'
                  ? t('applyingAsGroup')
                  : t('applyingAsIndividual')}{' '}
                <Link
                  href="/login"
                  className="text-primary font-semibold underline-offset-2 hover:underline"
                >
                  {t('changeRole')}
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-neutral-500">
                {t('roleStepHint')}
              </p>
              <h1 className="typo-h2">{t('roleStepTitle')}</h1>
              <p className="typo-body-medium">{t('roleStepDescription')}</p>
            </>
          )}
        </header>

        {!selectedRole ? (
          <LoginRolePicker
            callbackUrl={callbackUrl}
            individualTitle={t('individualRoleTitle')}
            individualSubtitle={t('individualRoleSubtitle')}
            individualDescription={t('individualRoleDescription')}
            individualButton={t('individualRoleButton')}
            groupTitle={t('groupRoleTitle')}
            groupSubtitle={t('groupRoleSubtitle')}
            groupDescription={t('groupRoleDescription')}
            groupButton={t('groupRoleButton')}
          />
        ) : (
          <section aria-labelledby="login-form-heading">
            <h2 id="login-form-heading" className="sr-only">
              {t('loginFormHeading')}
            </h2>

            {loginType === 'ecitizen' && (
              <div className="space-y-4">
                <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                  <ECitizenLoginForm />
                </Suspense>

                <Divider className="my-6">{t('or')}</Divider>

                <nav
                  aria-label="Alternative login methods"
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex justify-center gap-4">
                    <Link
                      href={buildLoginHref({
                        role: selectedRole,
                        callbackUrl,
                        type: 'email',
                      })}
                      className="text-primary"
                    >
                      <Underline variant="primary" className="text-primary">
                        Use Email
                      </Underline>
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                      href={buildLoginHref({
                        role: selectedRole,
                        callbackUrl,
                        type: 'phone',
                      })}
                      className="text-primary"
                    >
                      <Underline variant="primary" className="text-primary">
                        Use Phone
                      </Underline>
                    </Link>
                  </div>
                </nav>
              </div>
            )}

            {loginType === 'email' && (
              <div className="space-y-4">
                <EmailLoginForm
                  action={emailLoginAction}
                  redirectTo={loginSuccessPath}
                />

                <Divider className="my-6">{t('or')}</Divider>

                <nav
                  aria-label="Authentication options"
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex justify-center gap-4">
                    <Link
                      href={buildLoginHref({
                        role: selectedRole,
                        callbackUrl,
                        type: 'ecitizen',
                      })}
                      className="text-primary"
                    >
                      <Underline variant="primary" className="text-primary">
                        Use eCitizen
                      </Underline>
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                      href={buildLoginHref({
                        role: selectedRole,
                        callbackUrl,
                        type: 'phone',
                      })}
                      className="text-primary"
                    >
                      <Underline variant="primary" className="text-primary">
                        Use Phone
                      </Underline>
                    </Link>
                  </div>

                  <div className="flex justify-center gap-2">
                    <span className="typo-body-medium">
                      {t('doNotHaveAccount')}
                    </span>
                    <Underline variant="primary">
                      <Link href="/signup" className="text-primary">
                        {t('signUp')}
                      </Link>
                    </Underline>
                  </div>
                </nav>
              </div>
            )}

            {loginType === 'phone' && (
              <div className="space-y-4">
                <PhoneLoginForm
                  action={phoneLoginAction}
                  redirectTo={loginSuccessPath}
                />

                <Divider className="my-6">{t('or')}</Divider>

                <nav
                  aria-label="Authentication options"
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex justify-center gap-4">
                    <Link
                      href={buildLoginHref({
                        role: selectedRole,
                        callbackUrl,
                        type: 'ecitizen',
                      })}
                      className="text-primary"
                    >
                      <Underline variant="primary" className="text-primary">
                        Use eCitizen
                      </Underline>
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                      href={buildLoginHref({
                        role: selectedRole,
                        callbackUrl,
                        type: 'email',
                      })}
                      className="text-primary"
                    >
                      <Underline variant="primary" className="text-primary">
                        Use Email
                      </Underline>
                    </Link>
                  </div>
                </nav>
              </div>
            )}
          </section>
        )}
      </main>
    </Container>
  );
}
