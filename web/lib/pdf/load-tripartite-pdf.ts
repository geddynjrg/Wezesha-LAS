import { prisma } from '@/lib/prisma';
import { isTripartiteFullySigned } from '@/lib/individual-application-access';
import {
  buildTripartiteAgreementPdf,
  tripartitePdfFileName,
} from '@/lib/pdf/tripartite-pdf';
import { normalizeKenyanPhoneForApi, normalizeKenyanPhoneLocal } from '@/lib/phone/kenyan-phone';

export class TripartitePdfError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function loadSignedTripartitePdf(memberId: string) {
  const app = await prisma.individualApplication.findUnique({
    where: { memberId },
    include: {
      member: true,
      signature: true,
      tripartite: true,
    },
  });

  if (!app) {
    throw new TripartitePdfError('Application not found', 404);
  }

  if (!isTripartiteFullySigned(app.tripartite)) {
    throw new TripartitePdfError(
      'The tripartite agreement is not fully signed yet.',
      409,
    );
  }

  const bytes = await buildTripartiteAgreementPdf({
    migrantName: app.tripartite!.migrantName,
    idNumber: app.tripartite!.idNumber,
    passportNumber: app.tripartite!.passportNumber,
    migrantSignature: app.signature?.digitalSignature,
    labourPsSignature: app.tripartite!.labourPsSignature,
    labourPsSignedAt: app.tripartite!.labourPsSignedAt,
    msmePsSignature: app.tripartite!.msmePsSignature,
    msmePsSignedAt: app.tripartite!.msmePsSignedAt,
    acknowledgmentNumber: app.acknowledgmentNumber,
    agreementDate: app.tripartite!.labourPsSignedAt ?? app.tripartite!.msmePsSignedAt,
  });

  return {
    bytes,
    fileName: tripartitePdfFileName(app.acknowledgmentNumber, app.tripartite!.migrantName),
    application: app,
  };
}

function digitsOnly(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

export async function userCanAccessMember(
  userId: string,
  memberId: string,
): Promise<boolean> {
  const [user, member] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, idNumber: true, phoneNumber: true, email: true },
    }),
    prisma.groupMember.findUnique({
      where: { id: memberId },
      include: { application: { select: { userId: true } } },
    }),
  ]);

  if (!user || !member) return false;
  if (member.application.userId === user.id) return true;

  const userIdDigits = digitsOnly(user.idNumber);
  const memberIdDigits = digitsOnly(member.idNo);
  if (userIdDigits && memberIdDigits && userIdDigits === memberIdDigits) {
    return true;
  }

  const userPhone = user.phoneNumber ? normalizeKenyanPhoneLocal(user.phoneNumber) : null;
  const memberPhone = member.mobile ? normalizeKenyanPhoneLocal(member.mobile) : null;
  if (userPhone && memberPhone && userPhone === memberPhone) {
    return true;
  }

  if (
    user.phoneNumber &&
    member.mobile &&
    normalizeKenyanPhoneForApi(user.phoneNumber) === normalizeKenyanPhoneForApi(member.mobile)
  ) {
    return true;
  }

  if (user.email && member.email && user.email.trim().toLowerCase() === member.email.trim().toLowerCase()) {
    return true;
  }

  return false;
}

export function pdfDownloadResponse(bytes: Uint8Array, fileName: string) {
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
