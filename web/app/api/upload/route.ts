import { saveUploadedFile } from '@/lib/upload';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const scope = (formData.get('scope') as 'groups' | 'individuals') ?? 'groups';
    const reference = String(formData.get('reference') ?? 'misc');
    const category = String(formData.get('category') ?? 'individual-document') as Parameters<
      typeof saveUploadedFile
    >[1]['category'];

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const saved = await saveUploadedFile(file, { scope, reference, category });
    return NextResponse.json({ success: true, ...saved });
  } catch (error) {
    console.error('Upload failed', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
