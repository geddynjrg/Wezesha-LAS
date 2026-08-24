'use server';

import { canConsentToPredisbursement } from '@/lib/individual-application-access';
import { getIndividualApplication } from '@/lib/data/applications';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function acceptPredisbursementAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const accepted = formData.get('predisbursementAccepted') === 'on';
  if (!accepted) {
    return {
      success: false as const,
      errors: {
        predisbursementAccepted: ['You must accept the pre-disbursement agreement to continue.'],
      },
      values: {},
      message: 'Acceptance is required.',
    };
  }

  const app = await getIndividualApplication(memberId);
  if (!app) {
    return {
      success: false as const,
      errors: {},
      values: {},
      message: 'Application not found.',
    };
  }

  if (!canConsentToPredisbursement(app)) {
    return {
      success: false as const,
      errors: {},
      values: {},
      message: 'Pre-disbursement consent is not available until the loan amount is approved.',
    };
  }

  if (app.predisbursementAccepted) {
    redirect(`/apply/individual/${memberId}/dashboard`);
  }

  await prisma.individualApplication.update({
    where: { id: app.id },
    data: {
      predisbursementAccepted: true,
      predisbursementAcceptedAt: new Date(),
    },
  });

  redirect(`/apply/individual/${memberId}/dashboard`);
}
