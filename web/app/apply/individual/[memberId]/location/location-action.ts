'use server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';
const schema = z.object({ county: z.string().min(1), constituency: z.string().min(1), ward: z.string().min(1), location: z.string().optional(), subLocation: z.string().optional() });
export async function saveLocationAction(memberId: string, _prev: unknown, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  const app = await prisma.individualApplication.findUniqueOrThrow({ where: { memberId } });
  await prisma.locationData.upsert({ where: { applicationId: app.id }, create: { applicationId: app.id, ...parsed.data }, update: parsed.data });
  await prisma.individualApplication.update({ where: { id: app.id }, data: { progress: 3 } });
  redirect(`/apply/individual/${memberId}/next-of-kin`);
}
