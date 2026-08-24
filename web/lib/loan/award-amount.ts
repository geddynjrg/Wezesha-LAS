import type { BudgetItem } from '@/generated/prisma';
import { decimalToString } from '@/lib/serialize-for-client';

export function sumBudgetItems(budgetItems: Pick<BudgetItem, 'cost'>[]): number {
  return budgetItems.reduce((sum, item) => {
    const cost = Number(decimalToString(item.cost));
    return sum + (Number.isNaN(cost) ? 0 : cost);
  }, 0);
}

/**
 * Budget breakdown total takes priority over the group application amount
 * (GroupMember.amount) when awarding the individual loan.
 */
export function getIndividualAwardAmount(
  memberAmount: unknown,
  budgetItems: Pick<BudgetItem, 'cost'>[],
): number {
  const budgetTotal = sumBudgetItems(budgetItems);
  if (budgetItems.length > 0 && budgetTotal > 0) {
    return budgetTotal;
  }

  const groupAmount = Number(decimalToString(memberAmount));
  return Number.isNaN(groupAmount) ? 0 : groupAmount;
}

export function formatAmountDisplay(amount: unknown): string {
  const numeric = Number(decimalToString(amount));
  if (Number.isNaN(numeric)) return '0';
  return numeric.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-KE', { maximumFractionDigits: 2 });
}
