'use server';

import { assertIndividualApplicantAccess } from '@/lib/individual-application-access';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function signOfferLetterAction(memberId: string, _prev: unknown, formData: FormData) {
  await assertIndividualApplicantAccess(memberId);

  const app = await prisma.individualApplication.findUnique({
    where: { memberId },
    include: { member: true },
  });

  if (!app || !app.exitedCountry || !app.loanAmountApproved) {
    return {
      success: false as const,
      errors: { form: ['This offer letter is not available for your application.'] },
      values: {},
    };
  }

  if (app.offerLetterSignedAt) {
    redirect(`/apply/individual/${memberId}/offer-letter/download`);
  }

  const signature = String(formData.get('digitalSignature') || '');
  const termsAccepted = formData.get('termsAccepted') === 'on';
  const alsoSignTripartite = formData.get('alsoSignTripartite') === 'on';
  const errors: Record<string, string[]> = {};

  if (!signature.startsWith('data:image/')) {
    errors.digitalSignature = ['Sign the offer letter using the signature pad.'];
  }
  if (!termsAccepted) {
    errors.termsAccepted = ['Accept the terms and conditions to continue.'];
  }
  if (Object.keys(errors).length > 0) {
    return { success: false as const, errors, values: {} };
  }

  await prisma.$transaction(async (tx) => {
    await tx.individualApplication.update({
      where: { id: app.id },
      data: {
        offerLetterSignature: signature,
        offerLetterSignedAt: new Date(),
        ...(alsoSignTripartite && !app.tripartiteAccepted ? { tripartiteAccepted: true } : {}),
      },
    });

    if (alsoSignTripartite && !app.tripartiteAccepted) {
      await tx.signatureData.upsert({
        where: { applicationId: app.id },
        create: { applicationId: app.id, digitalSignature: signature },
        update: { digitalSignature: signature },
      });
      await tx.tripartiteData.upsert({
        where: { applicationId: app.id },
        create: {
          applicationId: app.id,
          migrantName: app.member.name,
          idNumber: app.member.idNo,
          passportNumber: app.member.passportNo || 'N/A',
        },
        update: {
          migrantName: app.member.name,
          idNumber: app.member.idNo,
        },
      });
    }
  });

  redirect(`/apply/individual/${memberId}/dashboard`);
}
