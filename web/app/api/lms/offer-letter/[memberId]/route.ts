import { isLmsSyncRequest } from '@/lib/lms-auth';
import { loadSignedOfferLetterPdf, OfferLetterPdfError } from '@/lib/pdf/load-offer-letter-pdf';
import { pdfDownloadResponse } from '@/lib/pdf/load-tripartite-pdf';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  if (!isLmsSyncRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { memberId } = await params;
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
