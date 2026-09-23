import { ApplicationGuidance } from '@/components/application-guidance';
import { ApplyFormStepper } from '@/components/apply-form-stepper';
import { DataConsentNotice } from '@/components/data-consent-notice';
import { PrescriptiveGuidance } from '@/components/prescriptive-guidance';
import { GROUP_STEPS } from '@/lib/constants/majuu-steps';
import { resolveGuidanceForPath } from '@/lib/application-guidance';
import { getGroupApplication } from '@/lib/data/applications';
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
        <PrescriptiveGuidance
          destinationCountry={application.groupData?.destinationCountry}
          hasAgency={Boolean(
            application.groupData?.agency || application.groupData?.localAgentName,
          )}
        />
      </div>
      {children}
    </>
  );
}
