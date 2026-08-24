'use server';
import { updateGroupProgress } from '@/lib/data/applications';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';
const schema = z.object({ purpose: z.string().min(10), proposedActivities: z.string().min(10) });
export async function saveBackgroundAction(applicationId: string, _prev: unknown, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  await prisma.groupBackground.upsert({
    where: { applicationId },
    create: { applicationId, ...parsed.data },
    update: parsed.data,
  });
  await updateGroupProgress(applicationId, 4);
  redirect(`/apply/group/${applicationId}/member-details`);
}
