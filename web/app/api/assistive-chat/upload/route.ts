import {
  formatAuthenticityReply,
  validateDocumentBuffer,
  type DocDeclaredType,
} from '@/lib/document-authenticity';
import { getSessionUserId } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TYPE_MAP: Record<string, DocDeclaredType> = {
  id: 'national_id',
  national_id: 'national_id',
  'national-id': 'national_id',
  kra: 'kra_pin',
  kra_pin: 'kra_pin',
  'kra-pin': 'kra_pin',
  passport: 'passport',
};

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'Please sign in through the assistant first.' },
      { status: 401 },
    );
  }

  const form = await request.formData();
  const file = form.get('file');
  const declaredRaw = String(form.get('declaredType') || 'other').toLowerCase();
  const declaredType: DocDeclaredType = TYPE_MAP[declaredRaw] || 'other';

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await validateDocumentBuffer({
    buffer,
    mimeType: file.type || 'application/octet-stream',
    fileName: file.name,
    declaredType,
  });

  // Intentionally do not persist file from chat unless clearly needed —
  // guide user to apply wizard for official storage.
  return NextResponse.json({
    ok: true,
    result,
    reply: formatAuthenticityReply(result),
    nextHint:
      'Continue the official upload on your apply Documents step so officers receive the file in the application record. ' +
      (declaredType === 'national_id'
        ? 'Open /apply (group documents or individual steps) and upload National ID there.'
        : declaredType === 'kra_pin'
          ? 'Upload KRA PIN on the Documents step of your application.'
          : 'Upload passport on the Documents step of your application.'),
  });
}
