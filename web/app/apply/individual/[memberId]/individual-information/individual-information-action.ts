'use server';

import {
  individualInformationSchema,
  resolveEducationLevelForSave,
} from './individual-information-schema';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function saveIndividualInformationAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const parsed = individualInformationSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const educationLevel = resolveEducationLevelForSave(
    parsed.data.educationLevel,
    parsed.data.educationLevelOther,
  );

  await prisma.groupMember.update({
    where: { id: memberId },
    data: {
      gender: parsed.data.gender,
      dob: parsed.data.dob ? new Date(parsed.data.dob) : undefined,
      kraPin: parsed.data.kraPin,
      educationLevel,
      poBox: parsed.data.poBox,
      postalCode: parsed.data.postalCode,
      town: parsed.data.town,
      dependants: parsed.data.dependants,
    },
  });

  const app = await prisma.individualApplication.findUnique({ where: { memberId } });
  if (app) {
    await prisma.individualApplication.update({
      where: { id: app.id },
      data: { progress: 2 },
    });
  }

  redirect(`/apply/individual/${memberId}/location`);
}
