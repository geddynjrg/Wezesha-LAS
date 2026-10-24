import { ApplicationGuidance } from '@/components/application-guidance';
import { ApplyFormStepper } from '@/components/apply-form-stepper';
import { DataConsentNotice } from '@/components/data-consent-notice';
import { GROUP_STEPS } from '@/lib/constants/majuu-steps';
import { resolveGuidanceForPath } from '@/lib/application-guidance';
import { getGroupApplication } from '@/lib/data/applications';
import {
  placementBlockMessage,
  unplacedGroupMembers,
} from '@/lib/neaims-placement-gate';
import {
  assertGroupChairAccess,
  GroupChairAccessError,
} from '@/lib/group-application-access';
import { getSessionUserId } from '@/lib/auth/session';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export interface GroupApplyLayoutProps {
  params: Promise<{ id: string }>;
  children?: ReactNode;
}

export default async function GroupApplyLayout({
  params,
  children,
}: GroupApplyLayoutProps) {
  const userId = await getSessionUserId();
  const { id } = await params;

  if (!userId) {
    redirect(`/login?callbackUrl=/apply/group/${id}/group-information`);
  }

  try {
    await assertGroupChairAccess(id);
  } catch (error) {
    if (error instanceof GroupChairAccessError) {
      if (error.code === 'unauthenticated') {
        redirect(`/login?callbackUrl=/apply/group/${id}/group-information`);
      }
      if (error.code === 'not-found') {
        notFound();
      }
      redirect('/my-application?error=group-chair-only');
    }
    throw error;
  }

  const application = await getGroupApplication(id);

  if (!application) {
    notFound();
  }

  const headerStore = await headers();
  const pathname = headerStore.get('x-path') ?? '';
  const onLaterGroupStep =
    application.status === 'DRAFT' &&
    /\/(loan-amount|terms|bank|guarantee|documents)(?:\/|$)/.test(pathname);
  if (onLaterGroupStep) {
    const unplaced = await unplacedGroupMembers(id);
    if (application.members.length === 0 || unplaced.length > 0) {
      const detail =
        unplaced.length > 0
          ? placementBlockMessage(unplaced)
          : 'List every job seeker and confirm a NEAIMS placement before continuing.';
      return (
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <h1 className="typo-h3">Group application cannot continue</h1>
          <p className="mt-3 text-sm text-neutral-800">{detail}</p>
          <p className="mt-3 text-sm text-neutral-700">
            A job placement must exist for every job seeker. Return to member
            details and continue only after NEAIMS shows a placement for each
            listed member.
          </p>
          <a
            className="text-primary mt-4 inline-block font-semibold underline"
            href={`/apply/group/${id}/member-details`}
          >
            Back to member details
          </a>
        </div>
      );
    }
  }
  const guidance = resolveGuidanceForPath(pathname, 'group');

  return (
    <>
      <DataConsentNotice userId={userId} applicationId={id} gateApply />
      <ApplyFormStepper
        steps={GROUP_STEPS}
        applicationProgress={application.progress}
        baseUrl={`/apply/group/${id}`}
      />
      <div className="mx-auto w-full max-w-5xl px-4 pt-4">
        <ApplicationGuidance guidance={guidance} />
      </div>
      {children}
    </>
  );
}
