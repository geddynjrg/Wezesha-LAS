import { OfferLetterForm } from './offer-letter-form';
import { getIndividualApplication } from '@/lib/data/applications';
import { formatKes, missingOfferSteps, nextOfferStepUrl, offerBreakdown } from '@/lib/offer-letter';
import { notFound, redirect } from 'next/navigation';

export default async function OfferLetterPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app || !app.exitedCountry || !app.loanAmountApproved) notFound();

  if (app.offerLetterSignedAt) {
    redirect(`/apply/individual/${memberId}/offer-letter/download`);
  }

  if (missingOfferSteps(app).length > 0) {
    redirect(nextOfferStepUrl(memberId, app));
  }

  const breakdown = offerBreakdown(app);
  const groupName = app.member.application.groupData?.groupName?.trim() || 'the group';

  return (
    <OfferLetterForm
      memberId={memberId}
      applicantName={app.member.name}
      groupName={groupName}
      amountToPay={formatKes(breakdown.total)}
      airTicket={formatKes(breakdown.airTicket)}
      visaApplication={formatKes(breakdown.visaApplication)}
      upkeepTrade={formatKes(breakdown.upkeepTrade)}
      tripartiteAccepted={app.tripartiteAccepted}
      tripartiteReadUrl={`/apply/individual/${memberId}/tripartite/read`}
    />
  );
}
