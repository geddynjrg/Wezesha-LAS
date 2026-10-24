import type { MseaPartner } from '@/lib/msea';
import {
  emptyClientMemberRow,
  toClientMemberRow,
  type ClientMemberRow,
} from '@/lib/serialize-for-client';

export type MemberSlot = ClientMemberRow;

export function resolveMemberSlotCount(membershipTotal?: number | null): number {
  return Math.max(membershipTotal ?? 0, 0);
}

export function buildMemberSlots(
  totalMembers: number,
  savedMembers: Array<{
    name?: string | null;
    idNo?: string | null;
    mobile?: string | null;
    email?: string | null;
    passportNo?: string | null;
    amount?: unknown;
  }>,
  mseaPartners?: MseaPartner[],
): MemberSlot[] {
  const slots: MemberSlot[] = [];

  for (let index = 0; index < totalMembers; index++) {
    const saved = savedMembers[index];
    const partner = mseaPartners?.[index];

    if (saved?.name || saved?.idNo || saved?.mobile) {
      slots.push(toClientMemberRow(saved));
      continue;
    }

    if (partner) {
      slots.push({
        ...emptyClientMemberRow(),
        name: partner.name ?? '',
        idNo: partner.id_number ?? '',
        mobile: partner.phone_number ?? '',
      });
      continue;
    }

    slots.push(emptyClientMemberRow());
  }

  return slots;
}
