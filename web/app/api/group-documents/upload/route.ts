import { uploadGroupDocument } from '@/lib/group-documents';
import { type UploadCategory } from '@/lib/upload';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const applicationId = String(formData.get('applicationId') ?? '');
    const category = String(formData.get('category') ?? '') as UploadCategory;
    const memberId = formData.get('memberId') ? String(formData.get('memberId')) : undefined;

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Document category is required' }, { status: 400 });
    }

    const saved = await uploadGroupDocument({
      applicationId,
      category,
      file,
      memberId,
    });

    return NextResponse.json({ success: true, document: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('Group document upload failed:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
