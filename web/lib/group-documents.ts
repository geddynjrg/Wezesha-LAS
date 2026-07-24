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

  const errors: Record<string, string[]> = {};
  const documents = application.documents;

  function countDocs(category: UploadCategory, memberIdNo?: string) {
    return documents.filter((document) => {
      if (document.category !== category) {
        return false;
      }

      if (!memberIdNo) {
        return true;
      }

      return document.storagePath.includes(memberStorageToken(memberIdNo));
    }).length;
  }

  if (countDocs(GROUP_DOCUMENT_CATEGORIES.kraPin) < 1) {
    errors.kraPin = ['Group KRA PIN Certificate is required'];
  }

  if (countDocs(GROUP_DOCUMENT_CATEGORIES.registrationCert) < 1) {
    errors.registrationCert = ['Registration Certificate is required'];
  }

  if (countDocs(GROUP_DOCUMENT_CATEGORIES.expressionOfInterest) < 1) {
    errors.expressionOfInterest = ['Expression of Interest document is required'];
  }

  for (const member of application.members) {
    const idKey = `memberId_${member.id}`;
    const passportKey = `memberPassport_${member.id}`;
    const pinKey = `memberPin_${member.id}`;

    if (countDocs(GROUP_DOCUMENT_CATEGORIES.memberId, member.idNo) < 1) {
      errors[idKey] = [`National ID for ${member.name} is required`];
    }

    if (countDocs(GROUP_DOCUMENT_CATEGORIES.memberPassport, member.idNo) < 1) {
      errors[passportKey] = [`Passport for ${member.name} is required`];
    }

    if (countDocs(GROUP_DOCUMENT_CATEGORIES.memberPin, member.idNo) < 1) {
      errors[pinKey] = [`KRA PIN Certificate for ${member.name} is required`];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false as const, errors };
  }

  return { ok: true as const, application };
}
