'use server';

import { assertIndividualEditable } from '@/lib/individual-application-access';
import { signatureSchema } from './signature-schema';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function saveSignatureAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  await assertIndividualEditable(memberId);

  const raw = Object.fromEntries(formData.entries());
  const parsed = signatureSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  const app = await prisma.individualApplication.findUniqueOrThrow({
    where: { memberId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.signatureData.upsert({
      where: { applicationId: app.id },
      create: {
        applicationId: app.id,
        digitalSignature: parsed.data.digitalSignature,
      },
      update: {
        digitalSignature: parsed.data.digitalSignature,
      },
    });

    await tx.groupMember.update({
      where: { id: memberId },
      data: { signature: 'signed' },
    });

    await tx.individualApplication.update({
      where: { id: app.id },
      data: { progress: 8 },
    });
  });

  redirect(`/apply/individual/${memberId}/tripartite`);
}
