'use server';

import { assertIndividualEditable } from '@/lib/individual-application-access';
import {
  budgetFormSchema,
  parseBudgetItemsJson,
  validateBudgetAgainstMax,
} from './budget-schema';
import { getIndividualAwardAmount } from '@/lib/loan/award-amount';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { decimalToString } from '@/lib/serialize-for-client';
import { redirect } from 'next/navigation';

function parseMaxAppliedAmount(amount: unknown): number {
  const numeric = Number(decimalToString(amount));
  return Number.isNaN(numeric) ? 0 : numeric;
}

export async function saveBudgetAction(
  memberId: string,
  _prev: unknown,
  formData: FormData,
) {
  await assertIndividualEditable(memberId);

  const raw = Object.fromEntries(formData.entries());
  const parsed = budgetFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  let budgetItems;
  try {
    budgetItems = parseBudgetItemsJson(parsed.data.budgetItemsJson);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid budget items';
    return {
      success: false as const,
      errors: { budgetItemsJson: [message] },
      values: raw,
    };
  }

  const app = await prisma.individualApplication.findUniqueOrThrow({
    where: { memberId },
    include: { member: true },
  });

  const maxAppliedAmount = parseMaxAppliedAmount(app.member.amount);
  const validationError = validateBudgetAgainstMax(budgetItems, maxAppliedAmount);

  if (validationError) {
    return {
      success: false as const,
      errors: { budgetItemsJson: [validationError] },
      values: raw,
    };
  }

  const awardAmount = getIndividualAwardAmount(app.member.amount, budgetItems);

  await prisma.$transaction([
    prisma.budgetItem.deleteMany({ where: { applicationId: app.id } }),
    prisma.budgetItem.createMany({
      data: budgetItems.map((item) => ({
        applicationId: app.id,
        item: item.item,
        cost: new Prisma.Decimal(item.cost),
      })),
    }),
    prisma.individualApplication.update({
      where: { id: app.id },
      data: {
        progress: 5,
        awardAmount: new Prisma.Decimal(awardAmount),
      },
    }),
  ]);

  redirect(`/apply/individual/${memberId}/bank`);
}
