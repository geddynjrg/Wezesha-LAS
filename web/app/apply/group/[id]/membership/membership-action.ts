'use server';

import { assertGroupChairAccess } from '@/lib/group-application-access';
import {
  MAX_GROUP_MEMBERS,
  MIN_GROUP_MEMBERS,
  createMembershipSchema,
  sumMembershipCounts,
} from '@/app/apply/group/[id]/membership/membership-schema';
import { updateGroupProgress } from '@/lib/data/applications';
import { checkMseaReachable, lookupMseaBusiness } from '@/lib/msea';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function saveMembershipAction(
  applicationId: string,
  _prev: unknown,
  formData: FormData,
) {
  await assertGroupChairAccess(applicationId);
  const groupData = await prisma.groupData.findUnique({
    where: { applicationId },
    select: { registrationNumber: true },
  });

  let mseaTarget: number | null = null;

  if (groupData?.registrationNumber) {
    const mseaReachable = await checkMseaReachable();
    if (mseaReachable) {
      const msea = await lookupMseaBusiness(groupData.registrationNumber);
      if (msea && msea.totalMembers >= MIN_GROUP_MEMBERS) {
        mseaTarget = msea.totalMembers;
      }
    }
  }

  const parsed = createMembershipSchema(mseaTarget).safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const enteredTotal = sumMembershipCounts(d);
  const totalMembers = mseaTarget ?? enteredTotal;

  if (totalMembers < MIN_GROUP_MEMBERS) {
    return {
      success: false as const,
      errors: {
        totalFemales: [`Group must have at least ${MIN_GROUP_MEMBERS} members.`],
      },
    };
  }

  if (totalMembers > MAX_GROUP_MEMBERS) {
    return {
      success: false as const,
      errors: {
        totalFemales: [
          `Group must not have more than ${MAX_GROUP_MEMBERS} members for Wezesha Majuu (MSEA shows ${totalMembers}).`,
        ],
      },
    };
  }

  const totalDisabled = d.totalDisabledMales + d.totalDisabledFemales;

  await prisma.groupMembership.upsert({
    where: { applicationId },
    create: {
      applicationId,
      totalMales: d.totalMales,
      totalFemales: d.totalFemales,
      totalDisabledMales: d.totalDisabledMales,
      totalDisabledFemales: d.totalDisabledFemales,
      totalMembers,
      totalDisabled,
    },
    update: {
      totalMales: d.totalMales,
      totalFemales: d.totalFemales,
      totalDisabledMales: d.totalDisabledMales,
      totalDisabledFemales: d.totalDisabledFemales,
      totalMembers,
      totalDisabled,
    },
  });

  await updateGroupProgress(applicationId, 3);
  redirect(`/apply/group/${applicationId}/background`);
}
