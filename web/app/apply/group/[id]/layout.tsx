import { ApplyFormStepper } from '@/components/apply-form-stepper';
import { GROUP_STEPS } from '@/lib/constants/majuu-steps';
import { getGroupApplication } from '@/lib/data/applications';
import { getSessionUserId } from '@/lib/auth/session';
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
  if (!userId) {
    const { id } = await params;
    redirect(`/login?callbackUrl=/apply/group/${id}/group-information`);
  }

  const { id } = await params;
  const application = await getGroupApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <>
      <ApplyFormStepper
        steps={GROUP_STEPS}
        applicationProgress={application.progress}
        baseUrl={`/apply/group/${id}`}
      />
      {children}
    </>
  );
}
