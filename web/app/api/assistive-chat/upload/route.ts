import {
  formatAuthenticityReply,
  validateDocumentBuffer,
  type DocDeclaredType,
} from '@/lib/document-authenticity';
import { getSessionUserId } from '@/lib/auth/session';
import { uploadGroupDocument } from '@/lib/group-documents';
import { type UploadCategory } from '@/lib/upload';
import { getUserGroupApplications } from '@/lib/data/applications';
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

const CATEGORY_TO_DECLARED: Record<string, DocDeclaredType> = {
  'group-certificate': 'other',
  'group-kra': 'kra_pin',
  'group-bank-template': 'other',
  'expression-of-interest': 'other',
  'member-id': 'national_id',
  'member-passport': 'passport',
  'member-kra': 'kra_pin',
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
  const applicationId = String(form.get('applicationId') || '');
  const category = String(form.get('category') || '') as UploadCategory;
  const persist = String(form.get('persist') || '') === '1';
  const ocrPassed = String(form.get('ocrPassed') || '') === '1';
  const ocrConfidence = Number(form.get('ocrConfidence') || 0);
  const memberId = form.get('memberId')
    ? String(form.get('memberId'))
    : undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 });
  }

  const declaredType: DocDeclaredType =
    TYPE_MAP[declaredRaw] ||
    CATEGORY_TO_DECLARED[category] ||
    'other';

  const isImage = (file.type || '').startsWith('image/');
  const needsOcrGate =
    isImage &&
    (declaredType === 'national_id' ||
      declaredType === 'kra_pin' ||
      declaredType === 'passport' ||
      category === 'member-id' ||
      category === 'member-passport' ||
      category === 'member-kra' ||
      category === 'group-kra');

  // Gate image uploads for known ID/doc types behind client OCR pass.
  if (needsOcrGate && (!ocrPassed || ocrConfidence < 0.5)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Capture rejected: scan the document in chat until OCR confidence is high enough, then Capture.',
      },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await validateDocumentBuffer({
    buffer,
    mimeType: file.type || 'application/octet-stream',
    fileName: file.name,
    declaredType,
  });

  const authenticity = formatAuthenticityReply(result);

  if (persist && applicationId && category) {
    const owned = await getUserGroupApplications(userId);
    if (!owned.some((g) => g.id === applicationId)) {
      return NextResponse.json(
        { ok: false, error: 'That application is not on your account.' },
        { status: 403 },
      );
    }
    try {
      const saved = await uploadGroupDocument({
        applicationId,
        category,
        file,
        memberId,
      });
      return NextResponse.json({
        ok: true,
        result,
        persisted: true,
        document: saved,
        reply: `${authenticity}\nSaved to application as ${category}.`,
        nextHint: 'Pick another field or stage to continue editing in chat.',
        phase: 'field_pick',
      });
    } catch (err) {
      return NextResponse.json({
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Could not save the document to the application.',
        reply: authenticity,
      }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    result,
    reply: authenticity,
    nextHint:
      'Continue the official upload on your apply Documents step so officers receive the file in the application record, or select a document field in chat to save it to an application.',
  });
}
