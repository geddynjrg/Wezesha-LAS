import {
  DATA_CONSENT_VERSION,
  parseConsentPayload,
  type DataConsentRecord,
} from '@/lib/data-consent';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function ensureTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS data_consents (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      userId VARCHAR(191) NULL,
      applicationId VARCHAR(191) NULL,
      version VARCHAR(64) NOT NULL,
      acceptedAt DATETIME(3) NOT NULL,
      ipAddress VARCHAR(64) NULL,
      userAgent VARCHAR(512) NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX data_consents_userId_idx (userId),
      INDEX data_consents_applicationId_idx (applicationId)
    )
  `);
}

function newId(): string {
  return `dc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ consented: false });
  }

  try {
    await ensureTable();
    const rows = await prisma.$queryRawUnsafe<
      Array<{ version: string; acceptedAt: Date }>
    >(
      `SELECT version, acceptedAt FROM data_consents
       WHERE userId = ? AND version = ?
       ORDER BY acceptedAt DESC LIMIT 1`,
      userId,
      DATA_CONSENT_VERSION,
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ consented: false });
    }
    return NextResponse.json({
      consented: true,
      version: row.version,
      acceptedAt: row.acceptedAt,
    });
  } catch (error) {
    console.error('[data-consent] GET failed', error);
    return NextResponse.json({ consented: false, soft: true });
  }
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  let body: DataConsentRecord;
  try {
    body = (await request.json()) as DataConsentRecord;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseConsentPayload(JSON.stringify(body));
  if (!parsed || parsed.version !== DATA_CONSENT_VERSION) {
    return NextResponse.json({ ok: false, error: 'Invalid consent payload' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;
  const userAgent = request.headers.get('user-agent')?.slice(0, 512) || null;

  try {
    await ensureTable();
    await prisma.$executeRawUnsafe(
      `INSERT INTO data_consents
        (id, userId, applicationId, version, acceptedAt, ipAddress, userAgent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      newId(),
      userId || parsed.userId || null,
      parsed.applicationId || null,
      DATA_CONSENT_VERSION,
      new Date(parsed.acceptedAt),
      ip,
      userAgent,
    );
    return NextResponse.json({ ok: true, persisted: 'db' });
  } catch (error) {
    console.error('[data-consent] POST failed', error);
    // Client already cached cookie/localStorage
    return NextResponse.json({ ok: true, persisted: 'client-only' });
  }
}
