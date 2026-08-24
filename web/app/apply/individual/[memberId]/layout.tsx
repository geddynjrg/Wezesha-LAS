import { ApplicationGuidance } from '@/components/application-guidance';
import { ApplyFormStepper } from '@/components/apply-form-stepper';
import { INDIVIDUAL_STEPS } from '@/lib/constants/majuu-steps';
import { resolveGuidanceForPath } from '@/lib/application-guidance';
import { getIndividualApplication } from '@/lib/data/applications';
import { isIndividualApplicationEditable } from '@/lib/individual-application-access';
import { getSessionUserId } from '@/lib/auth/session';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

function isPostSubmissionAllowedPath(pathname: string, memberId: string): boolean {
  const base = `/apply/individual/${memberId}`;
  const allowedExact = [`${base}/dashboard`, `${base}/complete`, `${base}/predisbursement`];
  if (allowedExact.includes(pathname)) return true;
  if (pathname.startsWith(`${base}/tripartite/download`)) return true;
  return false;
}

export default async function IndividualApplyLayout({
  params,
  children,
}: {
  params: Promise<{ memberId: string }>;
  children?: ReactNode;
}) {
  const userId = await getSessionUserId();
  const { memberId } = await params;

  if (!userId) {
    redirect(`/login?callbackUrl=/apply/individual/${memberId}/individual-information`);
  }

  const application = await getIndividualApplication(memberId);

  if (!application) {
    notFound();
  }

  const headerStore = await headers();
  const pathname = headerStore.get('x-path') ?? '';
  const editable = isIndividualApplicationEditable(application);

  if (!editable && pathname && !isPostSubmissionAllowedPath(pathname, memberId)) {
    redirect(`/apply/individual/${memberId}/dashboard`);
  }

  const guidance = editable ? resolveGuidanceForPath(pathname, 'individual') : null;

  return (
    <>
      {editable ? (
        <ApplyFormStepper
          steps={INDIVIDUAL_STEPS}
          applicationProgress={application.progress}
          baseUrl={`/apply/individual/${memberId}`}
        />
      ) : null}
      {editable ? (
        <div className="mx-auto w-full max-w-5xl px-4 pt-4">
          <ApplicationGuidance guidance={guidance} />
        </div>
      ) : null}
      {children}
    </>
  );
}
