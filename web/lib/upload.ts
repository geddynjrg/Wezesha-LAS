import fs from 'fs/promises';
import path from 'path';

const UPLOAD_ROOT =
  process.env.UPLOAD_ROOT ?? path.join(process.cwd(), '../../storage/uploads');

export type UploadCategory =
  | 'group-certificate'
  | 'group-kra'
  | 'group-bank-template'
  | 'expression-of-interest'
  | 'member-id'
  | 'member-passport'
  | 'member-kra'
  | 'individual-document';

export async function saveUploadedFile(
  file: File,
  options: {
    scope: 'groups' | 'individuals';
    reference: string;
    category: UploadCategory;
  },
) {
  const safeReference = options.reference.replace(/[^a-zA-Z0-9-_]/g, '_');
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const directory = path.join(
    UPLOAD_ROOT,
    options.scope,
    safeReference,
    options.category,
  );

  await fs.mkdir(directory, { recursive: true });

  const fileName = `${timestamp}-${safeName}`;
  const storagePath = path.join(directory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(storagePath, buffer);

  return {
    fileName,
    storagePath,
    relativePath: path.relative(UPLOAD_ROOT, storagePath),
    mimeType: file.type || 'application/octet-stream',
  };
}

export function getUploadRoot() {
  return UPLOAD_ROOT;
}
