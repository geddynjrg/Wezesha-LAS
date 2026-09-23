import {
  findMseaChairPartners,
  isMseaChairPartner,
  lookupMseaBusiness,
  type MseaPartner,
} from '@/lib/msea';
import { loadSessionApplicantIdentity } from '@/lib/data/applications';
import { getSessionUserId } from '@/lib/auth/session';
import {
  normalizeKenyanPhoneForApi,
  normalizeKenyanPhoneLocal,
} from '@/lib/phone/kenyan-phone';
import { prisma } from '@/lib/prisma';

function digitsOnly(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

export class GroupChairAccessError extends Error {
  readonly code: 'unauthenticated' | 'forbidden' | 'not-found' | 'not-chair';

  constructor(code: GroupChairAccessError['code'], message: string) {
    super(message);
    this.name = 'GroupChairAccessError';
    this.code = code;
  }
}

/** Only the signed-in owner (group chair) may open/edit a group application. */
export async function assertGroupChairAccess(applicationId: string) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new GroupChairAccessError('unauthenticated', 'Authentication required');
  }

  const app = await prisma.groupApplication.findUnique({
    where: { id: applicationId },
    select: { id: true, userId: true },
  });

  if (!app) {
    throw new GroupChairAccessError('not-found', 'Application not found');
  }

  if (!app.userId || app.userId !== userId) {
    throw new GroupChairAccessError(
      'forbidden',
      'Only the group chair who started this application can continue it. Members should use individual applications.',
    );
  }

  return { userId, app };
}

function identityMatchesPartner(
  user: { idNumber: string | null; phoneNumber: string | null },
  partner: MseaPartner,
): boolean {
  const userIdDigits = digitsOnly(user.idNumber);
  const partnerIdDigits = digitsOnly(partner.id_number);
  if (userIdDigits && partnerIdDigits && userIdDigits === partnerIdDigits) {
    return true;
  }

  const userPhone = user.phoneNumber
    ? normalizeKenyanPhoneLocal(user.phoneNumber)
    : null;
  const partnerPhone = partner.phone_number
    ? normalizeKenyanPhoneLocal(partner.phone_number)
    : null;
  if (userPhone && partnerPhone && userPhone === partnerPhone) return true;

  if (
    user.phoneNumber &&
    partner.phone_number &&
    normalizeKenyanPhoneForApi(user.phoneNumber) ===
      normalizeKenyanPhoneForApi(partner.phone_number)
  ) {
    return true;
  }

  return false;
}

/**
 * After MSEA lookup, ensure the signed-in person is the group chair returned
 * in the partners JSON (type chair/official) — not an ordinary member.
 */
export async function assertSessionUserIsMseaChair(
  registrationNumber: string,
  partners?: MseaPartner[],
) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new GroupChairAccessError('unauthenticated', 'Authentication required');
  }

  const user = await loadSessionApplicantIdentity(userId);
  if (!user) {
    throw new GroupChairAccessError('unauthenticated', 'Authentication required');
  }

  let resolvedPartners = partners;
  if (!resolvedPartners) {
    const record = await lookupMseaBusiness(registrationNumber);
    resolvedPartners = record?.partners ?? [];
  }

  const chairs = findMseaChairPartners(resolvedPartners);
  if (chairs.length === 0) {
    // No explicit chair type in payload — require national ID or phone match to
    // at least one partner so random accounts cannot claim the group.
    const matchedPartner = resolvedPartners.find((p) => identityMatchesPartner(user, p));
    if (!matchedPartner && resolvedPartners.length > 0) {
      throw new GroupChairAccessError(
        'not-chair',
        'Your national ID or phone does not match any partner on this MSEA registration. Only the group chair can start the group application.',
      );
    }
    return {
      userId,
      user,
      chairs: matchedPartner ? [matchedPartner] : [],
      matched: matchedPartner,
    };
  }

  const matched = chairs.find((chair) => identityMatchesPartner(user, chair));
  if (!matched) {
    throw new GroupChairAccessError(
      'not-chair',
      'Only the group chair listed on the MSEA registration can log in and complete the group application on behalf of members.',
    );
  }

  return { userId, user, chairs, matched };
}

export { isMseaChairPartner };
