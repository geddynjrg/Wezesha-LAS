'use server';

import {
  creditHistoryFormSchema,
  parseLoanDetailsJson,
} from './credit-history-schema';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { redirect } from 'next/navigation';

export async function saveCreditHistoryAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = creditHistoryFormSchema.safeParse(raw);

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

  const hasLoanHistory = parsed.data.hasLoanHistory === 'yes';
  let loanDetails = [];

  if (hasLoanHistory) {
    try {
      loanDetails = parseLoanDetailsJson(parsed.data.loanDetailsJson ?? '');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid loan details';
      return {
        success: false as const,
        errors: { loanDetailsJson: [message] },
        values: raw,
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.creditHistoryLoan.deleteMany({ where: { applicationId: app.id } });

    await tx.creditHistoryData.upsert({
      where: { applicationId: app.id },
      create: {
        applicationId: app.id,
        hasLoanHistory,
      },
      update: {
        hasLoanHistory,
      },
    });

    if (hasLoanHistory) {
      await tx.creditHistoryLoan.createMany({
        data: loanDetails.map((detail) => ({
          applicationId: app.id,
          lender: detail.lender,
          loanDate: new Date(detail.date),
          amount: new Prisma.Decimal(detail.amount),
          duration: detail.duration,
          monthlyInstallment: new Prisma.Decimal(detail.monthlyInstallment),
          outstandingAmount: new Prisma.Decimal(detail.outstandingAmount),
        })),
      });
    }

    await tx.individualApplication.update({
      where: { id: app.id },
      data: { progress: 7 },
    });
  });

  redirect(`/apply/individual/${memberId}/signature`);
}
