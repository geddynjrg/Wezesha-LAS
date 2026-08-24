'use server';

import { tripartiteFormSchema } from './tripartite-schema';
import { submitIndividualApplication } from '@/lib/data/applications';
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

  const app = await prisma.individualApplication.findUniqueOrThrow({ where: { memberId } });

  if (app.submittedAt || app.status !== 'DRAFT') {
    redirect(`/apply/individual/${memberId}/dashboard`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.tripartiteData.upsert({
      where: { applicationId: app.id },
      create: {
        applicationId: app.id,
        migrantName: parsed.data.migrantName,
        idNumber: parsed.data.idNumber,
        passportNumber: parsed.data.passportNumber,
      },
      update: {
        migrantName: parsed.data.migrantName,
        idNumber: parsed.data.idNumber,
        passportNumber: parsed.data.passportNumber,
      },
    });

    await tx.individualApplication.update({
      where: { id: app.id },
      data: { tripartiteAccepted: true, progress: 9 },
    });
  });

  await submitIndividualApplication(app.id);
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
    migrantName: app.tripartite?.migrantName ?? app.member.name,
    idNumber: app.tripartite?.idNumber ?? app.member.idNo,
    passportNumber: app.tripartite?.passportNumber ?? app.member.passportNo ?? '',
    tripartiteAccepted: app.tripartiteAccepted,
  };
}
