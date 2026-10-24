'use server';

import { assertGroupChairAccess } from '@/lib/group-application-access';
import { parseMemberDetailsForm } from '@/app/apply/group/[id]/member-details/member-details-schema';
import { MIN_GROUP_MEMBERS } from '@/lib/constants/group-membership';
import { updateGroupProgress } from '@/lib/data/applications';
import { unplacedJobseekers } from '@/lib/neaims-placement-gate';
import { resolveFormData } from '@/lib/resolve-form-data';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { redirect } from 'next/navigation';

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

function duplicateNationalIdErrors(
  count: number,
  formValues: Record<string, FormDataEntryValue>,
) {
  const seen = new Map<string, number>();
  const errors: Record<string, string[]> = {};

  for (let index = 0; index < count; index++) {
    const idNo = String(formValues[`idNo_${index}`] ?? '').trim();
    if (!idNo) {
      continue;
    }

    const firstIndex = seen.get(idNo);
    if (firstIndex != null) {
      errors[`idNo_${index}`] = ['Each member must have a unique National ID.'];
      errors[`idNo_${firstIndex}`] = ['Each member must have a unique National ID.'];
      continue;
    }

    seen.set(idNo, index);
  }

  return errors;
}

async function persistMembers(
  applicationId: string,
  members: Array<{
    name: string;
    idNo: string;
    mobile: string;
    email: string;
    passportNo: string;
    amount: number;
  }>,
) {
  await prisma.$transaction(async (tx) => {
    await tx.groupMember.deleteMany({ where: { applicationId } });

    for (const member of members) {
      await tx.groupMember.create({
        data: {
          applicationId,
          name: member.name.trim(),
          idNo: member.idNo.trim(),
          mobile: member.mobile.trim(),
          email: member.email?.trim() || null,
          passportNo: member.passportNo?.trim() || null,
          amount: member.amount,
        },
      });
    }
  });
}

export async function saveMemberDetailsAction(
  applicationId: string,
  prevOrFormData: unknown,
  maybeFormData?: FormData,
) {
  await assertGroupChairAccess(applicationId);
  const formData = resolveFormData(prevOrFormData, maybeFormData);
  const formValues = Object.fromEntries(formData.entries());
  const count = Number(formData.get('memberCount') ?? '0');
  const expectedFromForm = Number(formData.get('expectedMemberCount') ?? '0');

  try {
    const membership = await prisma.groupMembership.findUnique({
      where: { applicationId },
      select: { totalMembers: true },
    });

    const expectedCount = Math.max(
      membership?.totalMembers ?? expectedFromForm,
      MIN_GROUP_MEMBERS,
    );

    if (count !== expectedCount) {
      return {
        success: false as const,
        errors: {
          memberCount: [
            `Expected ${expectedCount} member forms based on membership, but received ${count}.`,
          ],
        },
        values: formValues,
      };
    }

    const parsed = parseMemberDetailsForm(formData, count);
    if (!parsed.success) {
      return {
        success: false as const,
        errors: parsed.error.flatten().fieldErrors,
        values: formValues,
      };
    }

    const duplicateErrors = duplicateNationalIdErrors(count, formValues);
    if (Object.keys(duplicateErrors).length > 0) {
      return {
        success: false as const,
        errors: duplicateErrors,
        values: formValues,
      };
    }

    const unplaced = await unplacedJobseekers(
      parsed.data.map((member) => ({
        nationalId: member.idNo,
        name: member.name,
      })),
    );
    if (unplaced.length > 0) {
      const errors: Record<string, string[]> = {};
      for (const miss of unplaced) {
        const index = parsed.data.findIndex(
          (member) => member.idNo.trim() === miss.nationalId,
        );
        const key = index >= 0 ? `idNo_${index}` : 'memberCount';
        errors[key] = [miss.detail];
      }
      return {
        success: false as const,
        errors,
        values: formValues,
        message:
          'A job placement must exist for every job seeker before the group application can continue.',
      };
    }

    await persistMembers(applicationId, parsed.data);
    await updateGroupProgress(applicationId, 5);
    redirect(`/apply/group/${applicationId}/loan-amount`);
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        success: false as const,
        errors: duplicateNationalIdErrors(count, formValues),
        values: formValues,
      };
    }

    console.error('saveMemberDetailsAction failed:', error);

    return {
      success: false as const,
      errors: {
        memberCount: ['Failed to save member details. Please try again.'],
      },
      values: formValues,
    };
  }
}
