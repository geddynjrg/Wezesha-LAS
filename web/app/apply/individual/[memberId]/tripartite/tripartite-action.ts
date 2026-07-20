'use server';
import { submitIndividualApplication } from '@/lib/data/applications';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';
const schema = z.object({ tripartiteAccepted: z.literal('on') });
export async function submitTripartiteAction(memberId: string, _prev: unknown, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false as const, errors: { tripartiteAccepted: ['Required'] } };
  const app = await prisma.individualApplication.findUniqueOrThrow({ where: { memberId } });
  await submitIndividualApplication(app.id);
  redirect(`/apply/individual/${memberId}/complete`);
}
