import { createMajuuMetadata } from '@/lib/seo/site';
import { StatusSearchForm } from './status-search-form';
import { getGroupApplicationByAck, getIndividualApplication } from '@/lib/data/applications';
import { formatAmountDisplay } from '@/lib/loan/award-amount';
import { prisma } from '@/lib/prisma';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/uwezo/card';
import Link from 'next/link';

export const metadata = createMajuuMetadata({
  title: 'Track Application Status',
  description:
    'Track your Wezesha Majuu loan application status using your acknowledgment number or national ID on the Uwezo Fund migrant labour portal.',
  path: '/status',
});

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ ack?: string; idNo?: string }>;
}) {
  const { ack, idNo } = await searchParams;

  let groupApp = ack ? await getGroupApplicationByAck(ack) : null;
  let individualApp = null;

  if (idNo) {
    const member = await prisma.groupMember.findFirst({
      where: { idNo },
      orderBy: { createdAt: 'desc' },
    });
    if (member) {
      individualApp = await getIndividualApplication(member.id);
    }
  }

  if (!groupApp && individualApp?.member.applicationId) {
    groupApp = await prisma.groupApplication.findUnique({
      where: { id: individualApp.member.applicationId },
      include: { members: true, groupData: true },
    });
  }

  return (
    <StatusSearchForm ack={ack} idNo={idNo}>
      {groupApp && (
        <Card radius="lg" variant="primary" className="space-y-2 p-6">
          <h2 className="typo-h5">Group Application</h2>
          <p className="typo-body-medium">Acknowledgment: {groupApp.acknowledgmentNumber}</p>
          <p className="typo-body-medium">Status: {groupApp.status}</p>
          <p className="typo-body-medium">Group: {groupApp.groupData?.groupName ?? '—'}</p>
          <ul className="typo-body-small list-disc pl-6">
            {groupApp.members.map((m) => (
              <li key={m.id}>{m.name} — {m.loanStatus}</li>
            ))}
          </ul>
          <Button asChild variant="secondary">
            <Link href={`/apply/group/${groupApp.id}/complete`}>
              View submission summary
            </Link>
          </Button>
        </Card>
      )}

      {individualApp && (
        <Card radius="lg" variant="primary" className="space-y-2 p-6">
          <h2 className="typo-h5">Individual Application</h2>
          <p className="typo-body-medium">Reference: {individualApp.acknowledgmentNumber}</p>
          <p className="typo-body-medium">Status: {individualApp.status}</p>
          <p className="typo-body-medium">Member: {individualApp.member.name}</p>
          <p className="typo-body-medium">
            Loan award amount: KES{' '}
            {formatAmountDisplay(
              individualApp.awardAmount ?? individualApp.member.amount,
            )}
          </p>
        </Card>
      )}

      {(ack || idNo) && !groupApp && !individualApp && (
        <p className="text-muted-foreground typo-body-medium">No application found for the provided details.</p>
      )}
    </StatusSearchForm>
  );
}
