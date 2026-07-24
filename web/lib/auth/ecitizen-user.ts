import { prisma } from '@/lib/prisma';
import { normalizeKenyanPhoneForApi } from '@/lib/phone/kenyan-phone';
import { IdentifierType, type User } from '@/generated/prisma';

export type EcitizenProfile = {
  email?: string | null;
  name?: string | null;
  mobileNumber?: string | null;
  idNumber?: string | null;
  kraPin?: string | null;
  ecitizenId?: string | null;
};

export function normalizeEcitizenPhone(
  value?: string | null,
): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = normalizeKenyanPhoneForApi(value);
  return normalized || undefined;
}

async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

async function findUserByIdNumber(idNumber: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { idNumber } });
}

async function findUserByEcitizenId(ecitizenId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { ecitizenId } });
}

async function findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { phoneNumber } });
}

async function collectMatchingUsers(
  profile: EcitizenProfile,
): Promise<User[]> {
  const matches = new Map<string, User>();
  const email = profile.email?.trim();
  const idNumber = profile.idNumber?.trim();
  const ecitizenId = profile.ecitizenId?.trim() || idNumber;
  const phoneNumber = normalizeEcitizenPhone(profile.mobileNumber);

  if (email) {
    const user = await findUserByEmail(email);
    if (user) {
      matches.set(user.id, user);
    }
  }

  if (idNumber) {
    const user = await findUserByIdNumber(idNumber);
    if (user) {
      matches.set(user.id, user);
    }
  }

  if (ecitizenId) {
    const user = await findUserByEcitizenId(ecitizenId);
    if (user) {
      matches.set(user.id, user);
    }
  }

  if (phoneNumber) {
    const user = await findUserByPhoneNumber(phoneNumber);
    if (user) {
      matches.set(user.id, user);
    }
  }

  return [...matches.values()];
}

function pickPrimaryUser(users: User[], preferredEmail?: string): User {
  if (preferredEmail) {
    const byEmail = users.find((user) => user.email === preferredEmail);
    if (byEmail) {
      return byEmail;
    }
  }

  const withEcitizen = users.find((user) => user.ecitizenId);
  if (withEcitizen) {
    return withEcitizen;
  }

  const withEmail = users.find((user) => user.email);
  if (withEmail) {
    return withEmail;
  }

  const withIdNumber = users.find((user) => user.idNumber);
  if (withIdNumber) {
    return withIdNumber;
  }

  return [...users].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  )[0]!;
}

async function mergeUsersIntoPrimary(
  primaryId: string,
  secondaryIds: string[],
): Promise<void> {
  if (secondaryIds.length === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const secondaryId of secondaryIds) {
      await tx.groupApplication.updateMany({
        where: { userId: secondaryId },
        data: { userId: primaryId },
      });

      await tx.otpRequest.updateMany({
        where: { userId: secondaryId },
        data: { userId: primaryId },
      });

      await tx.refreshToken.deleteMany({
        where: { userId: secondaryId },
      });

      // Release the unique phone before assigning it to the primary user.
      await tx.user.update({
        where: { id: secondaryId },
        data: { phoneNumber: null },
      });

      await tx.user.delete({
        where: { id: secondaryId },
      });
    }
  });
}

async function resolvePhoneNumberForUser(
  userId: string,
  phoneNumber: string | undefined,
  currentPhoneNumber: string | null | undefined,
): Promise<string | null | undefined> {
  if (!phoneNumber) {
    return currentPhoneNumber;
  }

  const phoneOwner = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!phoneOwner || phoneOwner.id === userId) {
    return phoneNumber;
  }

  return currentPhoneNumber ?? null;
}

export async function upsertEcitizenUser(
  profile: EcitizenProfile & { verifiedEmail?: string },
): Promise<User> {
  const email = profile.verifiedEmail?.trim() || profile.email?.trim() || undefined;
  const fullName = profile.name?.trim() || undefined;
  const phoneNumber = normalizeEcitizenPhone(profile.mobileNumber);
  const idNumber = profile.idNumber?.trim() || undefined;
  const kraPin = profile.kraPin?.trim() || undefined;
  const ecitizenId = profile.ecitizenId?.trim() || idNumber;

  const matchingUsers = await collectMatchingUsers({
    ...profile,
    email,
  });

  let user =
    matchingUsers.length > 0 ? pickPrimaryUser(matchingUsers, email) : null;

  if (matchingUsers.length > 1 && user) {
    const secondaryIds = matchingUsers
      .filter((candidate) => candidate.id !== user!.id)
      .map((candidate) => candidate.id);
    await mergeUsersIntoPrimary(user.id, secondaryIds);
    user = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  }

  if (user) {
    const resolvedPhoneNumber = await resolvePhoneNumberForUser(
      user.id,
      phoneNumber,
      user.phoneNumber,
    );

    return prisma.user.update({
      where: { id: user.id },
      data: {
        email: email ?? user.email,
        phoneNumber: resolvedPhoneNumber ?? user.phoneNumber,
        name: fullName || user.name,
        idNumber: idNumber ?? user.idNumber,
        kraPin: kraPin ?? user.kraPin,
        ecitizenId: ecitizenId ?? user.ecitizenId,
        identifierType: IdentifierType.ECITIZEN,
      },
    });
  }

  if (phoneNumber) {
    const phoneOwner = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (phoneOwner) {
      return prisma.user.update({
        where: { id: phoneOwner.id },
        data: {
          email: email ?? phoneOwner.email,
          phoneNumber,
          name: fullName || phoneOwner.name,
          idNumber: idNumber ?? phoneOwner.idNumber,
          kraPin: kraPin ?? phoneOwner.kraPin,
          ecitizenId: ecitizenId ?? phoneOwner.ecitizenId,
          identifierType: IdentifierType.ECITIZEN,
        },
      });
    }
  }

  return prisma.user.create({
    data: {
      email: email ?? null,
      phoneNumber: phoneNumber ?? null,
      name: fullName ?? null,
      idNumber: idNumber ?? null,
      kraPin: kraPin ?? null,
      ecitizenId: ecitizenId ?? null,
      identifierType: IdentifierType.ECITIZEN,
    },
  });
}
