'use server';

import { locationSchema } from './location-schema';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function saveLocationAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = locationSchema.safeParse(raw);

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

  await prisma.locationData.upsert({
    where: { applicationId: app.id },
    create: { applicationId: app.id, ...parsed.data },
    update: parsed.data,
  });

  await prisma.individualApplication.update({
    where: { id: app.id },
    data: { progress: 3 },
  });

  redirect(`/apply/individual/${memberId}/guarantor`);
}
