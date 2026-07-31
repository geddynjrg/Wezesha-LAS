'use server';

import { psSignSchema } from '@/app/ps/sign-in/ps-login-schema';
import { UserRole } from '@/generated/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import { prisma } from '@/lib/prisma';
import { canPsSignTripartite } from '@/lib/tripartite/ps-signing-workflow';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function psSigningTripartiteAction(
  applicationId: string,
  _prev: unknown,
  formData: FormData,
) {
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

  const parsed = psSignSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  const application = await prisma.individualApplication.findUnique({
    where: { id: applicationId },
    include: { tripartite: true },
  });

  if (!application?.tripartite || !application.tripartiteAccepted) {
    return {
      success: false as const,
      errors: {},
      message: 'Tripartite agreement is not available for signing',
      values: raw,
    };
  }

  const signEligibility = canPsSignTripartite(user.role, application.tripartite);
  if (!signEligibility.allowed) {
    return {
      success: false as const,
      errors: {},
      message: signEligibility.reason ?? 'You cannot sign this agreement',
      values: raw,
    };
  }

  const now = new Date();
  const signatureData = parsed.data.digitalSignature;

  if (user.role === UserRole.PS_LABOUR) {
    await prisma.tripartiteData.update({
      where: { applicationId },
      data: {
        labourPsSignature: signatureData,
        labourPsSignedAt: now,
        labourPsSignedBy: user.id,
      },
    });
  } else if (user.role === UserRole.PS_MSME) {
    await prisma.tripartiteData.update({
      where: { applicationId },
      data: {
        msmePsSignature: signatureData,
        msmePsSignedAt: now,
        msmePsSignedBy: user.id,
      },
    });
  }

  revalidatePath('/ps/signing');
  revalidatePath(`/ps/signing/applications/${applicationId}`);
  redirect('/ps/signing');
}
