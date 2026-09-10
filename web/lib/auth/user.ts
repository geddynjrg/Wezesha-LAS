import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { issueTokensForUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { IdentifierType } from '@/generated/prisma';
import { isPsRole } from '@/lib/auth/roles';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerWithEmail(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      identifierType: IdentifierType.EMAIL,
    },
  });

  return issueTokensForUser(user.id);
}

export async function loginWithEmail(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user?.passwordHash || isPsRole(user.role)) {
    throw new Error('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  return issueTokensForUser(user.id);
}

/**
 * Option A upsert: sign in if account exists; otherwise create email+password
 * (optionally linking phone) on first login.
 */
export async function upsertLoginWithEmailPhone(input: {
  email: string;
  password: string;
  phone?: string;
  createIfMissing?: boolean;
  forceUpdatePassword?: boolean;
}) {
  const email = normalizeEmail(input.email);
  const phone = String(input.phone || '').trim() || undefined;
  let user = await prisma.user.findUnique({ where: { email } });
  let created = false;

  if (!user) {
    if (input.createIfMissing === false) {
      throw new Error('Invalid email or password');
    }
    const passwordHash = await hashPassword(input.password);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        phoneNumber: phone,
        identifierType: IdentifierType.EMAIL,
      },
    });
    created = true;
  } else {
    if (isPsRole(user.role)) {
      throw new Error('Invalid email or password');
    }
    if (user.passwordHash && !input.forceUpdatePassword) {
      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new Error('Invalid email or password');
      }
    } else {
      const passwordHash = await hashPassword(input.password);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          ...(phone ? { phoneNumber: phone } : {}),
        },
      });
    }
    if (phone && phone !== user.phoneNumber) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneNumber: phone },
      });
    }
  }

  return {
    created,
    tokens: await issueTokensForUser(user.id),
  };
}

export async function loginPsWithEmail(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });
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

export async function changePsPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, role: true },
  });

  if (!user?.passwordHash || !isPsRole(user.role)) {
    throw new Error('Unable to change password');
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error('Current password is incorrect');
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
