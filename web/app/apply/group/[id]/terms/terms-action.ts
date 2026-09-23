'use server';

import { assertGroupChairAccess } from '@/lib/group-application-access';
import { updateGroupProgress } from '@/lib/data/applications';
import { resolveFormData } from '@/lib/resolve-form-data';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({ termsAccepted: z.literal('on') });

export async function saveTermsAction(
  applicationId: string,
  prevOrFormData: unknown,
  maybeFormData?: FormData,
) {
  await assertGroupChairAccess(applicationId);
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false as const, errors: { termsAccepted: ['You must accept the terms'] } };
  }

  await prisma.groupApplication.update({
    where: { id: applicationId },
    data: { termsAccepted: true },
  });

  await updateGroupProgress(applicationId, 7);
  redirect(`/apply/group/${applicationId}/bank`);
}
