import { PredisbursementForm } from './predisbursement-form';
import {
  canConsentToPredisbursement,
  isLoanAmountApproved,
} from '@/lib/individual-application-access';
import { getIndividualApplication } from '@/lib/data/applications';
import { formatAgreementDate } from '@/components/tripartite/tripartite-agreement-document';
import { Container } from '@workspace/ui/components/container';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

function money(value: { toString(): string } | null | undefined) {
  if (value == null) return '0.00';
  const n = Number(value.toString());
  if (Number.isNaN(n)) return value.toString();
  return n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function PredisbursementPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();

  const dashboardUrl = `/apply/individual/${memberId}/dashboard`;

  if (!isLoanAmountApproved(app)) {
    return (
      <Container className="space-y-4 py-10">
        <h1 className="typo-h4">Pre-disbursement not available yet</h1>
        <p className="text-neutral-600">
          You can view and consent to the pre-disbursement agreement after your loan amount has been
          marked as approved.
        </p>
        <Button asChild>
          <Link href={dashboardUrl}>Back to dashboard</Link>
        </Button>
      </Container>
    );
  }

  if (!canConsentToPredisbursement(app) && !app.predisbursementAccepted) {
    return (
      <Container className="space-y-4 py-10">
        <h1 className="typo-h4">Submit your application first</h1>
        <Button asChild>
          <Link href={dashboardUrl}>Back to dashboard</Link>
        </Button>
      </Container>
    );
  }

  return (
    <Container className="space-y-6 py-8">
      <div>
        <h1 className="typo-h3">Pre-disbursement agreement</h1>
        <p className="text-neutral-600">
          Review the agreement for approved amount KES{' '}
          {money(app.awardAmount ?? app.member.amount)}.
        </p>
      </div>
      <PredisbursementForm
        memberId={memberId}
        applicantName={app.member.name}
        idNumber={app.member.idNo}
        acknowledgmentNumber={app.acknowledgmentNumber}
        approvedAmount={money(app.awardAmount ?? app.member.amount)}
        groupName={app.member.application.groupData?.groupName}
        alreadyAccepted={app.predisbursementAccepted}
        agreementDate={formatAgreementDate(new Date())}
      />
    </Container>
  );
}
