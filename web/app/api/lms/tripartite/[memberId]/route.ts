import { isLmsSyncRequest } from '@/lib/lms-auth';
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
  if (!isLmsSyncRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { memberId } = await params;

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
