import { RecruitmentForm } from './recruitment-form';
import { getIndividualApplication } from '@/lib/data/applications';
import { notFound } from 'next/navigation';

function formatDecimal(value: unknown): string | undefined {
  if (value == null) return undefined;
  const numeric =
    typeof value === 'object' && value !== null && 'toString' in value
      ? Number(value.toString())
      : Number(value);
  if (Number.isNaN(numeric)) return undefined;
  return numeric.toString();
}

export default async function RecruitmentPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);

  if (!app) {
    notFound();
  }

  const recruitment = app.recruitment;

  return (
    <RecruitmentForm
      memberId={memberId}
      defaultValues={
        recruitment
          ? {
              agentNumber: recruitment.agentNumber ?? undefined,
              localAgentName: recruitment.localAgentName ?? undefined,
              employerAbroad: recruitment.employerAbroad ?? undefined,
              recruiterCode: recruitment.recruiterCode ?? undefined,
              countryOfDestination: recruitment.countryOfDestination ?? undefined,
              natureOfWork: recruitment.natureOfWork ?? undefined,
              durationType:
                recruitment.durationType === 'months' || recruitment.durationType === 'years'
                  ? recruitment.durationType
                  : undefined,
              workDuration: recruitment.workDuration ?? undefined,
              currency:
                recruitment.currency === 'KWD' ||
                recruitment.currency === 'AED' ||
                recruitment.currency === 'RUB'
                  ? recruitment.currency
                  : undefined,
              monthlyRemuneration: formatDecimal(recruitment.monthlyRemuneration),
              convertedKesAmount: formatDecimal(recruitment.convertedKesAmount),
            }
          : undefined
      }
    />
  );
}
