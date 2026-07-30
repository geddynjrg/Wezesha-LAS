import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { issueTokensForUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { IdentifierType } from '@/generated/prisma';
import { isPsRole } from '@/lib/auth/roles';

export async function registerWithEmail(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      identifierType: IdentifierType.EMAIL,
    },
  });

  return issueTokensForUser(user.id);
}

export async function loginWithEmail(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || isPsRole(user.role)) {
    throw new Error('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  return issueTokensForUser(user.id);
}

export async function loginPsWithEmail(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !isPsRole(user.role)) {
    throw new Error('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  return issueTokensForUser(user.id);
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      name: true,
      identifierType: true,
      role: true,
    },
  });
}
