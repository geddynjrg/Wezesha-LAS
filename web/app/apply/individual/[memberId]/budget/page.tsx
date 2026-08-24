import { BudgetForm } from './budget-form';
import { createDefaultBudgetItems } from './budget-schema';
import { getIndividualApplication } from '@/lib/data/applications';
import { decimalToString } from '@/lib/serialize-for-client';
import { notFound } from 'next/navigation';

function parseMaxAppliedAmount(amount: unknown): number {
  const numeric = Number(decimalToString(amount));
  return Number.isNaN(numeric) ? 0 : numeric;
}

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);

  if (!app) {
    notFound();
  }

  const defaultItems =
    app.budgetItems.length > 0
      ? app.budgetItems.map((item) => ({
          item: item.item,
          cost: decimalToString(item.cost),
        }))
      : createDefaultBudgetItems();

  return (
    <BudgetForm
      memberId={memberId}
      maxAppliedAmount={parseMaxAppliedAmount(app.member.amount)}
      defaultItems={defaultItems}
    />
  );
}
