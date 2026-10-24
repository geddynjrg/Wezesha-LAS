import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export type PhoneStatus = 'unique' | 'shared' | 'missing' | 'unchecked';

function phoneDigits(value?: string | null) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export async function phoneStatusFor(phone?: string | null): Promise<PhoneStatus> {
  const digits = phoneDigits(phone);
  const last9 = digits.slice(-9);
  if (last9.length !== 9) return 'missing';
  const rows = await prisma.$queryRaw<{ n: bigint | number }[]>`
    SELECT COUNT(*) AS n
    FROM users
    WHERE REPLACE(REPLACE(REPLACE(IFNULL(phoneNumber, ''), '+', ''), ' ', ''), '-', '') LIKE ${`%${last9}`}
  `;
  const count = Number(rows[0]?.n || 0);
  if (count > 1) return 'shared';
  if (count === 1) return 'unique';
  return 'missing';
}

/**
 * One row per email linking the Majuu user to whether Loans accepted the same password.
 * Local user tables stay in place.
 */
export async function upsertPortalIdentity(input: {
  email: string;
  phone?: string | null;
  majuuUserId?: string | null;
  loansLinked: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email) return;
  const phone = phoneDigits(input.phone) || null;
  const status = await phoneStatusFor(phone);
  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO portal_identities (
      id, email, phone_digits, majuu_user_id, loans_linked, phone_status, created_at, updated_at
    ) VALUES (
      ${id},
      ${email},
      ${phone},
      ${input.majuuUserId || null},
      ${input.loansLinked ? 1 : 0},
      ${status},
      NOW(3),
      NOW(3)
    )
    ON DUPLICATE KEY UPDATE
      phone_digits = COALESCE(VALUES(phone_digits), phone_digits),
      majuu_user_id = COALESCE(VALUES(majuu_user_id), majuu_user_id),
      loans_linked = IF(VALUES(loans_linked), TRUE, loans_linked),
      phone_status = VALUES(phone_status),
      updated_at = NOW(3)
  `;
}
