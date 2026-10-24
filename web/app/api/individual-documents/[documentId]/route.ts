import { deletePassportBiodata } from '@/lib/individual-documents';
import { IndividualApplicantAccessError } from '@/lib/individual-application-access';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await params;
    const memberId = new URL(request.url).searchParams.get('memberId') ?? '';
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    await deletePassportBiodata(memberId, documentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof IndividualApplicantAccessError ? 403 : 400;
    const message = error instanceof Error ? error.message : 'Delete failed';
    console.error('Passport biodata delete failed:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
