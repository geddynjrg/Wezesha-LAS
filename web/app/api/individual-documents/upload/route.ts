import { uploadPassportBiodata } from '@/lib/individual-documents';
import { IndividualApplicantAccessError } from '@/lib/individual-application-access';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const memberId = String(formData.get('memberId') ?? '');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const document = await uploadPassportBiodata(memberId, file);
    return NextResponse.json({ success: true, document });
  } catch (error) {
    const status = error instanceof IndividualApplicantAccessError ? 403 : 400;
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('Passport biodata upload failed:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
