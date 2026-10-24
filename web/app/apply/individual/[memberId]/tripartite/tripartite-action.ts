'use server';

import { tripartiteFormSchema } from './tripartite-schema';
import { submitIndividualApplication } from '@/lib/data/applications';
import { assertIndividualEditable } from '@/lib/individual-application-access';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function submitTripartiteAction(memberId: string, _prev: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = tripartiteFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  const app = await assertIndividualEditable(memberId);
  const member = await prisma.groupMember.findUniqueOrThrow({
    where: { id: memberId },
    select: { name: true, idNo: true, passportNo: true },
  });

  // Identity must stay bound to the member record — ignore form overrides for name/ID.
  const migrantName = member.name;
  const idNumber = member.idNo;
  const passportNumber = parsed.data.passportNumber || member.passportNo || '';

  await prisma.$transaction(async (tx) => {
    await tx.tripartiteData.upsert({
      where: { applicationId: app.id },
      create: {
        applicationId: app.id,
        migrantName,
        idNumber,
        passportNumber,
      },
      update: {
        migrantName,
        idNumber,
        passportNumber,
      },
    });

    await tx.individualApplication.update({
      where: { id: app.id },
      data: { tripartiteAccepted: true, progress: 9 },
    });
  });

  if (!app.submittedAt) {
    await submitIndividualApplication(app.id);
  }

  if (app.exitedCountry && app.loanAmountApproved && !app.offerLetterSignedAt) {
    redirect(`/apply/individual/${memberId}/offer-letter`);
  }

  redirect(`/apply/individual/${memberId}/dashboard`);
}

export async function getTripartiteDefaults(memberId: string) {
  const app = await prisma.individualApplication.findUnique({
    where: { memberId },
    include: {
      member: true,
      tripartite: true,
    },
  });

  if (!app) return null;

  return {
    migrantName: app.member.name,
    idNumber: app.member.idNo,
    passportNumber: app.tripartite?.passportNumber ?? app.member.passportNo ?? '',
    tripartiteAccepted: app.tripartiteAccepted,
  };
}
