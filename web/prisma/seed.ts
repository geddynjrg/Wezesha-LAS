import { hashPassword } from '@/lib/auth/password';
import { seedLocations } from '../lib/locations/seed-locations';
import { prisma } from '../lib/prisma';
import { IdentifierType, UserRole } from '../generated/prisma';

const PS_ACCOUNTS = [
  {
    email: 'ps@labour.go.ke',
    name: 'Principal Secretary – Labour and Skills Development',
    role: UserRole.PS_LABOUR,
  },
  {
    email: 'ps@msme.go.ke',
    name: 'Principal Secretary – MSME Development',
    role: UserRole.PS_MSME,
  },
] as const;

async function seedPsUsers() {
  const passwordHash = await hashPassword(process.env.PS_SEED_PASSWORD ?? 'Uwezo100%');

  for (const account of PS_ACCOUNTS) {
    await prisma.user.upsert({
      where: { email: account.email },
      create: {
        email: account.email,
        passwordHash,
        name: account.name,
        identifierType: IdentifierType.EMAIL,
        role: account.role,
      },
      update: {
        passwordHash,
        name: account.name,
        role: account.role,
      },
    });
  }

  console.log('Principal Secretary accounts seeded.');
}

async function main() {
  await seedLocations();
  console.log('Location seed completed.');
  await seedPsUsers();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
