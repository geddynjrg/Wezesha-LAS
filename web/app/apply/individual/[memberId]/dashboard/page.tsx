import {
  canConsentToPredisbursement,
  formatApplicationStatusLabel,
  isIndividualApplicationSubmitted,
  isLoanAmountApproved,
  isTripartiteFullySigned,
} from '@/lib/individual-application-access';
import { getIndividualApplication } from '@/lib/data/applications';
import { Container } from '@workspace/ui/components/container';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/uwezo/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';

function money(value: { toString(): string } | null | undefined) {
  if (value == null) return '—';
  const n = Number(value.toString());
  if (Number.isNaN(n)) return value.toString();
  return n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function IndividualDashboardPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();

  const submitted = isIndividualApplicationSubmitted(app);
  const tripartiteSigned = isTripartiteFullySigned(app.tripartite);
  const amountApproved = isLoanAmountApproved(app);
  const canPredisbursement = canConsentToPredisbursement(app);
  const approvedAmount = money(app.awardAmount ?? app.member.amount);
  const base = `/apply/individual/${memberId}`;

  return (
    <Container className="space-y-6 py-8">
      <div className="space-y-2">
        <h1 className="typo-h3">Individual application dashboard</h1>
        <p className="text-neutral-600">
          View your submitted Wezesha Majuu application. Submitted applications cannot be edited.
        </p>
      </div>

      <Card radius="lg" variant="primary" className="space-y-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-600">Acknowledgment</p>
            <p className="typo-h5">{app.acknowledgmentNumber}</p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium">
            {formatApplicationStatusLabel(app.status)}
          </span>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-neutral-600">Applicant</dt>
            <dd className="font-medium">{app.member.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-600">National ID</dt>
            <dd className="font-medium">{app.member.idNo}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-600">Group</dt>
            <dd className="font-medium">{app.member.application.groupData?.groupName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-600">Loan / award amount (KES)</dt>
            <dd className="font-medium">{approvedAmount}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-600">Submitted</dt>
            <dd className="font-medium">
              {app.submittedAt
                ? app.submittedAt.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
                : 'Not yet submitted'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-600">Editing</dt>
            <dd className="font-medium">{submitted ? 'Locked — view only' : 'In progress'}</dd>
          </div>
        </dl>
        {!submitted ? (
          <Button asChild>
            <Link href={`${base}/individual-information`}>Continue application</Link>
          </Button>
        ) : (
          <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
            Your application has been submitted and is read-only. Use the actions below for signed
            documents and pre-disbursement consent when available.
          </p>
        )}
      </Card>

      {submitted ? (
        <Card radius="lg" className="space-y-4 border border-neutral-200 bg-white p-6">
          <h2 className="typo-h5">Application summary (read-only)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-1 text-sm">
              <h3 className="font-semibold">Location</h3>
              <p>
                {[app.location?.county, app.location?.constituency, app.location?.ward]
                  .filter(Boolean)
                  .join(' / ') || '—'}
              </p>
            </section>
            <section className="space-y-1 text-sm">
              <h3 className="font-semibold">Bank account</h3>
              <p>
                {app.bankAccount
                  ? `${app.bankAccount.bankName} · ${app.bankAccount.accountNumber}`
                  : '—'}
              </p>
            </section>
            <section className="space-y-1 text-sm">
              <h3 className="font-semibold">Recruitment</h3>
              <p>
                {[app.recruitment?.countryOfDestination, app.recruitment?.natureOfWork]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </p>
            </section>
            <section className="space-y-1 text-sm">
              <h3 className="font-semibold">Guarantors</h3>
              <p>
                {app.guarantors.length
                  ? app.guarantors.map((g) => g.name).join(', ')
                  : '—'}
              </p>
            </section>
            <section className="space-y-1 text-sm md:col-span-2">
              <h3 className="font-semibold">Budget items</h3>
              {app.budgetItems.length === 0 ? (
                <p>—</p>
              ) : (
                <ul className="list-disc pl-5">
                  {app.budgetItems.map((item) => (
                    <li key={item.id}>
                      {item.item}: KES {money(item.cost)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card radius="lg" className="space-y-3 border border-neutral-200 bg-white p-6">
          <h2 className="typo-h5">Tripartite agreement</h2>
          {!app.tripartiteAccepted ? (
            <p className="text-sm text-neutral-600">
              Tripartite acceptance is pending. Complete the application steps first.
            </p>
          ) : !tripartiteSigned ? (
            <p className="text-sm text-neutral-600">
              You have accepted the agreement. It becomes downloadable after both Principal
              Secretaries (MSME and Labour) have signed.
            </p>
          ) : (
            <>
              <p className="text-sm text-neutral-600">
                The tripartite agreement is fully signed and available to download.
              </p>
              <Button asChild>
                <a href={`${base}/tripartite/download`}>Download tripartite agreement (PDF)</a>
              </Button>
            </>
          )}
        </Card>

        <Card radius="lg" className="space-y-3 border border-neutral-200 bg-white p-6">
          <h2 className="typo-h5">Pre-disbursement agreement</h2>
          {!amountApproved ? (
            <p className="text-sm text-neutral-600">
              Available after your loan amount has been marked as approved by the Fund.
            </p>
          ) : app.predisbursementAccepted ? (
            <>
              <p className="text-sm text-green-800">
                You consented on{' '}
                {app.predisbursementAcceptedAt
                  ? app.predisbursementAcceptedAt.toLocaleString('en-KE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : '—'}
                .
              </p>
              <Button asChild variant="secondary">
                <Link href={`${base}/predisbursement`}>View agreement</Link>
              </Button>
            </>
          ) : canPredisbursement ? (
            <>
              <p className="text-sm text-neutral-600">
                Your loan amount (KES {approvedAmount}) is approved. Review and consent to the
                pre-disbursement agreement to proceed.
              </p>
              <Button asChild>
                <Link href={`${base}/predisbursement`}>View &amp; consent</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-neutral-600">Submit your application first.</p>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link href={`/status?ack=${encodeURIComponent(app.acknowledgmentNumber)}`}>
            Track status
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">My applications</Link>
        </Button>
      </div>
    </Container>
  );
}
