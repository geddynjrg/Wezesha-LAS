import { prisma } from '@/lib/prisma';
import { formatKes, offerBreakdown } from '@/lib/offer-letter';
import { buildOfferLetterPdf, offerLetterPdfFileName } from '@/lib/pdf/offer-letter-pdf';

export class OfferLetterPdfError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function loadSignedOfferLetterPdf(memberId: string) {
  const app = await prisma.individualApplication.findUnique({
    where: { memberId },
    include: {
      member: { include: { application: { include: { groupData: true } } } },
    },
  });

  if (!app) {
    throw new OfferLetterPdfError('Application not found', 404);
  }
  if (!app.offerLetterSignedAt || !app.offerLetterSignature) {
    throw new OfferLetterPdfError('The offer letter has not been signed yet.', 409);
  }

  const breakdown = offerBreakdown(app);
  const bytes = await buildOfferLetterPdf({
    applicantName: app.member.name,
    idNumber: app.member.idNo,
    groupName: app.member.application.groupData?.groupName || 'Wezesha Majuu group',
    acknowledgmentNumber: app.member.application.acknowledgmentNumber,
    amountToPay: formatKes(breakdown.total),
    airTicket: formatKes(breakdown.airTicket),
    visaApplication: formatKes(breakdown.visaApplication),
    upkeepTrade: formatKes(breakdown.upkeepTrade),
    signature: app.offerLetterSignature,
    signedAt: app.offerLetterSignedAt,
  });

  return {
    bytes,
    fileName: offerLetterPdfFileName(
      app.member.application.acknowledgmentNumber,
      app.member.name,
    ),
  };
}
