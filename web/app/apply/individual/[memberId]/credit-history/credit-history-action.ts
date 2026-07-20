'use server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
export async function saveStepAction(memberId: string, _prev: unknown, formData: FormData) {
  const app = await prisma.individualApplication.findUniqueOrThrow({ where: { memberId } });
  await prisma.individualApplication.update({ where: { id: app.id }, data: { progress: 7 } });
  redirect(`/apply/individual/${memberId}/signature`);
}
