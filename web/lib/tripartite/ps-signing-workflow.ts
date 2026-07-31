import { UserRole } from '@/generated/prisma';

export function canPsSignTripartite(
  psRole: UserRole,
  tripartite: {
    msmePsSignature: string | null;
    labourPsSignature: string | null;
  },
): { allowed: boolean; reason?: string } {
  if (psRole === UserRole.PS_MSME) {
    if (tripartite.msmePsSignature) {
      return { allowed: false, reason: 'MSME PS signature has already been recorded' };
    }
    return { allowed: true };
  }

  if (psRole === UserRole.PS_LABOUR) {
    if (tripartite.labourPsSignature) {
      return { allowed: false, reason: 'Labour PS signature has already been recorded' };
    }
    if (!tripartite.msmePsSignature) {
      return {
        allowed: false,
        reason:
          'The MSME Principal Secretary must sign this agreement first. It will be forwarded to Labour PS for signature once MSME signing is complete.',
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unauthorized' };
}

export function hasPsSigned(
  psRole: UserRole,
  tripartite: {
    msmePsSignature: string | null;
    labourPsSignature: string | null;
  },
): boolean {
  if (psRole === UserRole.PS_MSME) {
    return Boolean(tripartite.msmePsSignature);
  }
  if (psRole === UserRole.PS_LABOUR) {
    return Boolean(tripartite.labourPsSignature);
  }
  return false;
}
