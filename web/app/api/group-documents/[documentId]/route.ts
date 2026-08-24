import { deleteGroupDocument } from '@/lib/group-documents';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await params;
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    await deleteGroupDocument(applicationId, documentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    console.error('Group document delete failed:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
