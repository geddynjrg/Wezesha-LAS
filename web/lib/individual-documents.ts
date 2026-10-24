import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { assertIndividualEditable } from '@/lib/individual-application-access';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';

export const PASSPORT_BIODATA_CATEGORY = 'passport-biodata';

export async function uploadPassportBiodata(memberId: string, file: File) {
  const app = await assertIndividualEditable(memberId);

  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
    throw new Error('Passport biodata page must be JPG, PNG, or PDF');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Passport biodata page exceeds the maximum file size');
  }

  const saved = await saveUploadedFile(file, {
    scope: 'individuals',
    reference: app.acknowledgmentNumber || memberId,
    category: PASSPORT_BIODATA_CATEGORY,
  });

  await prisma.applicationDocument.deleteMany({
    where: {
      individualApplicationId: app.id,
      category: PASSPORT_BIODATA_CATEGORY,
    },
  });

  const document = await prisma.applicationDocument.create({
    data: {
      individualApplicationId: app.id,
      category: PASSPORT_BIODATA_CATEGORY,
      fileName: saved.fileName,
      storagePath: saved.relativePath,
      mimeType: saved.mimeType,
    },
  });

  return {
    id: document.id,
    fileName: document.fileName,
    category: document.category,
  };
}

export async function deletePassportBiodata(memberId: string, documentId: string) {
  const app = await assertIndividualEditable(memberId);
  const document = await prisma.applicationDocument.findFirst({
    where: {
      id: documentId,
      individualApplicationId: app.id,
      category: PASSPORT_BIODATA_CATEGORY,
    },
  });
  if (!document) {
    throw new Error('Document not found');
  }
  await prisma.applicationDocument.delete({ where: { id: document.id } });
}
