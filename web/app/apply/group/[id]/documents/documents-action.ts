'use server';

import { submitGroupApplication } from '@/lib/data/applications';
import { validateGroupDocumentsReady } from '@/lib/group-documents';
import { resolveFormData } from '@/lib/resolve-form-data';
import { redirect } from 'next/navigation';

export async function submitDocumentsAction(
  applicationId: string,
  prevOrFormData: unknown,
  maybeFormData?: FormData,
) {
  resolveFormData(prevOrFormData, maybeFormData);

  const validation = await validateGroupDocumentsReady(applicationId);

  if (!validation.ok) {
    return { success: false as const, errors: validation.errors };
  }

  await submitGroupApplication(applicationId);
  redirect(`/apply/group/${applicationId}/complete`);
}
