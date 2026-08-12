'use server';

import { assertIndividualEditable } from '@/lib/individual-application-access';
import { recruitmentSchema } from './recruitment-schema';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { redirect } from 'next/navigation';

function parseDecimal(value: string | undefined): Prisma.Decimal | null {
  if (!value?.trim()) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return new Prisma.Decimal(numeric);
}

export async function saveRecruitmentAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  await assertIndividualEditable(memberId);

  const raw = Object.fromEntries(formData.entries());
  const parsed = recruitmentSchema.safeParse(raw);

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

  const recruitmentData = {
    agentNumber: parsed.data.agentNumber,
    localAgentName: parsed.data.localAgentName,
    employerAbroad: parsed.data.employerAbroad,
    recruiterCode: parsed.data.recruiterCode,
    countryOfDestination: parsed.data.countryOfDestination,
    natureOfWork: parsed.data.natureOfWork,
    durationType: parsed.data.durationType,
    workDuration: parsed.data.workDuration,
    currency: parsed.data.currency,
    monthlyRemuneration: parseDecimal(parsed.data.monthlyRemuneration),
    convertedKesAmount: parseDecimal(parsed.data.convertedKesAmount),
  };

  await prisma.recruitmentData.upsert({
    where: { applicationId: app.id },
    create: { applicationId: app.id, ...recruitmentData },
    update: recruitmentData,
  });

  await prisma.individualApplication.update({
    where: { id: app.id },
    data: { progress: 4 },
  });

  redirect(`/apply/individual/${memberId}/budget`);
}
