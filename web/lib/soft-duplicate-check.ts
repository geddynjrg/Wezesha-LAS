import { prisma } from '@/lib/prisma';

export type SoftDuplicateResult = {
  phoneDuplicate: boolean;
  nationalIdDuplicate: boolean;
  message: string;
};

const IN_PROGRESS_STATUSES = [
  'DRAFT',
  'GROUP_SUBMITTED',
  'INDIVIDUAL_IN_PROGRESS',
  'SUBMITTED',
] as const;

function normalizePhone(value: string): string {
  return value.replace(/\D+/g, '');
}

function normalizeId(value: string): string {
  return value.replace(/\D+/g, '');
}

/**
 * Soft check for phone / National ID already used on another in-progress application.
 * Returns flags only — never other applicants' PII.
 */
export async function checkSoftDuplicates(input: {
  phone?: string | null;
  nationalId?: string | null;
  excludeApplicationId?: string | null;
  excludeMemberId?: string | null;
}): Promise<SoftDuplicateResult> {
  const phone = normalizePhone(input.phone ?? '');
  const nationalId = normalizeId(input.nationalId ?? '');

  let phoneDuplicate = false;
  let nationalIdDuplicate = false;

  if (phone.length >= 9 || nationalId.length >= 5) {
    const members = await prisma.groupMember.findMany({
      where: {
        AND: [
          input.excludeApplicationId
            ? { applicationId: { not: input.excludeApplicationId } }
            : {},
          input.excludeMemberId ? { id: { not: input.excludeMemberId } } : {},
          {
            application: {
              status: { in: [...IN_PROGRESS_STATUSES] },
            },
          },
          {
            OR: [
              phone.length >= 9 ? { mobile: { contains: phone.slice(-9) } } : undefined,
              nationalId.length >= 5 ? { idNo: nationalId } : undefined,
            ].filter(Boolean) as Array<{ mobile?: { contains: string }; idNo?: string }>,
          },
        ],
      },
      select: {
        idNo: true,
        mobile: true,
      },
      take: 50,
    });

    for (const member of members) {
      if (nationalId && normalizeId(member.idNo) === nationalId) {
        nationalIdDuplicate = true;
      }
      if (phone && normalizePhone(member.mobile).endsWith(phone.slice(-9))) {
        phoneDuplicate = true;
      }
    }
  }

  let message = '';
  if (phoneDuplicate && nationalIdDuplicate) {
    message =
      'This phone number and National ID appear on another in-progress application. You may continue if this is intentional — please confirm below.';
  } else if (phoneDuplicate) {
    message =
      'This phone number appears on another in-progress application. You may continue if this is intentional — please confirm below.';
  } else if (nationalIdDuplicate) {
    message =
      'This National ID appears on another in-progress application. You may continue if this is intentional — please confirm below.';
  }

  return { phoneDuplicate, nationalIdDuplicate, message };
}
