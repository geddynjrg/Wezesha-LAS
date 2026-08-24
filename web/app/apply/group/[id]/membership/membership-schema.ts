import { MIN_GROUP_MEMBERS } from '@/lib/constants/group-membership';
import { z } from 'zod';

export { MIN_GROUP_MEMBERS };

export interface MembershipCounts {
  totalMales: number;
  totalFemales: number;
  totalDisabledMales: number;
  totalDisabledFemales: number;
}

export function sumMembershipCounts(data: MembershipCounts): number {
  return (
    data.totalMales +
    data.totalFemales +
    data.totalDisabledMales +
    data.totalDisabledFemales
  );
}

export function createMembershipSchema(mseaTarget?: number | null) {
  return z
    .object({
      totalMales: z.coerce.number().min(0),
      totalFemales: z.coerce.number().min(0),
      totalDisabledMales: z.coerce.number().min(0),
      totalDisabledFemales: z.coerce.number().min(0),
    })
    .superRefine((data, ctx) => {
      const enteredTotal = sumMembershipCounts(data);

      if (mseaTarget != null && mseaTarget >= MIN_GROUP_MEMBERS) {
        if (enteredTotal !== mseaTarget) {
          ctx.addIssue({
            code: 'custom',
            message: `Males, females, and PWD counts must add up to ${mseaTarget} registered members.`,
            path: ['totalFemales'],
          });
        }
        return;
      }

      if (enteredTotal < MIN_GROUP_MEMBERS) {
        ctx.addIssue({
          code: 'custom',
          message: `Group must have at least ${MIN_GROUP_MEMBERS} members.`,
          path: ['totalFemales'],
        });
      }
    });
}

export const membershipSchema = createMembershipSchema();
