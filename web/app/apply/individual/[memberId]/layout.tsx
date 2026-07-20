import { ApplyFormStepper } from '@/components/apply-form-stepper';
import { INDIVIDUAL_STEPS } from '@/lib/constants/majuu-steps';
import { getIndividualApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function IndividualApplyLayout({
  params,
  children,
}: {
  params: Promise<{ memberId: string }>;
  children?: ReactNode;
}) {
  const { memberId } = await params;
  const application = await getIndividualApplication(memberId);

  if (!application) {
    notFound();
  }

  return (
    <>
      <ApplyFormStepper
        steps={INDIVIDUAL_STEPS}
        applicationProgress={application.progress}
        baseUrl={`/apply/individual/${memberId}`}
      />
      {children}
    </>
  );
}
