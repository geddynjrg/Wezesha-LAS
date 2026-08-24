'use server';

import { psSignSchema } from '@/app/ps/sign-in/ps-login-schema';
import { UserRole } from '@/generated/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { getPsSigningPendingApplications } from '@/lib/data/ps-signing-applications';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function psSigningBatchAction(_prev: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const user = await getSessionUser();
  if (!user || !isPsRole(user.role)) {
    return {
      success: false as const,
      errors: {},
      message: 'Unauthorized',
      values: raw,
    };
  }

  if (user.role !== UserRole.PS_MSME) {
    return {
      success: false as const,
      errors: {},
      message: 'Batch signing is only available for MSME Principal Secretary',
      values: raw,
    };
  }

  const parsed = psSignSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  const pendingApplications = await getPsSigningPendingApplications(user.role);

  if (pendingApplications.length === 0) {
    return {
      success: false as const,
      errors: {},
      message: 'No pending agreements to sign',
      values: raw,
    };
  }

  const now = new Date();
  const signatureData = parsed.data.digitalSignature;
  const applicationIds = pendingApplications.map((application) => application.id);

  await prisma.$transaction(
    applicationIds.map((applicationId) =>
      prisma.tripartiteData.update({
        where: { applicationId },
        data: {
          msmePsSignature: signatureData,
          msmePsSignedAt: now,
          msmePsSignedBy: user.id,
        },
      }),
    ),
  );

  revalidatePath('/ps/signing');
  for (const applicationId of applicationIds) {
    revalidatePath(`/ps/signing/applications/${applicationId}`);
  }

  redirect('/ps/signing?view=signed');
}
