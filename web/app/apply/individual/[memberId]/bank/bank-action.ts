'use server';

import { bankSchema } from './bank-schema';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function saveBankAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = bankSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  const app = await prisma.individualApplication.findUniqueOrThrow({
    where: { memberId },
    include: { member: true },
  });

  await prisma.individualBankAccount.upsert({
    where: { applicationId: app.id },
    create: {
      applicationId: app.id,
      bankName: parsed.data.bankName,
      branchName: parsed.data.branchName,
      accountName: app.member.name,
      accountNumber: parsed.data.accountNumber,
    },
    update: {
      bankName: parsed.data.bankName,
      branchName: parsed.data.branchName,
      accountName: app.member.name,
      accountNumber: parsed.data.accountNumber,
    },
  });

  await prisma.individualApplication.update({
    where: { id: app.id },
    data: { progress: 6 },
  });

  redirect(`/apply/individual/${memberId}/credit-history`);
}
