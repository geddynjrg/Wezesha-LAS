import { UserRole } from '@/generated/prisma';

export const PS_ROLES: UserRole[] = [UserRole.PS_LABOUR, UserRole.PS_MSME];

export function isPsRole(role: UserRole): boolean {
  return PS_ROLES.includes(role);
}

export function isApplicantRole(role: UserRole): boolean {
  return role === UserRole.APPLICANT;
}

export function psRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.PS_LABOUR:
      return 'Labour & Skills Development';
    case UserRole.PS_MSME:
      return 'MSME Development';
    default:
      return role;
  }
}
