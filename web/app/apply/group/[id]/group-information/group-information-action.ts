'use server';

import { groupInformationSchema } from '@/app/apply/group/[id]/group-information/group-information-schema';
import { updateGroupProgress } from '@/lib/data/applications';
import {
  assertGroupChairAccess,
  assertSessionUserIsMseaChair,
  GroupChairAccessError,
} from '@/lib/group-application-access';
import { lookupMseaBusiness } from '@/lib/msea';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

function buildClusterPayload(data: ReturnType<typeof groupInformationSchema.parse>) {
  const base = {
    clusterCategory: data.clusterCategory,
    clusterCounty: null as string | null,
    clusterConstituency: null as string | null,
    clusterOther: null as string | null,
    destinationRegion: null as string | null,
    destinationCountry: null as string | null,
    agency: null as string | null,
    agentNumber: null as string | null,
    localAgentName: null as string | null,
  };

  switch (data.clusterCategory) {
    case 'geographical':
      return {
        ...base,
        clusterCounty: data.geoLocationType === 'county' ? data.clusterCounty ?? null : null,
        clusterConstituency:
          data.geoLocationType === 'constituency' ? data.clusterConstituency ?? null : null,
      };
    case 'destination':
      return {
        ...base,
        destinationRegion: data.destinationRegion ?? null,
        destinationCountry: data.destinationCountry ?? null,
      };
    case 'agency':
      return {
        ...base,
        agency: data.agency ?? null,
        agentNumber: data.agentNumber ?? null,
        localAgentName: data.localAgentName ?? null,
      };
    case 'other':
      return {
        ...base,
        clusterOther: data.clusterOther ?? null,
      };
    default:
      return base;
  }
}

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

  // Enforce MSEA chair identity when registration lookup is available.
  const msea = await lookupMseaBusiness(data.registrationNumber);
  if (msea?.partners?.length) {
    try {
      await assertSessionUserIsMseaChair(data.registrationNumber, msea.partners);
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

  const clusterPayload = buildClusterPayload(data);

  await prisma.groupData.upsert({
    where: { applicationId },
    create: {
      applicationId,
      groupName: data.groupName,
      registrationNumber: data.registrationNumber,
      registrationDate: new Date(data.registrationDate),
      county: data.county,
      constituency: data.constituency,
      ward: data.ward,
      location: data.location,
      subLocation: data.subLocation,
      ...clusterPayload,
    },
    update: {
      groupName: data.groupName,
      registrationNumber: data.registrationNumber,
      registrationDate: new Date(data.registrationDate),
      county: data.county,
      constituency: data.constituency,
      ward: data.ward,
      location: data.location,
      subLocation: data.subLocation,
      ...clusterPayload,
    },
  });

  await updateGroupProgress(applicationId, 2);
  redirect(`/apply/group/${applicationId}/membership`);
}
