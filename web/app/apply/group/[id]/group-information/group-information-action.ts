'use server';

import { groupInformationSchema } from '@/app/apply/group/[id]/group-information/group-information-schema';
import { updateGroupProgress } from '@/lib/data/applications';
import {
  assertGroupChairAccess,
  assertSessionUserIsMseaChair,
  GroupChairAccessError,
} from '@/lib/group-application-access';
import { lookupMseaBusiness, normalizeMseaRegistrationNumber } from '@/lib/msea';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function saveGroupInformationAction(
  applicationId: string,
  _prev: unknown,
  formData: FormData,
) {
  try {
    await assertGroupChairAccess(applicationId);
  } catch (error) {
    if (error instanceof GroupChairAccessError) {
      return {
        success: false as const,
        errors: { registrationNumber: [error.message] },
        values: Object.fromEntries(formData.entries()),
      };
    }
    throw error;
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = groupInformationSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  const data = parsed.data;
  const registrationNumber = normalizeMseaRegistrationNumber(data.registrationNumber);

  // Enforce MSEA chair identity when registration lookup is available.
  const msea = await lookupMseaBusiness(registrationNumber);
  if (msea?.partners?.length) {
    try {
      await assertSessionUserIsMseaChair(registrationNumber, msea.partners);
    } catch (error) {
      if (error instanceof GroupChairAccessError) {
        return {
          success: false as const,
          errors: { registrationNumber: [error.message] },
          values: raw,
        };
      }
      throw error;
    }

    // Persist partner phones/IDs onto member slots for later individual binding.
    for (const partner of msea.partners) {
      const idNo = (partner.id_number || '').trim();
      const name = (partner.name || '').trim();
      if (!idNo || !name) continue;
      const mobile = (partner.phone_number || '').trim() || 'pending';
      try {
        await prisma.groupMember.upsert({
          where: {
            applicationId_idNo: { applicationId, idNo },
          },
          create: {
            applicationId,
            name,
            idNo,
            mobile,
          },
          update: {
            name,
            ...(mobile !== 'pending' ? { mobile } : {}),
          },
        });
      } catch {
        /* skip bad partner rows */
      }
    }
  }

  await prisma.groupData.upsert({
    where: { applicationId },
    create: {
      applicationId,
      groupName: data.groupName,
      registrationNumber:
        normalizeMseaRegistrationNumber(
          msea?.registration_number || registrationNumber,
        ),
      registrationDate: new Date(data.registrationDate),
      county: '',
      constituency: '',
      ward: '',
    },
    update: {
      groupName: data.groupName,
      registrationNumber:
        normalizeMseaRegistrationNumber(
          msea?.registration_number || registrationNumber,
        ),
      registrationDate: new Date(data.registrationDate),
    },
  });

  await updateGroupProgress(applicationId, 2);
  redirect(`/apply/group/${applicationId}/membership`);
}
