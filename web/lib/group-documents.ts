import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_MEMBER_DOCUMENT_FILES,
} from '@/lib/constants';
import { GROUP_DOCUMENT_CATEGORIES, memberStorageToken } from '@/lib/group-document-categories';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile, type UploadCategory } from '@/lib/upload';

export function getMemberDocumentReference(
  registrationNumber: string,
  memberIdNo: string,
) {
  return `${registrationNumber}/members/${memberIdNo.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
}

export function validateUploadFile(file: File) {
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
    return `"${file.name}" must be JPG, PNG, or PDF`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" exceeds the maximum file size`;
  }

  return null;
}

export async function uploadGroupDocument(options: {
  applicationId: string;
  category: UploadCategory;
  file: File;
  memberId?: string;
}) {
  const application = await prisma.groupApplication.findUnique({
    where: { id: options.applicationId },
    include: { groupData: true, members: true },
  });

  if (!application?.groupData) {
    throw new Error('Complete group information first');
  }

  const fileError = validateUploadFile(options.file);
  if (fileError) {
    throw new Error(fileError);
  }

  let reference = application.groupData.registrationNumber;

  if (options.memberId) {
    const member = application.members.find((entry) => entry.id === options.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    reference = getMemberDocumentReference(
      application.groupData.registrationNumber,
      member.idNo,
    );

    const existingCount = await prisma.applicationDocument.count({
      where: {
        groupApplicationId: options.applicationId,
        category: options.category,
        storagePath: { contains: memberStorageToken(member.idNo) },
      },
    });

    if (existingCount >= MAX_MEMBER_DOCUMENT_FILES) {
      throw new Error(`You can upload at most ${MAX_MEMBER_DOCUMENT_FILES} file(s) for this field`);
    }
  }

  const saved = await saveUploadedFile(options.file, {
    scope: 'groups',
    reference,
    category: options.category,
  });

  const document = await prisma.applicationDocument.create({
    data: {
      groupApplicationId: options.applicationId,
      category: options.category,
      fileName: saved.fileName,
      storagePath: saved.relativePath,
      mimeType: saved.mimeType,
    },
  });

  return {
    id: document.id,
    fileName: document.fileName,
    category: document.category,
    storagePath: document.storagePath,
  };
}

export async function deleteGroupDocument(applicationId: string, documentId: string) {
  const document = await prisma.applicationDocument.findFirst({
    where: {
      id: documentId,
      groupApplicationId: applicationId,
    },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  await prisma.applicationDocument.delete({ where: { id: documentId } });
  return document;
}

export async function validateGroupDocumentsReady(applicationId: string) {
  const application = await prisma.groupApplication.findUnique({
    where: { id: applicationId },
    include: {
      groupData: true,
      members: true,
      documents: true,
    },
  });

  if (!application?.groupData) {
    return { ok: false as const, errors: { form: ['Complete group information first'] } };
  }

  if (application.members.length === 0) {
    return {
      ok: false as const,
      errors: { form: ['Add group members before uploading documents'] },
    };
  }

  return { ok: true as const, application };
}
