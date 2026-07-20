import { IndividualStepForm } from '../individual-step-form';

export default async function BudgetPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  return <IndividualStepForm memberId={memberId} step="budget" />;
}
