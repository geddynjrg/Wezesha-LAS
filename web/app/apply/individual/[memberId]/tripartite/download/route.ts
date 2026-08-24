import { getSessionUserId } from '@/lib/auth/session';
import {
  loadSignedTripartitePdf,
  pdfDownloadResponse,
  TripartitePdfError,
} from '@/lib/pdf/load-tripartite-pdf';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const { memberId } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=/apply/individual/${memberId}/tripartite/download`, request.url),
    );
  }

  try {
    const { bytes, fileName } = await loadSignedTripartitePdf(memberId);
    return pdfDownloadResponse(bytes, fileName);
  } catch (error) {
    if (error instanceof TripartitePdfError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
