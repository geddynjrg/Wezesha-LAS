import { ECitizenLoginForm } from '@/app/login/ecitizen-login-form';
import { EmailLoginForm } from '@/app/login/email-login-form';
import {
  emailLoginAction,
  phoneLoginAction,
} from '@/app/login/login-actions';
import { PhoneLoginForm } from '@/app/login/phone-login-form';
import { getSessionUserId } from '@/lib/auth/session';
import { isGroupLoginIntent, isMemberLoginIntent, resolveLoginSuccessPath } from '@/lib/auth/return-path';
import { MAJUU_NOINDEX_METADATA } from '@/lib/seo/site';
import { Container } from '@workspace/ui/components/container';
import { Divider } from '@workspace/ui/components/divider';
import { Underline } from '@workspace/ui/components/underline';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata = MAJUU_NOINDEX_METADATA;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; type?: string }>;
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
  const groupIntent = isGroupLoginIntent(callbackUrl);
  const memberIntent = isMemberLoginIntent(callbackUrl);
  const t = await getTranslations('LoginPage');

  const userId = await getSessionUserId();
  if (userId) {
    redirect(loginSuccessPath);
  }

  const callbackQuery = callbackUrl
    ? `&callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '';

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
          <h1 className="typo-h2">{t('title')}</h1>
          <p className="typo-body-medium">{t('description')}</p>
          <p className="typo-body-medium">
            {t.rich('flowDescription', {
              bold: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
          <p className="typo-body-medium">
            {t.rich('submittedDescription', {
              bold: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
        </header>

        <div className="mb-6 grid gap-3">
          {groupIntent ? (
            <Card variant="primary" className="space-y-3 p-4">
              <h2 className="typo-h6 font-semibold">{t('groupCtaTitle')}</h2>
              <p className="text-sm text-neutral-600">{t('groupCtaContinueDescription')}</p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/login?callbackUrl=/my-application">{t('memberCtaButton')}</Link>
              </Button>
            </Card>
          ) : memberIntent ? (
            <Card variant="primary" className="space-y-3 p-4">
              <h2 className="typo-h6 font-semibold">{t('memberCtaTitle')}</h2>
              <p className="text-sm text-neutral-600">{t('memberCtaDescription')}</p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/login?callbackUrl=/dashboard">{t('groupCtaButton')}</Link>
              </Button>
            </Card>
          ) : (
            <>
              <Card variant="primary" className="space-y-3 p-4">
                <h2 className="typo-h6 font-semibold">{t('groupCtaTitle')}</h2>
                <p className="text-sm text-neutral-600">{t('groupCtaDescription')}</p>
                <Button asChild className="w-full">
                  <Link href="/login?callbackUrl=/dashboard">{t('groupCtaButton')}</Link>
                </Button>
              </Card>
              <Card className="space-y-3 border border-neutral-200 bg-white p-4">
                <h2 className="typo-h6 font-semibold">{t('memberCtaTitle')}</h2>
                <p className="text-sm text-neutral-600">{t('memberCtaDescription')}</p>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/login?callbackUrl=/my-application">{t('memberCtaButton')}</Link>
                </Button>
              </Card>
            </>
          )}
        </div>

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
                    href={`/login?type=email${callbackQuery}`}
                    className="text-primary"
                  >
                    <Underline variant="primary" className="text-primary">
                      Use Email
                    </Underline>
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link
                    href={`/login?type=phone${callbackQuery}`}
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
                    href={`/login?type=ecitizen${callbackQuery}`}
                    className="text-primary"
                  >
                    <Underline variant="primary" className="text-primary">
                      Use eCitizen
                    </Underline>
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link
                    href={`/login?type=phone${callbackQuery}`}
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
                    href={`/login?type=ecitizen${callbackQuery}`}
                    className="text-primary"
                  >
                    <Underline variant="primary" className="text-primary">
                      Use eCitizen
                    </Underline>
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link
                    href={`/login?type=email${callbackQuery}`}
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
      </main>
    </Container>
  );
}
