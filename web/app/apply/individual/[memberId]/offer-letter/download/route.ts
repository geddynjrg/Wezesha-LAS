import { getSessionUserId } from '@/lib/auth/session';
import {
  assertIndividualApplicantAccess,
  IndividualApplicantAccessError,
} from '@/lib/individual-application-access';
import { loadSignedOfferLetterPdf, OfferLetterPdfError } from '@/lib/pdf/load-offer-letter-pdf';
import { pdfDownloadResponse } from '@/lib/pdf/load-tripartite-pdf';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const { memberId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=/apply/individual/${memberId}/offer-letter/download`, request.url),
    );
  }

  try {
    await assertIndividualApplicantAccess(memberId);
  } catch (error) {
    if (error instanceof IndividualApplicantAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  try {
    const { bytes, fileName } = await loadSignedOfferLetterPdf(memberId);
    return pdfDownloadResponse(bytes, fileName);
  } catch (error) {
    if (error instanceof OfferLetterPdfError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
